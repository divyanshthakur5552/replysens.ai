import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/chat";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save, Building2, Clock, Users, Package } from "lucide-react";

// Business types
type BusinessType = "salon" | "therapist" | "seller";

// Service interface for Salon
interface SalonService {
  name: string;
  duration: number;
  price: number;
}

// Product interface for Seller
interface Product {
  name: string;
  price: number;
}

// Settings data interface
interface SettingsData {
  // Section 1: Business Profile
  businessName: string;
  businessType: BusinessType;
  aiTone: string;
  
  // Section 2: Services (varies by business type)
  salonServices: SalonService[];
  sessionDuration: number; // for therapist
  sessionPrice: number; // for therapist
  products: Product[]; // for seller
  
  // Section 3: Working Hours
  workingHoursStart: string;
  workingHoursEnd: string;
  
  // Section 4: Customer Info
  requiresCustomerInfo: boolean;
  customerInfoFields: {
    name: boolean;
    phone: boolean;
    address: boolean;
    issue: boolean;
  };
}

const defaultSettings: SettingsData = {
  businessName: "",
  businessType: "salon",
  aiTone: "professional",
  salonServices: [{ name: "", duration: 30, price: 0 }],
  sessionDuration: 60,
  sessionPrice: 0,
  products: [{ name: "", price: 0 }],
  workingHoursStart: "10:00",
  workingHoursEnd: "20:00",
  requiresCustomerInfo: true,
  customerInfoFields: {
    name: true,
    phone: true,
    address: false,
    issue: false,
  },
};

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("replysense-settings");
    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
    }
  }, []);

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("replysense-settings", JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save settings:", e);
    } finally {
      setSaving(false);
    }
  };

  // Salon service handlers
  const addSalonService = () => {
    setSettings(prev => ({
      ...prev,
      salonServices: [...prev.salonServices, { name: "", duration: 30, price: 0 }],
    }));
  };

  const removeSalonService = (index: number) => {
    setSettings(prev => ({
      ...prev,
      salonServices: prev.salonServices.filter((_, i) => i !== index),
    }));
  };

  const updateSalonService = (index: number, field: keyof SalonService, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      salonServices: prev.salonServices.map((service, i) =>
        i === index ? { ...service, [field]: value } : service
      ),
    }));
  };

  // Product handlers
  const addProduct = () => {
    setSettings(prev => ({
      ...prev,
      products: [...prev.products, { name: "", price: 0 }],
    }));
  };

  const removeProduct = (index: number) => {
    setSettings(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const updateProduct = (index: number, field: keyof Product, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      ),
    }));
  };

  // Section card component
  const SectionCard = ({ 
    title, 
    icon: Icon, 
    children 
  }: { 
    title: string; 
    icon: React.ElementType; 
    children: React.ReactNode 
  }) => (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div 
        style={{ 
          padding: "16px 20px", 
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}
      >
        <div 
          style={{ 
            width: "36px", 
            height: "36px", 
            borderRadius: "10px", 
            backgroundColor: "var(--primary)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}
        >
          <Icon style={{ width: "18px", height: "18px", color: "white" }} />
        </div>
        <h3 style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-primary)" }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: "20px" }}>
        {children}
      </div>
    </div>
  );

  // Input field wrapper
  const FormField = ({ 
    label, 
    children 
  }: { 
    label: string; 
    children: React.ReactNode 
  }) => (
    <div style={{ marginBottom: "16px" }}>
      <Label 
        style={{ 
          display: "block", 
          marginBottom: "8px", 
          color: "var(--text-secondary)",
          fontSize: "13px",
          fontWeight: 500
        }}
      >
        {label}
      </Label>
      {children}
    </div>
  );

  return (
    <div className="h-screen w-full flex bg-[var(--background)]">
      <ChatSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col bg-[var(--surface)] h-screen overflow-hidden">
        {/* Header */}
        <div 
          className="shrink-0 py-6 flex items-center justify-between" 
          style={{ paddingLeft: "24px", paddingRight: "24px" }}
        >
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Configure your business preferences
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "10px",
                backgroundColor: saved ? "var(--success)" : "var(--primary)",
                color: "white",
                fontWeight: 500,
                fontSize: "14px",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                transition: "all 0.2s ease"
              }}
            >
              <Save style={{ width: "16px", height: "16px" }} />
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Content - scrollable */}
        <div 
          className="flex-1 overflow-y-auto pb-8" 
          style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "8px" }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {/* Section 1: Business Profile */}
            <div style={{ marginBottom: "24px" }}>
              <SectionCard title="Business Profile" icon={Building2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Business Name">
                    <Input
                      value={settings.businessName}
                      onChange={(e) => setSettings(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Enter your business name"
                      style={{ 
                        backgroundColor: "var(--surface)", 
                        borderColor: "var(--border)",
                        color: "var(--text-primary)"
                      }}
                    />
                  </FormField>

                  <FormField label="Business Type">
                    <select
                      value={settings.businessType}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        businessType: e.target.value as BusinessType 
                      }))}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "8px",
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        cursor: "pointer"
                      }}
                    >
                      <option value="salon">Salon</option>
                      <option value="therapist">Therapist</option>
                      <option value="seller">Seller</option>
                    </select>
                  </FormField>

                  <FormField label="AI Tone">
                    <select
                      value={settings.aiTone}
                      onChange={(e) => setSettings(prev => ({ ...prev, aiTone: e.target.value }))}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "8px",
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        cursor: "pointer"
                      }}
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                    </select>
                  </FormField>
                </div>
              </SectionCard>
            </div>

            {/* Section 2: Services (Dynamic based on business type) */}
            <div style={{ marginBottom: "24px" }}>
              <SectionCard title="Services" icon={Package}>
                {settings.businessType === "salon" && (
                  <div>
                    <div 
                      style={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 120px 120px 50px", 
                        gap: "12px",
                        marginBottom: "12px",
                        paddingBottom: "8px",
                        borderBottom: "1px solid var(--border)"
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                        Service
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                        Duration (min)
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                        Price (₹)
                      </span>
                      <span></span>
                    </div>
                    
                    {settings.salonServices.map((service, index) => (
                      <div 
                        key={index}
                        style={{ 
                          display: "grid", 
                          gridTemplateColumns: "1fr 120px 120px 50px", 
                          gap: "12px",
                          marginBottom: "12px",
                          alignItems: "center"
                        }}
                      >
                        <Input
                          value={service.name}
                          onChange={(e) => updateSalonService(index, "name", e.target.value)}
                          placeholder="e.g., Haircut"
                          style={{ 
                            backgroundColor: "var(--surface)", 
                            borderColor: "var(--border)",
                            color: "var(--text-primary)"
                          }}
                        />
                        <Input
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateSalonService(index, "duration", parseInt(e.target.value) || 0)}
                          placeholder="30"
                          style={{ 
                            backgroundColor: "var(--surface)", 
                            borderColor: "var(--border)",
                            color: "var(--text-primary)"
                          }}
                        />
                        <Input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateSalonService(index, "price", parseInt(e.target.value) || 0)}
                          placeholder="200"
                          style={{ 
                            backgroundColor: "var(--surface)", 
                            borderColor: "var(--border)",
                            color: "var(--text-primary)"
                          }}
                        />
                        <button
                          onClick={() => removeSalonService(index)}
                          disabled={settings.salonServices.length <= 1}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            backgroundColor: settings.salonServices.length <= 1 ? "var(--surface)" : "var(--error)",
                            opacity: settings.salonServices.length <= 1 ? 0.5 : 1,
                            border: "none",
                            cursor: settings.salonServices.length <= 1 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Trash2 style={{ width: "16px", height: "16px", color: "white" }} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={addSalonService}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        backgroundColor: "transparent",
                        border: "1px dashed var(--border)",
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                        cursor: "pointer",
                        marginTop: "8px",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = "var(--primary)";
                        e.currentTarget.style.color = "var(--primary)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      <Plus style={{ width: "16px", height: "16px" }} />
                      Add Service
                    </button>
                  </div>
                )}

                {settings.businessType === "therapist" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Session Duration (minutes)">
                      <Input
                        type="number"
                        value={settings.sessionDuration}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          sessionDuration: parseInt(e.target.value) || 0 
                        }))}
                        placeholder="60"
                        style={{ 
                          backgroundColor: "var(--surface)", 
                          borderColor: "var(--border)",
                          color: "var(--text-primary)"
                        }}
                      />
                    </FormField>

                    <FormField label="Price per Session (₹)">
                      <Input
                        type="number"
                        value={settings.sessionPrice}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          sessionPrice: parseInt(e.target.value) || 0 
                        }))}
                        placeholder="1000"
                        style={{ 
                          backgroundColor: "var(--surface)", 
                          borderColor: "var(--border)",
                          color: "var(--text-primary)"
                        }}
                      />
                    </FormField>
                  </div>
                )}

                {settings.businessType === "seller" && (
                  <div>
                    <div 
                      style={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 150px 50px", 
                        gap: "12px",
                        marginBottom: "12px",
                        paddingBottom: "8px",
                        borderBottom: "1px solid var(--border)"
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                        Product
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                        Price (₹)
                      </span>
                      <span></span>
                    </div>
                    
                    {settings.products.map((product, index) => (
                      <div 
                        key={index}
                        style={{ 
                          display: "grid", 
                          gridTemplateColumns: "1fr 150px 50px", 
                          gap: "12px",
                          marginBottom: "12px",
                          alignItems: "center"
                        }}
                      >
                        <Input
                          value={product.name}
                          onChange={(e) => updateProduct(index, "name", e.target.value)}
                          placeholder="e.g., Handmade Soap"
                          style={{ 
                            backgroundColor: "var(--surface)", 
                            borderColor: "var(--border)",
                            color: "var(--text-primary)"
                          }}
                        />
                        <Input
                          type="number"
                          value={product.price}
                          onChange={(e) => updateProduct(index, "price", parseInt(e.target.value) || 0)}
                          placeholder="150"
                          style={{ 
                            backgroundColor: "var(--surface)", 
                            borderColor: "var(--border)",
                            color: "var(--text-primary)"
                          }}
                        />
                        <button
                          onClick={() => removeProduct(index)}
                          disabled={settings.products.length <= 1}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            backgroundColor: settings.products.length <= 1 ? "var(--surface)" : "var(--error)",
                            opacity: settings.products.length <= 1 ? 0.5 : 1,
                            border: "none",
                            cursor: settings.products.length <= 1 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Trash2 style={{ width: "16px", height: "16px", color: "white" }} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={addProduct}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        backgroundColor: "transparent",
                        border: "1px dashed var(--border)",
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                        cursor: "pointer",
                        marginTop: "8px",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = "var(--primary)";
                        e.currentTarget.style.color = "var(--primary)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      <Plus style={{ width: "16px", height: "16px" }} />
                      Add Product
                    </button>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Section 3: Working Hours */}
            <div style={{ marginBottom: "24px" }}>
              <SectionCard title="Working Hours" icon={Clock}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Start Time">
                    <Input
                      type="time"
                      value={settings.workingHoursStart}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        workingHoursStart: e.target.value 
                      }))}
                      style={{ 
                        backgroundColor: "var(--surface)", 
                        borderColor: "var(--border)",
                        color: "var(--text-primary)"
                      }}
                    />
                  </FormField>

                  <FormField label="End Time">
                    <Input
                      type="time"
                      value={settings.workingHoursEnd}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        workingHoursEnd: e.target.value 
                      }))}
                      style={{ 
                        backgroundColor: "var(--surface)", 
                        borderColor: "var(--border)",
                        color: "var(--text-primary)"
                      }}
                    />
                  </FormField>
                </div>
              </SectionCard>
            </div>

            {/* Section 4: Customer Info Toggle */}
            <div style={{ marginBottom: "24px" }}>
              <SectionCard title="Customer Information" icon={Users}>
                <div style={{ marginBottom: "20px" }}>
                  <div 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "12px",
                      padding: "16px",
                      backgroundColor: "var(--surface)",
                      borderRadius: "10px",
                      border: "1px solid var(--border)"
                    }}
                  >
                    <Checkbox
                      id="requiresCustomerInfo"
                      checked={settings.requiresCustomerInfo}
                      onCheckedChange={(checked) => setSettings(prev => ({ 
                        ...prev, 
                        requiresCustomerInfo: checked === true 
                      }))}
                    />
                    <Label 
                      htmlFor="requiresCustomerInfo"
                      style={{ 
                        color: "var(--text-primary)", 
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      Require customer information for bookings
                    </Label>
                  </div>
                </div>

                {settings.requiresCustomerInfo && (
                  <div>
                    <p style={{ 
                      fontSize: "13px", 
                      color: "var(--text-secondary)", 
                      marginBottom: "16px" 
                    }}>
                      Select the information fields you want to collect:
                    </p>
                    
                    <div 
                      style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(2, 1fr)", 
                        gap: "12px" 
                      }}
                    >
                      {[
                        { key: "name", label: "Name" },
                        { key: "phone", label: "Phone Number" },
                        { key: "address", label: "Address" },
                        { key: "issue", label: "Issue / Notes" },
                      ].map((field) => (
                        <div 
                          key={field.key}
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "12px",
                            padding: "12px 16px",
                            backgroundColor: "var(--surface)",
                            borderRadius: "8px",
                            border: "1px solid var(--border)"
                          }}
                        >
                          <Checkbox
                            id={`field-${field.key}`}
                            checked={settings.customerInfoFields[field.key as keyof typeof settings.customerInfoFields]}
                            onCheckedChange={(checked) => setSettings(prev => ({
                              ...prev,
                              customerInfoFields: {
                                ...prev.customerInfoFields,
                                [field.key]: checked === true
                              }
                            }))}
                          />
                          <Label 
                            htmlFor={`field-${field.key}`}
                            style={{ 
                              color: "var(--text-primary)", 
                              cursor: "pointer",
                              fontSize: "14px"
                            }}
                          >
                            {field.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Footer spacer */}
            <div style={{ height: "60px" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
