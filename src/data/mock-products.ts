import type { Product, Category } from "./types";

// ─────────────────────────────────────────────────────────────
// Mock Product Catalog
// When backend is ready, replace with API calls.
// ─────────────────────────────────────────────────────────────

export const mockProducts: Product[] = [
    // 1. Refrigerantes
    { id: "REF-R32-9", name: "Refrigerante R32 - Botella 9kg", category: "Refrigerantes", price: 185.00, stock: 45, unit: "Botella", specs: "Gas puro R32 | UN3252 | GWP 675", image: "/r32-official.png" },
    { id: "REF-R134-12", name: "Refrigerante R-134a - Botella 12kg", category: "Refrigerantes", price: 210.50, stock: 120, unit: "Botella", specs: "HFC | UN3159 | Aire acondicionado automotriz", image: "/r134a-official.png" },
    { id: "REF-R1234ZE-10", name: "Refrigerante R-1234ze - Botella 10kg", category: "Refrigerantes", price: 420.00, stock: 15, unit: "Botella", specs: "HFO | UN3163 | Bajo GWP < 1", image: "/r1234ze-official.png" },
    { id: "REF-R1234YF-5", name: "Refrigerante R-1234yf - Botella 5kg", category: "Refrigerantes", price: 380.00, stock: 30, unit: "Botella", specs: "HFO | Sustituto R134a automotriz" },
    { id: "REF-R404A-10", name: "Refrigerante R-404a - Botella 10kg", category: "Refrigerantes", price: 245.00, stock: 55, unit: "Botella", specs: "Mezcla HFC | Alta/Media temperatura" },

    // 2. Cobre para refrigeración
    { id: "COB-REV-15", name: "Tubo de cobre sencillo con revestimiento PE 15mm", category: "Cobre para refrigeración", price: 8.40, stock: 500, unit: "m", specs: "Norma EN 12735-1 | Espesor 0.8mm" },
    { id: "COB-TUE-12", name: "Tubo de cobre sencillo con tuercas con revestimiento PE 1/2\"", category: "Cobre para refrigeración", price: 24.50, stock: 85, unit: "Set", specs: "Incluye tuercas abocinadas | 5m longitud" },
    { id: "COB-DOB-TUE-14", name: "Tubo de cobre doble con tuercas con revestimiento PE 1/4\"+3/8\"", category: "Cobre para refrigeración", price: 45.90, stock: 40, unit: "Set", specs: "Doble aislamiento | Listo para montaje" },
    { id: "COB-DOB-REV-12", name: "Tubo de cobre doble con revestimiento PE 1/2\"+3/8\"", category: "Cobre para refrigeración", price: 12.80, stock: 200, unit: "m", specs: "Bitubo aislado | Alta resistencia térmica" },

    // 3. Ventilación y accesorios
    { id: "VEN-COD-150", name: "Codos de ventilación estampados 90º Ø150", category: "Ventilación y accesorios", price: 15.20, stock: 1500, unit: "Ud", specs: "Acero galvanizado | Acabado estampado" },
    { id: "VEN-CON-AIS-200", name: "Conducto elástico aislado Ø200mm", category: "Ventilación y accesorios", price: 32.00, stock: 80, unit: "Caja", specs: "10m longitud | Aislamiento fibra de vidrio" },
    { id: "VEN-VAL-EV-100", name: "Válvula de extracción de aire EV Ø100", category: "Ventilación y accesorios", price: 12.50, stock: 300, unit: "Ud", specs: "Acabado RAL 9010 | Regulable" },
    { id: "VEN-VAL-VP-125", name: "Válvula de extracción de aire VP Ø125", category: "Ventilación y accesorios", price: 14.80, stock: 250, unit: "Ud", specs: "Cierre hermético | Accionamiento rápido" },
    { id: "VEN-ABR-SCP-150", name: "Abrazadera de montaje SCP-B Ø150", category: "Ventilación y accesorios", price: 4.20, stock: 500, unit: "Ud", specs: "Cierre por tornillo | Goma EPDM" },
    { id: "VEN-TOM-ELC-200", name: "Toma / salida de pared redonda ELC Ø200", category: "Ventilación y accesorios", price: 28.50, stock: 65, unit: "Ud", specs: "Rejilla protección | Alumino anodizado" },
    { id: "VEN-TAP-CAD-150", name: "Tapa de registro CAD-S Ø150", category: "Ventilación y accesorios", price: 9.90, stock: 120, unit: "Ud", specs: "Acceso estanco | Instalación conducto" },

    // 4. Climatización y accesorios
    { id: "CLI-SOP-SSW450", name: "Soporte del acondicionador de aire SSW 450 ICOOL", category: "Climatización y accesorios", price: 42.50, stock: 180, unit: "Par", specs: "Carga máx 140kg | Amortiguadores incluidos" },
    { id: "CLI-SOP-SRW450", name: "Soportes del acondicionador de aire SRW-450 ICOOL", category: "Climatización y accesorios", price: 38.00, stock: 220, unit: "Par", specs: "Techo/Suelo | Tratamiento anticorrosión" },
    { id: "CLI-TUB-EVA-20", name: "Tubo de evacuación condensado Ø20mm", category: "Climatización y accesorios", price: 1.15, stock: 2000, unit: "m", specs: "Flexible | Anti-UV | Doble capa" },
    { id: "CLI-CON-MON-STD", name: "Conjunto de montaje de climatización", category: "Climatización y accesorios", price: 75.00, stock: 45, unit: "Ud", specs: "Universal | Incluye soportes y canaleta" },
];

