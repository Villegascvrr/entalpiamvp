import type { ActorSession } from "@/contexts/ActorContext";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductDetailsInput,
} from "@/data/types";
import { supabase } from "@/lib/supabaseClient";

// ─────────────────────────────────────────────────────────────
// Supabase Admin Product Repository — WRITE ONLY
//
// All mutations to the product catalog live here.
// This file is intentionally separate from SupabaseProductRepository
// (read) to keep read and write paths isolated.
//
// Storage naming convention:
//   Images : products/imgs/{code}.jpg
//   PDFs   : products/pdfs/{language}/{code}.pdf
// ─────────────────────────────────────────────────────────────

const BUCKET = "products";

export class SupabaseAdminProductRepository {
  // ─────────────────────────────────────────────────────────────
  // Storage Helpers
  // ─────────────────────────────────────────────────────────────

  /**
   * Uploads a product image to storage and returns the public URL.
   * Uses upsert:true so re-uploads replace the existing file.
   */
  async uploadProductImage(code: string, file: File): Promise<string> {
    const path = `imgs/${code}.jpg`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: "image/jpeg" });

    if (error) {
      throw new Error(
        `[AdminProductRepo] Image upload failed for "${code}": ${error.message}`,
      );
    }

    return this._publicUrl(path);
  }

  /**
   * Uploads a product PDF for a specific language and returns the public URL.
   * Uses upsert:true so re-uploads replace the existing file.
   */
  async uploadProductPdf(
    code: string,
    language: string,
    file: File,
  ): Promise<string> {
    const path = `pdfs/${language}/${code}.pdf`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: "application/pdf" });

    if (error) {
      throw new Error(
        `[AdminProductRepo] PDF upload failed for "${code}" / ${language}: ${error.message}`,
      );
    }

    return this._publicUrl(path);
  }

  /**
   * Deletes a product image from storage. Non-fatal if the file doesn't exist.
   */
  async deleteProductImage(code: string): Promise<void> {
    await supabase.storage.from(BUCKET).remove([`imgs/${code}.jpg`]);
  }

  /**
   * Deletes a language-specific PDF from storage. Non-fatal if the file doesn't exist.
   */
  async deleteProductPdf(code: string, language: string): Promise<void> {
    await supabase.storage
      .from(BUCKET)
      .remove([`pdfs/${language}/${code}.pdf`]);
  }

  // ─────────────────────────────────────────────────────────────
  // Product CRUD
  // ─────────────────────────────────────────────────────────────

  /**
   * Creates a product in the following order:
   *  1. Upload image → get public URL
   *  2. Insert row in `products`
   *
   * If the image upload fails, the operation is aborted.
   * Callers should call upsertProductDetails() immediately after
   * to create the first language-specific row.
   *
   * @returns The UUID of the newly created product.
   */
  async createProduct(
    session: ActorSession,
    data: CreateProductInput,
  ): Promise<string> {
    // Step 1 — Upload image (abort if fails)
    const imageUrl = await this.uploadProductImage(data.code, data.imageFile);

    // Step 2 — Insert product row
    const { data: row, error } = await supabase
      .from("products")
      .insert({
        code: data.code,
        category_id: data.categoryId,
        tenant_id: session.tenantId,
        price: data.price,
        unit: data.unit,
        image_url: imageUrl,
        lot_size: data.lotSize,
        min_lots: data.minLots,
        is_active: data.isActive,
      })
      .select("id")
      .single();

    if (error) {
      // Image was uploaded but DB insert failed — clean up storage
      await this.deleteProductImage(data.code).catch(() => null);
      throw new Error(
        `[AdminProductRepo] Failed to insert product "${data.code}": ${error.message}`,
      );
    }

    return row.id;
  }

  /**
   * Updates mutable fields on an existing product.
   * If `imageFile` is provided, the image is replaced in storage first.
   */
  async updateProduct(
    _session: ActorSession,
    id: string,
    data: UpdateProductInput & { code?: string },
  ): Promise<void> {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.price !== undefined) updates.price = data.price;
    if (data.unit !== undefined) updates.unit = data.unit;
    if (data.lotSize !== undefined) updates.lot_size = data.lotSize;
    if (data.minLots !== undefined) updates.min_lots = data.minLots;
    if (data.isActive !== undefined) updates.is_active = data.isActive;

    // Replace image if a new file was provided
    if (data.imageFile && data.code) {
      const imageUrl = await this.uploadProductImage(
        data.code,
        data.imageFile,
      );
      updates.image_url = imageUrl;
    }

    const { error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id);

    if (error) {
      throw new Error(
        `[AdminProductRepo] Failed to update product "${id}": ${error.message}`,
      );
    }
  }

  /**
   * Deletes a product and all its product_details rows.
   * Storage files (image + PDFs) are NOT automatically removed here;
   * call deleteProductImage() / deleteProductPdf() separately if needed.
   * The FK on product_details will cascade the detail rows automatically
   * if the constraint includes ON DELETE CASCADE — otherwise they must
   * be removed first via deleteProductDetails().
   */
  async deleteProduct(_session: ActorSession, id: string): Promise<void> {
    // Delete all language details first (FK does NOT cascade atm)
    await supabase.from("product_details").delete().eq("product_id", id);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(
        `[AdminProductRepo] Failed to delete product "${id}": ${error.message}`,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Product Details Management
  // ─────────────────────────────────────────────────────────────

  /**
   * Inserts or updates a product_details row for a given language.
   *
   * If `pdfFile` is provided in details, the file is uploaded to storage
   * and safety_sheet_url is set to the returned public URL.
   * If no pdfFile is provided, safety_sheet_url defaults to "" (empty string).
   *
   * The UNIQUE(product_id, language) constraint on the DB side
   * ensures this is a true upsert — no duplicates possible.
   */
  async upsertProductDetails(
    _session: ActorSession,
    productId: string,
    code: string,
    details: ProductDetailsInput,
  ): Promise<void> {
    let safetySheetUrl = "";

    // Upload PDF if provided
    if (details.pdfFile) {
      safetySheetUrl = await this.uploadProductPdf(
        code,
        details.language,
        details.pdfFile,
      );
    } else {
      // Preserve existing URL if re-upserting without a new file
      const { data: existing } = await supabase
        .from("product_details")
        .select("safety_sheet_url")
        .eq("product_id", productId)
        .eq("language", details.language)
        .maybeSingle();

      safetySheetUrl = existing?.safety_sheet_url ?? "";
    }

    const { error } = await supabase.from("product_details").upsert(
      {
        product_id: productId,
        language: details.language,
        description: details.description,
        features: details.features,
        source_url: details.sourceUrl,
        safety_sheet_url: safetySheetUrl,
      },
      { onConflict: "product_id,language" },
    );

    if (error) {
      throw new Error(
        `[AdminProductRepo] Failed to upsert details for product "${productId}" / ${details.language}: ${error.message}`,
      );
    }
  }

  /**
   * Removes a specific language translation from product_details.
   * Also removes the associated PDF from storage.
   */
  async deleteProductDetails(
    _session: ActorSession,
    productId: string,
    code: string,
    language: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("product_details")
      .delete()
      .eq("product_id", productId)
      .eq("language", language);

    if (error) {
      throw new Error(
        `[AdminProductRepo] Failed to delete details for product "${productId}" / ${language}: ${error.message}`,
      );
    }

    // Best-effort: remove associated PDF from storage
    await this.deleteProductPdf(code, language).catch(() => null);
  }

  // ─────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────

  private _publicUrl(path: string): string {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
}
