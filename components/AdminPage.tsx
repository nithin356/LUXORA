import React, { useState, useEffect } from "react";
import { fleetService } from "../services/fleetService";
import { bookingService, BookingEnquiry } from "../services/bookingService";
import { Car, CarCategory, FleetTier } from "../types";

type MainCategory =
  | "Cars"
  | "Flights"
  | "Yachts"
  | "Properties"
  | "Luxury Products"
  | "Enquiries";

const AdminPage: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("luxora_admin_auth") === "true";
  });
  const [loginData, setLoginData] = useState({ userId: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Navigation State
  const [activeMainCategory, setActiveMainCategory] =
    useState<MainCategory | null>(null);
  const [activeCarSubCategory, setActiveCarSubCategory] =
    useState<CarCategory>("Chauffeur Driven");

  // Fleet Management State
  const [fleet, setFleet] = useState<Car[]>([]);
  const [enquiries, setEnquiries] = useState<BookingEnquiry[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState<Partial<Car>>({
    brand: "",
    model: "",
    type: "Luxury",
    category: "Chauffeur Driven",
    fleetTier: "Normal",
    seats: 4,
    image: "",
    images: [],
    pricePerHour: 1000,
    description: "",
    features: [],
    vipOptions: {
      bodyguard: false,
      personalConcierge: false,
      premiumRefreshments: false,
      customRoute: false,
    },
  });

  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      refreshFleet();
    }
  }, [isAuthenticated]);

  const refreshFleet = async () => {
    const [fleetData, enquiriesData] = await Promise.all([
      fleetService.getFleet(),
      bookingService.getEnquiries(),
    ]);
    setFleet(fleetData);
    setEnquiries(enquiriesData);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.userId === "guru" && loginData.password === "admin123") {
      setIsAuthenticated(true);
      localStorage.setItem("luxora_admin_auth", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Access Denied.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "seats" || name === "pricePerHour" ? Number(value) : value,
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addFeature = () => {
    if (
      featureInput.trim() &&
      !formData.features?.includes(featureInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()],
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.filter((f) => f !== feature),
    }));
  };

  const handleVipOptionChange = (
    option: keyof Exclude<Car["vipOptions"], undefined>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      vipOptions: {
        ...prev.vipOptions,
        [option]: !prev.vipOptions?.[option],
      },
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);

      files.forEach((file: any) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      if (errors.images) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.images;
          return newErrors;
        });
      }
    }
  };

  const removePreview = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images?.filter((_, i) => i !== index),
      }));
    } else {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.brand?.trim()) newErrors.brand = "Brand is required";
    if (!formData.model?.trim()) newErrors.model = "Model is required";
    if (!formData.description?.trim())
      newErrors.description = "Description is required";
    if (!formData.pricePerHour || formData.pricePerHour <= 0)
      newErrors.pricePerHour = "Valid price is required";

    const hasImages =
      (formData.images && formData.images.length > 0) ||
      selectedFiles.length > 0 ||
      formData.image;
    if (!hasImages) newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsProcessing(true);

    const data = new FormData();
    selectedFiles.forEach((file: any) => {
      data.append("imageFiles", file as Blob);
    });
    data.append("carData", JSON.stringify(formData));

    try {
      if (isEditing) {
        const targetId = isEditing; // Capture ID to prevent race conditions
        const updatedCar = await fleetService.updateCar(targetId, data);
        if (updatedCar) {
          setFleet((prev) =>
            prev.map((c) => (c.id === targetId ? updatedCar : c)),
          );
          resetForm();
        } else {
          throw new Error("Server returned null during update");
        }
      } else {
        const newCar = await fleetService.addCar(data);
        if (newCar) {
          setFleet((prev) => [...prev, newCar]);
          resetForm();
        } else {
          throw new Error("Server returned null during addition");
        }
      }

      // Secondary sync to ensure consistency
      setTimeout(() => refreshFleet(), 700);
    } catch (err) {
      console.error(err);
      alert("Error saving luxury asset.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (car: Car) => {
    setFormData(car);
    setIsEditing(car.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this vehicle from the elite fleet?",
      )
    ) {
      await fleetService.deleteCar(id);
      await refreshFleet();
    }
  };

  const resetForm = () => {
    setFormData({
      brand: "",
      model: "",
      type: "Luxury",
      category: activeCarSubCategory,
      fleetTier: "Normal",
      seats: 4,
      image: "",
      images: [],
      pricePerHour: 1000,
      description: "",
      features: [],
      vipOptions: {
        bodyguard: false,
        personalConcierge: false,
        premiumRefreshments: false,
        customRoute: false,
      },
    });
    setSelectedFiles([]);
    setPreviews([]);
    setErrors({});
    setIsEditing(null);
    setShowForm(false);
  };

  const filteredFleet = fleet.filter(
    (car) => car.category === activeCarSubCategory,
  );

  // Login View
  if (!isAuthenticated) {
    return (
      <section className="min-h-screen bg-luxora-dark flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md bg-luxora-charcoal border border-luxora-gold/20 p-10 rounded-sm shadow-2xl">
          <div className="text-center mb-10">
            <img
              src="/logo_Lg.png"
              alt="Luxora Logo"
              className="h-20 w-auto mx-auto mb-8 object-contain"
            />
            <h2 className="text-3xl font-serif font-bold gold-text uppercase tracking-widest mb-2">
              Admin Login
            </h2>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
              Authorized Personnel Only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">
                User ID
              </label>
              <input
                required
                type="text"
                value={loginData.userId}
                onChange={(e) =>
                  setLoginData({ ...loginData, userId: e.target.value })
                }
                className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:border-luxora-gold outline-none transition-all"
                placeholder="Enter ID"
              />
            </div>
            <div>
              <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">
                Security Password
              </label>
              <input
                required
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:border-luxora-gold outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <p className="text-red-500 text-[10px] uppercase tracking-widest text-center animate-pulse">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 gold-gradient text-luxora-dark font-bold uppercase tracking-widest rounded-sm shadow-xl hover:opacity-90 transition-all active:scale-[0.98]"
            >
              Unlock Portal
            </button>
          </form>

          <div className="mt-8 text-center text-white/20 text-[8px] uppercase tracking-[0.4em]">
            Luxora Central Security Hub
          </div>
        </div>
      </section>
    );
  }

  // Dashboard Selector Screen
  if (activeMainCategory === null) {
    return (
      <section className="min-h-screen bg-luxora-dark pt-20 pb-8 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="container mx-auto text-center">
          <div className="w-20 h-20 border-2 border-luxora-gold rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-luxora-gold font-serif font-bold text-3xl">
              L
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white uppercase tracking-widest mb-4">
            Luxora <span className="gold-text">Central</span>
          </h2>
          <p className="text-white/30 text-[10px] sm:text-xs uppercase tracking-[0.5em] mb-12 sm:mb-24">
            Enterprise Resource Management
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto px-2">
            {/* Cars Module */}
            <button
              onClick={() => setActiveMainCategory("Cars")}
              className="group relative bg-luxora-charcoal border border-white/5 p-6 sm:p-8 hover:border-luxora-gold/50 transition-all duration-500 text-center flex flex-col items-center"
            >
              <div className="text-3xl sm:text-5xl mb-4 sm:mb-8 group-hover:scale-110 transition-transform text-luxora-gold">
                🏎️
              </div>
              <h3 className="text-lg sm:text-2xl font-serif text-white mb-2 uppercase tracking-widest">
                Cars
              </h3>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-8">
                Fleet & Inventory
              </p>
              <div className="w-12 h-[1px] bg-luxora-gold/30 group-hover:w-24 transition-all"></div>
              <span className="absolute top-4 right-4 text-[10px] text-luxora-gold/40 font-bold uppercase">
                Active
              </span>
            </button>

            {/* Enquiries Module */}
            <button
              onClick={() => setActiveMainCategory("Enquiries")}
              className="group relative bg-luxora-charcoal border border-white/5 p-12 hover:border-luxora-gold/50 transition-all duration-500 text-center flex flex-col items-center"
            >
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform text-luxora-gold">
                📩
              </div>
              <h3 className="text-2xl font-serif text-white mb-2 uppercase tracking-widest">
                Enquiries
              </h3>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-8">
                Booking Requests
              </p>
              <div className="w-12 h-[1px] bg-luxora-gold/30 group-hover:w-24 transition-all"></div>
              {enquiries.some((e) => e.status === "pending") && (
                <span className="absolute top-4 right-4 bg-red-500 px-2 py-1 text-[8px] text-white font-bold uppercase rounded-sm">
                  New
                </span>
              )}
            </button>

            {/* Flights Module */}
            <button
              onClick={() => setActiveMainCategory("Flights")}
              className="group relative bg-luxora-charcoal border border-white/5 p-12 hover:border-luxora-gold/50 transition-all duration-500 text-center flex flex-col items-center"
            >
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform text-luxora-gold">
                ✈️
              </div>
              <h3 className="text-2xl font-serif text-white mb-2 uppercase tracking-widest">
                Flights
              </h3>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-8">
                Chartered Aviation
              </p>
              <div className="w-12 h-[1px] bg-luxora-gold/30 group-hover:w-24 transition-all"></div>
              <div className="mt-4 px-3 py-1 bg-luxora-gold text-luxora-dark text-[8px] font-bold uppercase tracking-widest rounded-full">
                Coming Soon
              </div>
            </button>

            {/* Yachts Module */}
            <button
              onClick={() => setActiveMainCategory("Yachts")}
              className="group relative bg-luxora-charcoal border border-white/5 p-12 hover:border-luxora-gold/50 transition-all duration-500 text-center flex flex-col items-center"
            >
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform text-luxora-gold">
                🛥️
              </div>
              <h3 className="text-2xl font-serif text-white mb-2 uppercase tracking-widest">
                Yachts
              </h3>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-8">
                Maritime Service
              </p>
              <div className="w-12 h-[1px] bg-luxora-gold/30 group-hover:w-24 transition-all"></div>
              <div className="mt-4 px-3 py-1 bg-luxora-gold text-luxora-dark text-[8px] font-bold uppercase tracking-widest rounded-full">
                Coming Soon
              </div>
            </button>

            {/* Properties Module */}
            <button
              onClick={() => setActiveMainCategory("Properties")}
              className="group relative bg-luxora-charcoal border border-white/5 p-12 hover:border-luxora-gold/50 transition-all duration-500 text-center flex flex-col items-center"
            >
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform text-luxora-gold">
                🏨
              </div>
              <h3 className="text-2xl font-serif text-white mb-2 uppercase tracking-widest">
                Properties
              </h3>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-8">
                Estates & Sales
              </p>
              <div className="w-12 h-[1px] bg-luxora-gold/30 group-hover:w-24 transition-all"></div>
              <div className="mt-4 px-3 py-1 bg-luxora-gold text-luxora-dark text-[8px] font-bold uppercase tracking-widest rounded-full">
                Coming Soon
              </div>
            </button>

            {/* Luxury Products Module */}
            <button
              onClick={() => setActiveMainCategory("Luxury Products")}
              className="group relative bg-luxora-charcoal border border-white/5 p-12 hover:border-luxora-gold/50 transition-all duration-500 text-center flex flex-col items-center"
            >
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform text-luxora-gold">
                💎
              </div>
              <h3 className="text-2xl font-serif text-white mb-2 uppercase tracking-widest">
                Luxury Goods
              </h3>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-8">
                Exclusive Products
              </p>
              <div className="w-12 h-[1px] bg-luxora-gold/30 group-hover:w-24 transition-all"></div>
              <div className="mt-4 px-3 py-1 bg-luxora-gold text-luxora-dark text-[8px] font-bold uppercase tracking-widest rounded-full">
                Coming Soon
              </div>
            </button>
          </div>

          <div className="mt-32">
            <button
              onClick={() => {
                setIsAuthenticated(false);
                localStorage.removeItem("luxora_admin_auth");
              }}
              className="text-red-500/40 hover:text-red-500 text-[10px] uppercase tracking-widest transition-colors font-bold"
            >
              Terminate Session
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-luxora-dark pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Module Header & Breadcrumb */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 lg:mb-12 gap-4 lg:gap-8 pb-6 lg:pb-8 border-b border-white/5">
          <div className="flex items-center gap-3 lg:gap-6 w-full">
            <button
              onClick={() => setActiveMainCategory(null)}
              className="w-8 h-8 lg:w-10 lg:h-10 border border-white/10 flex items-center justify-center hover:border-luxora-gold hover:text-luxora-gold transition-all flex-shrink-0"
              title="Back to Dashboard"
            >
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <span className="text-luxora-gold font-serif italic text-[10px] mb-1 block">
                Module Administration
              </span>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-serif font-bold text-white uppercase tracking-widest truncate">
                {activeMainCategory} <span className="text-white">Hub</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 sm:gap-2 w-full lg:w-auto">
            <button
              onClick={() => setActiveMainCategory(null)}
              className="px-2 sm:px-4 py-2 border border-white/10 text-white/40 uppercase tracking-widest text-[8px] sm:text-[10px] font-bold hover:text-white transition-all flex-1 sm:flex-none"
            >
              Switch
            </button>
            <button
              onClick={async () => {
                if (
                  window.confirm(
                    "Delete all inventory and start with a clean slate?",
                  )
                ) {
                  await fleetService.resetFleet();
                  window.location.reload();
                }
              }}
              className="px-2 sm:px-4 py-2 border border-orange-900/10 text-orange-500/40 uppercase tracking-widest text-[8px] sm:text-[10px] hover:text-orange-500 transition-all font-bold flex-1 sm:flex-none"
            >
              Clear
            </button>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                localStorage.removeItem("luxora_admin_auth");
              }}
              className="px-2 sm:px-4 py-2 border border-red-900/10 text-red-500/30 uppercase tracking-widest text-[8px] sm:text-[10px] hover:text-red-500 transition-all font-bold flex-1 sm:flex-none"
            >
              Logout
            </button>
          </div>
        </div>

        {activeMainCategory === "Cars" ? (
          <>
            {/* Sub-category selection */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12">
              {(
                ["Chauffeur Driven", "Monthly Rental", "Sales"] as CarCategory[]
              ).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveCarSubCategory(sub)}
                  className={`px-3 sm:px-6 py-2 border rounded-full text-[8px] sm:text-[10px] uppercase tracking-widest transition-all ${
                    activeCarSubCategory === sub
                      ? "border-luxora-gold text-luxora-gold bg-luxora-gold/5"
                      : "border-white/10 text-white/30 hover:border-white/20"
                  }`}
                >
                  {sub}{" "}
                  {sub === "Chauffeur Driven"
                    ? "Fleet"
                    : sub === "Monthly Rental"
                      ? "Cars"
                      : "Sales"}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
              <h3 className="text-lg sm:text-2xl font-serif text-white uppercase tracking-wider">
                {activeCarSubCategory}{" "}
                <span className="text-luxora-gold/50 ml-1 sm:ml-2">
                  Inventory
                </span>
              </h3>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
                className="w-full sm:w-auto px-4 sm:px-8 py-3 gold-gradient text-luxora-dark font-bold uppercase tracking-widest text-[10px] rounded-sm shadow-xl hover:opacity-90 transition-all"
              >
                {showForm ? "Cancel" : "Add New Asset"}
              </button>
            </div>

            {showForm && (
              <div className="bg-luxora-charcoal border border-luxora-gold/20 p-4 sm:p-8 rounded-sm mb-8 sm:mb-16 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 border-b border-white/5 pb-4">
                  <h3 className="text-lg sm:text-2xl font-serif text-white">
                    {isEditing
                      ? "Update Asset Particulars"
                      : "Register New Luxury Asset"}
                  </h3>
                  <div className="bg-luxora-gold/10 px-3 py-1 border border-luxora-gold/20">
                    <span className="text-luxora-gold text-[10px] uppercase tracking-widest font-bold">
                      {activeCarSubCategory}
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                >
                  <div className="space-y-6">
                    <div>
                      <label
                        className={`block text-[10px] uppercase tracking-widest mb-2 font-bold ${errors.brand ? "text-red-500" : "text-white/40"}`}
                      >
                        Brand Name
                      </label>
                      <input
                        required
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className={`w-full bg-luxora-dark border ${errors.brand ? "border-red-500/50" : "border-white/10"} p-3 text-white focus:border-luxora-gold outline-none transition-all`}
                        placeholder="e.g. Rolls Royce"
                      />
                      {errors.brand && (
                        <p className="text-red-500 text-[8px] mt-1 uppercase tracking-widest">
                          {errors.brand}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className={`block text-[10px] uppercase tracking-widest mb-2 font-bold ${errors.model ? "text-red-500" : "text-white/40"}`}
                      >
                        Model
                      </label>
                      <input
                        required
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        className={`w-full bg-luxora-dark border ${errors.model ? "border-red-500/50" : "border-white/10"} p-3 text-white focus:border-luxora-gold outline-none transition-all`}
                        placeholder="e.g. Phantom VIII"
                      />
                      {errors.model && (
                        <p className="text-red-500 text-[8px] mt-1 uppercase tracking-widest">
                          {errors.model}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">
                        Asset Class
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:border-luxora-gold outline-none transition-all"
                      >
                        <option value="Luxury">Ultra-Luxury</option>
                        <option value="Sedan">Executive Sedan</option>
                        <option value="SUV">Elite SUV</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">
                        Fleet Tier
                      </label>
                      <select
                        name="fleetTier"
                        value={formData.fleetTier || "Normal"}
                        onChange={handleInputChange}
                        className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:border-luxora-gold outline-none transition-all"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Elite">Elite</option>
                        <option value="Platinum">Platinum</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label
                        className={`block text-[10px] uppercase tracking-widest mb-2 font-bold ${errors.pricePerHour ? "text-red-500" : "text-white/40"}`}
                      >
                        Pricing (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                          ₹
                        </span>
                        <input
                          required
                          type="number"
                          name="pricePerHour"
                          value={formData.pricePerHour}
                          onChange={handleInputChange}
                          className={`w-full bg-luxora-dark border ${errors.pricePerHour ? "border-red-500/50" : "border-white/10"} p-3 pl-8 text-white focus:border-luxora-gold outline-none transition-all`}
                        />
                      </div>
                      {errors.pricePerHour && (
                        <p className="text-red-500 text-[8px] mt-1 uppercase tracking-widest">
                          {errors.pricePerHour}
                        </p>
                      )}
                      <p className="mt-1 text-[8px] text-white/20 uppercase tracking-widest">
                        {activeCarSubCategory === "Sales"
                          ? "Total Price"
                          : "Rate Per Period"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">
                        Seating Capacity
                      </label>
                      <input
                        required
                        type="number"
                        name="seats"
                        value={formData.seats}
                        onChange={handleInputChange}
                        className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:border-luxora-gold outline-none transition-all"
                      />
                    </div>
                    {formData.fleetTier === "VIP" && (
                      <div>
                        <label className="block text-luxora-gold text-[10px] uppercase tracking-widest mb-3 font-bold">
                          VIP Package Options
                        </label>
                        <div className="space-y-2 bg-luxora-dark/40 p-3 border border-luxora-gold/20 rounded-sm">
                          <label className="flex items-center gap-3 cursor-pointer hover:text-luxora-gold transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.vipOptions?.bodyguard || false}
                              onChange={() =>
                                handleVipOptionChange("bodyguard")
                              }
                              className="w-4 h-4 accent-luxora-gold"
                            />
                            <span className="text-white/80 text-[10px] uppercase tracking-widest font-bold">
                              Professional Bodyguard
                            </span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer hover:text-luxora-gold transition-colors">
                            <input
                              type="checkbox"
                              checked={
                                formData.vipOptions?.personalConcierge || false
                              }
                              onChange={() =>
                                handleVipOptionChange("personalConcierge")
                              }
                              className="w-4 h-4 accent-luxora-gold"
                            />
                            <span className="text-white/80 text-[10px] uppercase tracking-widest font-bold">
                              Personal Concierge
                            </span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer hover:text-luxora-gold transition-colors">
                            <input
                              type="checkbox"
                              checked={
                                formData.vipOptions?.premiumRefreshments ||
                                false
                              }
                              onChange={() =>
                                handleVipOptionChange("premiumRefreshments")
                              }
                              className="w-4 h-4 accent-luxora-gold"
                            />
                            <span className="text-white/80 text-[10px] uppercase tracking-widest font-bold">
                              Premium Refreshments
                            </span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer hover:text-luxora-gold transition-colors">
                            <input
                              type="checkbox"
                              checked={
                                formData.vipOptions?.customRoute || false
                              }
                              onChange={() =>
                                handleVipOptionChange("customRoute")
                              }
                              className="w-4 h-4 accent-luxora-gold"
                            />
                            <span className="text-white/80 text-[10px] uppercase tracking-widest font-bold">
                              Custom Route Planning
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                    <div>
                      <label
                        className={`block text-[10px] uppercase tracking-widest mb-2 font-bold ${errors.images ? "text-red-500" : "text-white/40"}`}
                      >
                        Asset Gallery
                      </label>
                      <div
                        className={`bg-luxora-dark border-2 border-dashed ${errors.images ? "border-red-500/20" : "border-white/5"} p-4 text-center`}
                      >
                        <div className="flex flex-col items-center gap-4">
                          <input
                            type="file"
                            id="file-upload"
                            accept="image/*"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer px-6 py-3 border border-luxora-gold/20 text-[10px] uppercase tracking-widest hover:bg-luxora-gold hover:text-luxora-dark transition-all font-bold"
                          >
                            Add Images
                          </label>

                          {/* Gallery Preview */}
                          {(previews.length > 0 ||
                            (formData.images &&
                              formData.images.length > 0)) && (
                            <div className="grid grid-cols-4 gap-2 w-full mt-4 max-h-40 overflow-y-auto p-2 bg-black/20">
                              {/* Existing server images */}
                              {formData.images?.map((img, idx) => (
                                <div
                                  key={`exist-${idx}`}
                                  className="relative aspect-square border border-white/10 group/img"
                                >
                                  <img
                                    src={img}
                                    className="w-full h-full object-cover"
                                    alt="Preview"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removePreview(idx, true)}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full opacity-0 group-hover/img:opacity-100 transition-all"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              {/* New local previews */}
                              {previews.map((img, idx) => (
                                <div
                                  key={`new-${idx}`}
                                  className="relative aspect-square border border-luxora-gold/20 group/img"
                                >
                                  <img
                                    src={img}
                                    className="w-full h-full object-cover"
                                    alt="Preview"
                                  />
                                  <div className="absolute top-0 left-0 bg-luxora-gold text-[8px] px-1 text-luxora-dark font-bold">
                                    NEW
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removePreview(idx, false)}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full opacity-0 group-hover/img:opacity-100 transition-all"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {errors.images && (
                            <p className="text-red-500 text-[8px] uppercase tracking-widest mt-2">
                              {errors.images}
                            </p>
                          )}
                          <p className="text-white/20 text-[8px] uppercase tracking-widest mt-2">
                            Max 10 high-fidelity images
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label
                        className={`block text-[10px] uppercase tracking-widest mb-2 font-bold ${errors.description ? "text-red-500" : "text-white/40"}`}
                      >
                        Marketing Statement
                      </label>
                      <textarea
                        required
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full bg-luxora-dark border ${errors.description ? "border-red-500/50" : "border-white/10"} p-3 text-white focus:border-luxora-gold outline-none transition-all`}
                        placeholder="Craft a compelling description..."
                      />
                      {errors.description && (
                        <p className="text-red-500 text-[8px] mt-1 uppercase tracking-widest">
                          {errors.description}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">
                        Elite Features
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addFeature())
                          }
                          className="flex-1 bg-luxora-dark border border-white/10 p-3 text-white outline-none focus:border-luxora-gold transition-all"
                          placeholder="Add amenity..."
                        />
                        <button
                          type="button"
                          onClick={addFeature}
                          className="px-4 bg-luxora-gold text-luxora-dark font-bold"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.features?.map((f) => (
                          <span
                            key={f}
                            className="bg-luxora-dark px-2 py-1 text-[8px] text-luxora-gold border border-luxora-gold/20 rounded-sm flex items-center uppercase tracking-widest"
                          >
                            {f}
                            <button
                              type="button"
                              onClick={() => removeFeature(f)}
                              className="ml-2 text-white/40 hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3 pt-6 border-t border-white/5 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-8 py-3 text-white/60 uppercase tracking-widest text-[10px] hover:text-white"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="px-12 py-3 gold-gradient text-luxora-dark font-bold uppercase tracking-widest rounded-sm shadow-xl"
                    >
                      {isEditing ? "Authorize Update" : "Initialize Asset"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:gap-6">
              {filteredFleet.length > 0 ? (
                filteredFleet.map((car) => (
                  <div
                    key={car.id}
                    className="bg-luxora-charcoal border border-white/5 p-4 sm:p-6 rounded-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 group hover:border-luxora-gold/20 transition-all"
                  >
                    <div className="w-full sm:w-56 lg:w-80 h-32 sm:h-40 overflow-hidden relative flex-shrink-0">
                      <img
                        src={car.image}
                        alt={car.model}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-black/10"></div>
                    </div>

                    <div className="flex-grow w-full">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3 sm:mb-4">
                        <div className="min-w-0">
                          <span className="text-luxora-gold text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.3em] block mb-1">
                            {car.brand}
                          </span>
                          <h4 className="text-xl sm:text-2xl lg:text-3xl font-serif text-white">
                            {car.model}
                          </h4>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <span className="text-white text-lg sm:text-xl font-bold block italic">
                            ₹{car.pricePerHour.toLocaleString()}
                          </span>
                          <span className="text-white/30 text-[7px] sm:text-[8px] uppercase tracking-widest">
                            {activeCarSubCategory === "Sales"
                              ? "Final Price"
                              : "/ Hour"}
                          </span>
                        </div>
                      </div>
                      <p className="text-white/40 text-xs sm:text-sm italic line-clamp-2 mb-4 sm:mb-6 border-l-2 border-luxora-gold/20 pl-4">
                        {car.description}
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <span className="text-[7px] sm:text-[8px] px-2 sm:px-3 py-1 bg-white/5 text-luxora-gold border border-luxora-gold/10 uppercase tracking-widest">
                          {car.type}
                        </span>
                        <span className="text-[7px] sm:text-[8px] px-2 sm:px-3 py-1 bg-white/5 text-white/60 border border-white/5 uppercase tracking-widest">
                          {car.seats} Passenger
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row gap-2 w-full flex-wrap sm:flex-nowrap">
                      <button
                        disabled={isProcessing}
                        onClick={() => handleEdit(car)}
                        className="flex-1 sm:flex-none sm:w-28 py-2 sm:py-3 border border-luxora-gold/30 text-luxora-gold text-[8px] sm:text-[10px] uppercase tracking-widest font-bold hover:bg-luxora-gold hover:text-luxora-dark transition-all disabled:opacity-50"
                      >
                        Refine
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleDelete(car.id)}
                        className="flex-1 sm:flex-none sm:w-28 py-2 sm:py-3 border border-red-900/20 text-red-500/60 text-[8px] sm:text-[10px] uppercase tracking-widest font-bold hover:bg-red-900/40 hover:text-red-500 transition-all disabled:opacity-50"
                      >
                        Decommission
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center bg-luxora-charcoal/30 border border-dashed border-white/5 rounded-sm">
                  <p className="text-white/20 uppercase tracking-[0.5em] text-xs">
                    No assets registered in this category
                  </p>
                </div>
              )}
            </div>
          </>
        ) : activeMainCategory === "Enquiries" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif text-white uppercase tracking-wider">
                Booking <span className="gold-text">Enquiries</span>
              </h3>
              <div className="text-white/40 text-[10px] uppercase tracking-widest">
                Total: {enquiries.length}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {enquiries.length > 0 ? (
                enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="bg-luxora-charcoal border border-white/5 p-6 rounded-sm hover:border-luxora-gold/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-grow space-y-4">
                        <div className="flex items-center gap-4">
                          <h4 className="text-xl font-serif text-white">
                            {enq.customerName}
                          </h4>
                          <span
                            className={`px-3 py-1 text-[8px] uppercase tracking-widest font-bold rounded-full ${
                              enq.status === "pending"
                                ? "bg-red-500/20 text-red-500 border border-red-500/30"
                                : enq.status === "viewed"
                                  ? "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                                  : "bg-luxora-gold/20 text-luxora-gold border border-luxora-gold/30"
                            }`}
                          >
                            {enq.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="flex items-center gap-2 text-white/60">
                            <span className="text-luxora-gold">📱</span>{" "}
                            {enq.customerPhone}
                          </div>
                          <div className="flex items-center gap-2 text-white/60">
                            <span className="text-luxora-gold">✉️</span>{" "}
                            {enq.customerEmail}
                          </div>
                          <div className="flex items-center gap-2 text-white/60">
                            <span className="text-luxora-gold">🏎️</span>{" "}
                            {enq.carModel}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="flex items-center gap-2 text-white/60">
                            <span className="text-luxora-gold">📅</span> Pickup:{" "}
                            {enq.pickupDate}
                          </div>
                          <div className="flex items-center gap-2 text-white/60">
                            <span className="text-luxora-gold">⏱️</span>{" "}
                            {enq.duration}
                          </div>
                        </div>
                        {enq.message && (
                          <div className="bg-luxora-dark/50 p-4 border-l-2 border-luxora-gold/30 italic text-white/40 text-sm">
                            {enq.message}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                        {enq.status === "pending" && (
                          <button
                            onClick={async () => {
                              const success = await bookingService.updateStatus(
                                enq.id,
                                "viewed",
                              );
                              if (success) {
                                // Add a small delay to ensure file is written
                                await new Promise((resolve) =>
                                  setTimeout(resolve, 300),
                                );
                                await refreshFleet();
                              } else {
                                alert(
                                  "Failed to update status. Please try again.",
                                );
                              }
                            }}
                            className="px-4 py-2 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white hover:border-white/30 transition-all font-bold"
                          >
                            Mark as Viewed
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            const success = await bookingService.updateStatus(
                              enq.id,
                              "contacted",
                            );
                            if (success) {
                              // Add a small delay to ensure file is written
                              await new Promise((resolve) =>
                                setTimeout(resolve, 300),
                              );
                              await refreshFleet();
                            } else {
                              alert(
                                "Failed to update status. Please try again.",
                              );
                            }
                          }}
                          className="px-4 py-2 border border-luxora-gold/30 text-luxora-gold text-[10px] uppercase tracking-widest hover:bg-luxora-gold hover:text-luxora-dark transition-all font-bold"
                        >
                          Mark Contacted
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm("Delete enquiry?")) {
                              const success =
                                await bookingService.deleteEnquiry(enq.id);
                              if (success) {
                                // Add a small delay to ensure file is written
                                await new Promise((resolve) =>
                                  setTimeout(resolve, 300),
                                );
                                await refreshFleet();
                              } else {
                                alert(
                                  "Failed to delete enquiry. Please try again.",
                                );
                              }
                            }
                          }}
                          className="px-4 py-2 border border-red-900/20 text-red-500/40 text-[10px] uppercase tracking-widest hover:text-red-500 transition-all font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 text-[7px] sm:text-[8px] text-white/10 uppercase tracking-[0.4em] text-left sm:text-right">
                      Received: {new Date(enq.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center bg-luxora-charcoal/30 border border-dashed border-white/5 rounded-sm">
                  <p className="text-white/20 uppercase tracking-[0.5em] text-xs">
                    No enquiries received yet
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : activeMainCategory === "Properties" ? (
          <div className="py-24 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 bg-luxora-charcoal/30 border border-white/5 rounded-sm">
            <div className="w-32 h-32 border border-luxora-gold/20 rounded-full flex items-center justify-center mx-auto mb-12 text-luxora-gold bg-luxora-gold/5 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
            <h3 className="text-6xl font-serif text-white mb-6 uppercase tracking-[0.3em]">
              Properties <span className="gold-text">Portal</span>
            </h3>
            <div className="flex items-center justify-center gap-4 mb-16">
              <div className="h-[1px] w-12 bg-luxora-gold/30"></div>
              <p className="text-luxora-gold uppercase tracking-[0.8em] text-xs font-bold">
                Module Under Construction
              </p>
              <div className="h-[1px] w-12 bg-luxora-gold/30"></div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {["Sales", "Management", "Rent"].map((mod) => (
                <div
                  key={mod}
                  className="p-10 border border-white/5 bg-luxora-dark/50 relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 text-[6px] uppercase tracking-widest text-luxora-gold/20 font-bold border-l border-b border-white/5">
                    v1.2-beta
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 block">
                    Sub-Module
                  </p>
                  <h4 className="text-white font-serif text-2xl group-hover:text-luxora-gold transition-colors">
                    {mod}
                  </h4>
                  <div className="mt-6 w-full h-[2px] bg-white/5 group-hover:bg-luxora-gold/20 transition-all"></div>
                  <p className="mt-4 text-[8px] text-luxora-gold/40 uppercase tracking-[0.3em] animate-pulse">
                    Initializing Interface...
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveMainCategory(null)}
              className="mt-24 px-12 py-4 border border-luxora-gold/30 text-luxora-gold text-[10px] uppercase tracking-widest hover:bg-luxora-gold hover:text-luxora-dark transition-all font-bold"
            >
              Return to Module Selector
            </button>
          </div>
        ) : (
          <div className="py-24 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 bg-luxora-charcoal/30 border border-white/5 rounded-sm">
            <div className="w-32 h-32 border border-luxora-gold/20 rounded-full flex items-center justify-center mx-auto mb-12 text-luxora-gold bg-luxora-gold/5 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                ></path>
              </svg>
            </div>
            <h3 className="text-6xl font-serif text-white mb-6 uppercase tracking-[0.3em]">
              Luxury <span className="gold-text">Market</span>
            </h3>
            <div className="flex items-center justify-center gap-4 mb-16">
              <div className="h-[1px] w-12 bg-luxora-gold/30"></div>
              <p className="text-luxora-gold uppercase tracking-[0.8em] text-xs font-bold">
                Coming Soon to Luxora Premier
              </p>
              <div className="h-[1px] w-12 bg-luxora-gold/30"></div>
            </div>

            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 border border-white/5 bg-luxora-dark/50 group">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 block">
                  Market Category
                </p>
                <h4 className="text-white font-serif text-2xl group-hover:text-luxora-gold transition-colors">
                  Preowned Sales
                </h4>
                <p className="text-[10px] text-white/20 mt-4 uppercase tracking-[0.4em]">
                  Gucci • LV • Prada • Rolex
                </p>
                <div className="mt-8 text-[8px] text-luxora-gold/60 border border-luxora-gold/20 inline-block px-3 py-1 uppercase tracking-widest">
                  Awaiting Stock Sync
                </div>
              </div>
              <div className="p-10 border border-white/5 bg-luxora-dark/50 group">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 block">
                  Market Category
                </p>
                <h4 className="text-white font-serif text-2xl group-hover:text-luxora-gold transition-colors">
                  Pre-Loved Rent
                </h4>
                <p className="text-[10px] text-white/20 mt-4 uppercase tracking-[0.4em]">
                  Exclusive Collections
                </p>
                <div className="mt-8 text-[8px] text-luxora-gold/60 border border-luxora-gold/20 inline-block px-3 py-1 uppercase tracking-widest">
                  Inventory Setup
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveMainCategory(null)}
              className="mt-24 px-12 py-4 border border-luxora-gold/30 text-luxora-gold text-[10px] uppercase tracking-widest hover:bg-luxora-gold hover:text-luxora-dark transition-all font-bold"
            >
              Return to Module Selector
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminPage;