// ─────────────────────────────────────────────────────────────
// Categories — iterable array (not a fixed record)
// Icons are resolved by key in the consuming component.
// ─────────────────────────────────────────────────────────────

export const categories: Category[] = [
    {
        id: "Refrigerantes",
        label: "Refrigerantes",
        iconKey: "Thermometer",
        description: "Refrigerantes legales (F-GAS 517/2014) con certificado ISO. Sistema único de seguimiento de bombonas y laboratorio con cromatógrafo de alta calidad.",
        detailedText: "Entalpia Europe solo suministra refrigerantes de fuentes legales, respetando todas las normas de calidad y seguridad. Disponemos de un certificado de calidad ISO.\n\nComercializamos los refrigerantes de conformidad con la directiva F-GAS 517/2014 – TPED – CE – REACH. El cliente recibe, con el suministro de los refrigerantes, un juego de documentación, incluyendo la ficha de datos de seguridad del producto, preparada de conformidad con los reglamentos vigentes y aprobada por el Instituto de Química.\n\nNuestra planta de envasado de refrigerantes, moderna y totalmente segura, está localizada en Sieradz. En nuestra sede de Sieradz está localizado también un laboratorio equipado con modernos equipos, incluyendo un cromatógrafo de alta calidad.\n\nSuministramos una gama de refrigerantes con un amplio espectro de aplicación, entre otros, en instalaciones de climatización y refrigeración, bombas de calor, en el sector de los electrodomésticos, para las necesidades del mercado de la automoción y otras ramas de la industria.\n\nTenemos en nuestra oferta todos los refrigerantes más populares, incluyendo R1234yf, R1234ze, R134a, R32, R404a, R407c, R410a, R448a, R449a, R452a, R455a, R507, R513a.\n\nNuestras bombonas están debidamente etiquetadas. Disponemos de una gama completa de bombonas y depósitos de gran capacidad rellenables. Los envases retornables de Entalpia están sujetos a un sistema único de «seguimiento de la bombona».",
        image: "/refrigerantes.png",
    },
    {
        id: "Cobre para refrigeración",
        label: "Cobre para refrigeración",
        iconKey: "Layers",
        description: "Tuberías de cobre aisladas y desnudas para montaje de sistemas frigoríficos de alta precisión.",
        image: "/cobre-official.png",
    },
    {
        id: "Ventilación y accesorios",
        label: "Ventilación y accesorios",
        iconKey: "Wind",
        description: "Soluciones de transporte de aire, rejillas y extractores industriales.",
        image: "/ventilacion-official.png",
    },
    {
        id: "Climatización y accesorios",
        label: "Climatización y accesorios",
        iconKey: "Zap",
        description: "Soportería, bombas y elementos de montaje para equipos de aire acondicionado.",
        image: "/climatizacion-official.png",
    },
];

/** Helper: get products for a specific category */
export function getProductsByCategory(categoryId: string): Product[] {
    return mockProducts.filter(p => p.category === categoryId);
}

/** Helper: get unique category IDs from products */
export function getCategoryIds(): string[] {
    return Array.from(new Set(mockProducts.map(p => p.category)));
}
