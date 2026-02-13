import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCustomers } from "@/hooks/useCustomers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataCard } from "@/components/ui/data-card";
import {
    Save,
    ArrowLeft,
    User,
    MapPin,
    Phone,
    Mail,
    Building2,
    CreditCard,
    Trophy
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function CustomerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getCustomerById, createCustomer, updateCustomer } = useCustomers();
    const isNew = id === "new";

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        cif: "",
        sales_points: 0,
        address: "",
        postal_city: "",
        province: "",
        contact_name: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        if (!isNew && id) {
            const loadCustomer = async () => {
                setIsLoading(true);
                const customer = await getCustomerById(id);
                if (customer) {
                    setFormData({
                        name: customer.name || "",
                        cif: customer.cif || "",
                        sales_points: customer.sales_points || 0,
                        address: customer.address || "",
                        postal_city: customer.postal_city || "",
                        province: customer.province || "",
                        contact_name: customer.contact_name || "",
                        email: customer.email || "",
                        phone: customer.phone || ""
                    });
                } else {
                    toast.error("Cliente no encontrado");
                    navigate("/commercial/customers");
                }
                setIsLoading(false);
            };
            loadCustomer();
        }
    }, [id, isNew, navigate]); // Removed dependencies that might cause loop if they change

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("El nombre es obligatorio");
            return;
        }

        setIsSaving(true);
        try {
            if (isNew) {
                await createCustomer(formData);
                navigate("/commercial/customers");
            } else if (id) {
                await updateCustomer(id, formData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground">Cargando datos del cliente...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col h-full bg-slate-50/50">
                {/* Header */}
                <div className="flex-none flex items-center justify-between px-6 py-4 bg-background border-b shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/commercial/customers")}
                            className="h-8 w-8"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {isNew ? "Nuevo Cliente" : formData.name}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {isNew ? "Complete la ficha para registrar un nuevo cliente" : `ID: ${id}`}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
                        <Save className="h-4 w-4" />
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* General Info */}
                            <DataCard
                                title="Información General"
                                icon={<Building2 className="h-4 w-4" />}
                                className="h-full"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Razón Social / Nombre *</Label>
                                        <Input
                                            id="name"
                                            placeholder="Ej. Construcciones López S.L."
                                            value={formData.name}
                                            onChange={(e) => handleChange("name", e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cif" className="flex items-center gap-2">
                                                <CreditCard className="h-3 w-3 text-muted-foreground" />
                                                CIF / NIF
                                            </Label>
                                            <Input
                                                id="cif"
                                                placeholder="B-12345678"
                                                value={formData.cif}
                                                onChange={(e) => handleChange("cif", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="points" className="flex items-center gap-2">
                                                <Trophy className="h-3 w-3 text-amber-500" />
                                                Puntos de Venta
                                            </Label>
                                            <Input
                                                id="points"
                                                type="number"
                                                min="0"
                                                value={formData.sales_points}
                                                onChange={(e) => handleChange("sales_points", parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </DataCard>

                            {/* Contact Info */}
                            <DataCard
                                title="Contacto Principal"
                                icon={<User className="h-4 w-4" />}
                                className="h-full"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact">Persona de Contacto</Label>
                                        <Input
                                            id="contact"
                                            placeholder="Ej. Juan Pérez"
                                            value={formData.contact_name}
                                            onChange={(e) => handleChange("contact_name", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="contacto@empresa.com"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            Teléfono
                                        </Label>
                                        <Input
                                            id="phone"
                                            placeholder="+34 600 000 000"
                                            value={formData.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </DataCard>
                        </div>

                        {/* Location */}
                        <DataCard
                            title="Ubicación y Facturación"
                            icon={<MapPin className="h-4 w-4" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Dirección Fiscal</Label>
                                    <Input
                                        id="address"
                                        placeholder="C/ Principal, 12, Polígono Industrial..."
                                        value={formData.address}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ciudad / Población</Label>
                                    <Input
                                        id="city"
                                        placeholder="Ej. Madrid"
                                        value={formData.postal_city}
                                        onChange={(e) => handleChange("postal_city", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="province">Provincia / Región</Label>
                                    <Input
                                        id="province"
                                        placeholder="Ej. Madrid"
                                        value={formData.province}
                                        onChange={(e) => handleChange("province", e.target.value)}
                                    />
                                </div>
                            </div>
                        </DataCard>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
