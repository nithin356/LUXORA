import React, { useState, useEffect } from "react";
import { fleetService } from "../services/fleetService";
import { bookingService, BookingEnquiry } from "../services/bookingService";
import { Car, CarCategory, FleetTier, RentalPackage } from "../types";

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
  const [activeStep, setActiveStep] = useState(0);

  const formSteps = [
    { title: "Basic Details", icon: "01" },
    { title: "Specs & VIP", icon: "02" },
    { title: "Gallery & Description", icon: "03" },
  ];

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
    packages: [],
    securityOptions: [
      { id: 'sec-1-1', carCount: 1, bodyguardCount: 1, label: '1 Car / 1 Bodyguard', price: 0 },
      { id: 'sec-1-2', carCount: 1, bodyguardCount: 2, label: '1 Car / 2 Bodyguards', price: 0 },
      { id: 'sec-2-4', carCount: 2, bodyguardCount: 4, label: '2 Cars / 4 Bodyguards', price: 0 },
    ],
    paymentPolicy: {
      advancePercentage: 10,
      arrivalPercentage: 90
    }
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
        name === "seats" || name === "pricePerHour" || name === "kmLimit" || name === "price" ? Number(value) : value,
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

  const handlePackageChange = (index: number, field: keyof RentalPackage, value: number) => {
    setFormData(prev => {
      const newPackages = [...(prev.packages || [])];
      newPackages[index] = { ...newPackages[index], [field]: value };
      return { ...prev, packages: newPackages };
    });
  };

  const addPackage = () => {
    setFormData(prev => ({
      ...prev,
      packages: [...(prev.packages || []), { duration: 4, kmLimit: 40, price: 0 }]
    }));
  };

  const removePackage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages?.filter((_, i) => i !== index)
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
      packages: [],
      securityOptions: [
        { id: 'sec-1-1', carCount: 1, bodyguardCount: 1, label: '1 Car / 1 Bodyguard', price: 0 },
        { id: 'sec-1-2', carCount: 1, bodyguardCount: 2, label: '1 Car / 2 Bodyguards', price: 0 },
        { id: 'sec-2-4', carCount: 2, bodyguardCount: 4, label: '2 Cars / 4 Bodyguards', price: 0 },
      ],
      paymentPolicy: {
        advancePercentage: 10,
        arrivalPercentage: 90
      }
    });
    setSelectedFiles([]);
    setPreviews([]);
    setErrors({});
    setIsEditing(null);
    setShowForm(false);
    setActiveStep(0);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const filteredFleet = fleet.filter((car) => {
    const matchesCategory = car.category === activeCarSubCategory;
    const matchesSearch = (car.brand + " " + car.model).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === "All" || car.fleetTier === filterTier;
    const matchesType = filterType === "All" || car.type === filterType;
    return matchesCategory && matchesSearch && matchesTier && matchesType;
  });

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
            Luxora Security Hub
          </div>
        </div>
      </section>
    );
  }

  // Dashboard Selector Screen
  if (activeMainCategory === null) {
    return (
      <section className="min-h-screen bg-luxora-dark pt-32 sm:pt-40 pb-8 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="container mx-auto text-center">



          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto px-2">
            {/* Cars Module */}
            <button
              onClick={() => setActiveMainCategory("Cars")}
              className="group relative bg-luxora-charcoal border border-white/5 p-6 sm:p-8 hover:border-luxora-gold/50 transition-all duration-500 text-center flex flex-col items-center"
            >
              <div className="text-3xl sm:text-5xl mb-4 sm:mb-8 group-hover:scale-110 transition-transform text-luxora-gold">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" /></svg>
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
              className="group relative bg-luxora-charcoal border border-white/5 p-6 sm:p-8 hover:border-luxora-gold/50 transition-all duration-500 text-center flex flex-col items-center"
            >
              <div className="text-3xl sm:text-5xl mb-4 sm:mb-8 group-hover:scale-110 transition-transform text-luxora-gold">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg sm:text-2xl font-serif text-white mb-2 uppercase tracking-widest">
                Enquiries
              </h3>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-8">
                Booking Requests
              </p>
              <div className="w-12 h-[1px] bg-luxora-gold/30 group-hover:w-24 transition-all"></div>
              <span className="absolute top-4 right-4 text-[8px] bg-red-900/50 text-red-200 px-2 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">
                New
              </span>
            </button>

            {/* Flights Module */}
            <button
              disabled
              className="group relative bg-luxora-charcoal border border-white/5 p-6 sm:p-8 opacity-50 cursor-not-allowed hover:border-white/10 transition-all duration-500 text-center flex flex-col items-center grayscale"
            >
              <div className="text-3xl sm:text-5xl mb-4 sm:mb-8 text-white/20">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </div>
              <h3 className="text-lg sm:text-2xl font-serif text-white/40 mb-2 uppercase tracking-widest">
                Flights
              </h3>
              <p className="text-white/20 text-[10px] uppercase tracking-widest mb-8">
                Chartered Aviation
              </p>
              <span className="bg-luxora-gold/20 text-luxora-gold px-3 py-1 text-[8px] uppercase tracking-widest rounded-full">
                Coming Soon
              </span>
            </button>

            {/* Yachts Module */}
            <button
              disabled
              className="group relative bg-luxora-charcoal border border-white/5 p-6 sm:p-8 opacity-50 cursor-not-allowed hover:border-white/10 transition-all duration-500 text-center flex flex-col items-center grayscale"
            >
              <div className="text-3xl sm:text-5xl mb-4 sm:mb-8 text-white/20">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg sm:text-2xl font-serif text-white/40 mb-2 uppercase tracking-widest">
                Yachts
              </h3>
              <p className="text-white/20 text-[10px] uppercase tracking-widest mb-8">
                Maritime Service
              </p>
              <span className="bg-luxora-gold/20 text-luxora-gold px-3 py-1 text-[8px] uppercase tracking-widest rounded-full">
                Coming Soon
              </span>
            </button>

            {/* Properties Module */}
            <button
               onClick={() => setActiveMainCategory("Properties")}
               className="group relative bg-luxora-charcoal border border-white/5 p-6 sm:p-8 hover:border-luxora-gold/50 transition-all duration-500 text-center flex flex-col items-center"
            >
              <div className="text-3xl sm:text-5xl mb-4 sm:mb-8 group-hover:scale-110 transition-transform text-luxora-gold">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="text-lg sm:text-2xl font-serif text-white mb-2 uppercase tracking-widest">
                Properties
              </h3>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-8">
                Estates & Sales
              </p>
              <div className="w-12 h-[1px] bg-luxora-gold/30 group-hover:w-24 transition-all"></div>
            </button>

            {/* Luxury Goods Module */}
            <button
               onClick={() => setActiveMainCategory("Luxury Products")}
               className="group relative bg-luxora-charcoal border border-white/5 p-6 sm:p-8 hover:border-luxora-gold/50 transition-all duration-500 text-center flex flex-col items-center"
            >
              <div className="text-3xl sm:text-5xl mb-4 sm:mb-8 group-hover:scale-110 transition-transform text-luxora-gold">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h3 className="text-lg sm:text-2xl font-serif text-white mb-2 uppercase tracking-widest">
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
    <section className="min-h-screen bg-luxora-dark pt-32 pb-12">
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
                ["Chauffeur Driven", "Monthly Rental"] as CarCategory[]
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

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 sm:mb-12">
              <div className="w-full md:w-auto">
                <h3 className="text-lg sm:text-2xl font-serif text-white uppercase tracking-wider mb-4 md:mb-0">
                  {activeCarSubCategory}{" "}
                  <span className="text-luxora-gold/50 ml-1 sm:ml-2">
                    Inventory
                  </span>
                </h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search fleet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-48 bg-luxora-dark border border-white/10 p-2 pl-8 text-white text-xs outline-none focus:border-luxora-gold transition-all rounded-sm"
                  />
                  <svg className="w-3 h-3 text-white/40 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                
                <select 
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="bg-luxora-dark border border-white/10 p-2 text-white text-xs outline-none focus:border-luxora-gold transition-all rounded-sm"
                >
                  <option value="All">All Tiers</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Elite">Elite</option>
                  <option value="VIP">VIP</option>
                </select>

                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-luxora-dark border border-white/10 p-2 text-white text-xs outline-none focus:border-luxora-gold transition-all rounded-sm"
                >
                  <option value="All">All Types</option>
                  <option value="Luxury">Ultra-Luxury</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                </select>

                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(!showForm);
                  }}
                  className="px-6 py-2 gold-gradient text-luxora-dark font-bold uppercase tracking-widest text-[10px] rounded-sm shadow-xl hover:opacity-90 transition-all whitespace-nowrap"
                >
                  {showForm ? "Cancel" : "Add Asset"}
                </button>
              </div>
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

                {/* Step Indicators */}
                <div className="flex justify-center mb-10 overflow-x-auto pb-4 no-scrollbar">
                  <div className="flex items-center gap-2 sm:gap-4 px-2">
                    {formSteps.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <button
                          type="button"
                          onClick={() => setActiveStep(idx)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                            activeStep === idx
                              ? "border-luxora-gold bg-luxora-gold text-luxora-dark font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                              : "border-white/10 text-white/40 hover:border-white/20"
                          }`}
                        >
                          <span className="text-sm">{step.icon}</span>
                          <span className="text-[10px] uppercase tracking-widest">
                            {step.title}
                          </span>
                        </button>
                        {idx < formSteps.length - 1 && (
                          <div className="w-4 sm:w-8 h-[1px] bg-white/10 hidden sm:block"></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                  {/* STEP 0: BASIC DETAILS */}
                  {activeStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div>
                          <label className={`block text-[10px] uppercase tracking-widest mb-2 font-bold ${errors.brand ? "text-red-500" : "text-white/40"}`}>Brand Name</label>
                          <input required name="brand" value={formData.brand} onChange={handleInputChange} className={`w-full bg-luxora-dark border ${errors.brand ? "border-red-500/50" : "border-white/10"} p-3 text-white focus:border-luxora-gold outline-none transition-all`} placeholder="e.g. Rolls Royce" />
                          {errors.brand && <p className="text-red-500 text-[8px] mt-1 uppercase tracking-widest">{errors.brand}</p>}
                        </div>
                        <div>
                          <label className={`block text-[10px] uppercase tracking-widest mb-2 font-bold ${errors.model ? "text-red-500" : "text-white/40"}`}>Model</label>
                          <input required name="model" value={formData.model} onChange={handleInputChange} className={`w-full bg-luxora-dark border ${errors.model ? "border-red-500/50" : "border-white/10"} p-3 text-white focus:border-luxora-gold outline-none transition-all`} placeholder="e.g. Phantom VIII" />
                          {errors.model && <p className="text-red-500 text-[8px] mt-1 uppercase tracking-widest">{errors.model}</p>}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Asset Class</label>
                          <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:border-luxora-gold outline-none transition-all">
                            <option value="Luxury">Ultra-Luxury</option>
                            <option value="Sedan">Executive Sedan</option>
                            <option value="SUV">Elite SUV</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Fleet Tier</label>
                          <select name="fleetTier" value={formData.fleetTier || "Normal"} onChange={handleInputChange} className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:border-luxora-gold outline-none transition-all">
                            <option value="Normal">Normal</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Diamond">Diamond</option>
                            <option value="Elite">Elite</option>
                            <option value="VIP">VIP</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                   {/* STEP 1: COMMERCIALS & ADD-ONS */}
                  {activeStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-8">

                          <div className="bg-luxora-dark/30 p-6 rounded-sm border border-white/5 space-y-6">
                            <div>
                              <label className="block text-luxora-gold text-[10px] uppercase tracking-widest mb-4 font-bold font-black tracking-widest">Base Hourly Rate (₹)</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">₹</span>
                                <input required type="number" name="pricePerHour" value={formData.pricePerHour} onChange={handleInputChange} className="w-full bg-luxora-dark border border-white/10 p-3 pl-8 text-white focus:border-luxora-gold outline-none transition-all" />
                              </div>
                              <p className="mt-2 text-[8px] text-white/20 uppercase tracking-widest">Used as fallback if no packages are selected.</p>
                            </div>
                            
                            <div className="pt-6 border-t border-white/5">
                              <label className="block text-luxora-gold text-[10px] uppercase tracking-widest mb-4 font-bold font-black tracking-widest">Tiered Packages (Time/KM)</label>
                              <div className="space-y-4">
                                {formData.packages?.map((pkg, idx) => (
                                  <div key={idx} className="flex flex-wrap gap-2 items-center bg-black/40 p-3 rounded-sm border border-luxora-gold/10">
                                    <div className="flex-1 min-w-[60px]">
                                      <label className="text-[7px] text-white/40 block mb-1 uppercase font-bold">Hours</label>
                                      <select 
                                        value={pkg.duration} 
                                        onChange={(e) => handlePackageChange(idx, 'duration', Number(e.target.value))}
                                        className="w-full bg-luxora-dark border border-white/10 p-1.5 text-xs text-white outline-none focus:border-luxora-gold"
                                      >
                                        <option value={4}>4h</option>
                                        <option value={6}>6h</option>
                                        <option value={10}>10h</option>
                                        <option value={12}>12h</option>
                                        <option value={24}>24h</option>
                                      </select>
                                    </div>
                                    <div className="flex-1 min-w-[60px]">
                                      <label className="text-[7px] text-white/40 block mb-1 uppercase font-bold">Limit (KM)</label>
                                      <input 
                                        type="number" 
                                        value={pkg.kmLimit} 
                                        onChange={(e) => handlePackageChange(idx, 'kmLimit', Number(e.target.value))}
                                        className="w-full bg-luxora-dark border border-white/10 p-1.5 text-xs text-white outline-none focus:border-luxora-gold"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-[80px]">
                                      <label className="text-[7px] text-white/40 block mb-1 uppercase font-bold">Package ₹</label>
                                      <input 
                                        type="number" 
                                        value={pkg.price} 
                                        onChange={(e) => handlePackageChange(idx, 'price', Number(e.target.value))}
                                        className="w-full bg-luxora-dark border border-white/10 p-1.5 text-xs text-white outline-none focus:border-luxora-gold"
                                      />
                                    </div>
                                    <button type="button" onClick={() => removePackage(idx)} className="text-red-500 hover:text-red-400 p-1 text-xl leading-none">×</button>
                                  </div>
                                ))}
                                <button type="button" onClick={addPackage} className="w-full py-2.5 border border-dashed border-luxora-gold/30 text-luxora-gold text-[9px] uppercase tracking-widest font-black hover:bg-luxora-gold/5 transition-all">+ Initialize New Package Tier</button>
                              </div>
                            </div>
                          </div>
                        
                        <div className="bg-luxora-dark/30 p-6 rounded-sm border border-white/5">
                          <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-3 font-bold">Passenger Capacity</label>
                          <input required type="number" name="seats" value={formData.seats} onChange={handleInputChange} className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:border-luxora-gold outline-none transition-all" />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-luxora-dark/30 p-6 rounded-sm border border-white/5 h-full">
                          <label className="block text-luxora-gold text-[10px] uppercase tracking-widest mb-4 font-bold font-black tracking-widest">Bespoke Options & Security</label>
                          {formData.fleetTier === "VIP" || formData.fleetTier === "Diamond" || formData.fleetTier === "Gold" || formData.fleetTier === "Platinum" ? (
                            <div className="space-y-4">
                              {["bodyguard", "personalConcierge", "premiumRefreshments", "customRoute"].map((opt) => (
                                <label key={opt} className="flex items-center gap-4 cursor-pointer group">
                                  <div className="relative">
                                    <input type="checkbox" checked={formData.vipOptions?.[opt as keyof typeof formData.vipOptions] || false} onChange={() => handleVipOptionChange(opt as any)} className="sr-only peer" />
                                    <div className="w-10 h-5 bg-white/5 border border-white/10 rounded-full peer peer-checked:bg-luxora-gold/20 peer-checked:border-luxora-gold transition-all"></div>
                                    <div className="absolute left-1 top-1 w-3 h-3 bg-white/20 rounded-full peer-checked:left-6 peer-checked:bg-luxora-gold transition-all"></div>
                                  </div>
                                  <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold group-hover:text-white transition-colors">{opt.replace(/([A-Z])/g, ' $1')}</span>
                                </label>
                              ))}
                              
                              <div className="mt-8 pt-8 border-t border-white/5">
                                <p className="text-white/20 text-[9px] uppercase tracking-[0.3em] leading-relaxed">Security options for these tiers follow the standard 1/1, 1/2, and 2/4 protocols for personnel/vehicle splitting.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="py-12 text-center">
                              <div className="text-luxora-gold/20 text-3xl mb-4">✦</div>
                              <p className="text-white/20 text-[10px] uppercase tracking-widest italic px-8">Advanced VIP and specialized security protocols are reserved for Premium Fleet Tiers (Gold and Above).</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: MEDIA & CONTENT */}
                  {activeStep === 2 && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <label className={`block text-[10px] uppercase tracking-widest mb-2 font-bold ${errors.images ? "text-red-500" : "text-white/40"}`}>Asset Gallery</label>
                          <div className={`bg-luxora-dark border-2 border-dashed ${errors.images ? "border-red-500/20" : "border-white/5"} p-6 text-center rounded-sm`}>
                            <input type="file" id="file-upload" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                            <label htmlFor="file-upload" className="cursor-pointer px-8 py-3 bg-luxora-gold/10 border border-luxora-gold/30 text-luxora-gold text-[10px] uppercase tracking-widest hover:bg-luxora-gold hover:text-luxora-dark transition-all font-bold rounded-sm">Add High-Fidelity Images</label>
                            
                            {(previews.length > 0 || (formData.images && formData.images.length > 0)) && (
                              <div className="grid grid-cols-5 gap-2 w-full mt-6 max-h-48 overflow-y-auto p-2 bg-black/20 rounded-sm">
                                {formData.images?.map((img, idx) => (
                                  <div key={`exist-${idx}`} className="relative aspect-square border border-white/10 group/img">
                                    <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                    <button type="button" onClick={() => removePreview(idx, true)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full opacity-0 group-hover/img:opacity-100 transition-all shadow-xl">×</button>
                                  </div>
                                ))}
                                {previews.map((img, idx) => (
                                  <div key={`new-${idx}`} className="relative aspect-square border border-luxora-gold/20 group/img">
                                    <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                    <div className="absolute top-0 left-0 bg-luxora-gold text-[8px] px-1 text-luxora-dark font-bold">NEW</div>
                                    <button type="button" onClick={() => removePreview(idx, false)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full opacity-0 group-hover/img:opacity-100 transition-all shadow-xl">×</button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {errors.images && <p className="text-red-500 text-[8px] uppercase tracking-widest mt-3">{errors.images}</p>}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className={`block text-[10px] uppercase tracking-widest mb-2 font-bold ${errors.description ? "text-red-500" : "text-white/40"}`}>Marketing Statement</label>
                            <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className={`w-full bg-luxora-dark border ${errors.description ? "border-red-500/50" : "border-white/10"} p-4 text-white focus:border-luxora-gold outline-none transition-all rounded-sm`} placeholder="Craft a compelling description..." />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2 font-bold">Elite Features</label>
                            <div className="flex gap-2 mb-3">
                              <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} className="flex-1 bg-luxora-dark border border-white/10 p-3 text-white outline-none focus:border-luxora-gold transition-all" placeholder="Add amenity..." />
                              <button type="button" onClick={addFeature} className="px-5 bg-luxora-gold text-luxora-dark font-bold hover:scale-105 transition-transform">+</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.features?.map((f) => (
                                <span key={f} className="bg-luxora-gold/10 px-3 py-1.5 text-[9px] text-luxora-gold border border-luxora-gold/20 rounded-sm flex items-center uppercase tracking-widest">
                                  {f}
                                  <button type="button" onClick={() => removeFeature(f)} className="ml-2 text-white/40 hover:text-white">×</button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-4 w-full sm:w-auto">
                      {activeStep > 0 && (
                        <button type="button" onClick={() => setActiveStep((p) => p - 1)} className="px-8 py-3 border border-white/10 text-white/60 uppercase tracking-widest text-[10px] hover:text-white hover:border-white/20 transition-all font-bold">← Back</button>
                      )}
                      <button type="button" onClick={resetForm} className="px-6 py-3 text-red-500/40 uppercase tracking-widest text-[10px] hover:text-red-500 transition-all font-bold">Discard</button>
                    </div>

                    {activeStep < formSteps.length - 1 ? (
                      <button type="button" onClick={() => setActiveStep((p) => p + 1)} className="w-full sm:w-auto px-12 py-3 bg-white text-luxora-dark font-bold uppercase tracking-widest text-[10px] hover:bg-luxora-gold transition-all shadow-xl">Next: {formSteps[activeStep + 1].title} →</button>
                    ) : (
                      <button type="submit" disabled={isProcessing} className="w-full sm:w-auto px-16 py-3 gold-gradient text-luxora-dark font-bold uppercase tracking-widest text-[10px] rounded-sm shadow-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-luxora-dark/20 border-t-luxora-dark rounded-full animate-spin"></div>
                            Creating Asset...
                          </>
                        ) : isEditing ? "Authorize Update" : "Initialize Luxury Asset"}
                      </button>
                    )}
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

            <div className="grid grid-cols-1 gap-6">
              {enquiries.length > 0 ? (
                enquiries.map((enq) => {
                  // Parse the formatted message to extract details
                  const parts = enq.message.split('\n\n');
                  const detailsLine = parts[0] || "";
                  const userMessage = parts[1] || "";
                  
                  const detailsMap: Record<string, string> = {};
                  detailsLine.split('|').forEach(part => {
                    const [key, val] = part.split(':').map(s => s.trim());
                    if (key && val) detailsMap[key] = val;
                  });

                  return (
                    <div
                      key={enq.id}
                      className="bg-luxora-charcoal border border-white/5 p-6 rounded-sm hover:border-luxora-gold/20 transition-all relative group"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-luxora-gold/50 to-transparent opacity-50"></div>
                      
                      {/* Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/5 pb-4">
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
                        <div className="text-[9px] text-white/30 uppercase tracking-widest">
                          {new Date(enq.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {/* Column 1: Contact & Car */}
                        <div className="space-y-3">
                           <p className="text-luxora-gold text-[9px] uppercase tracking-widest font-bold mb-2">Client Details</p>
                           <div className="space-y-2">
                             <div className="flex items-center gap-2 text-white/70 text-xs">
                               <span className="text-white/30 w-12 text-[9px] uppercase tracking-wider">Phone:</span> {enq.customerPhone}
                             </div>
                             <div className="flex items-center gap-2 text-white/70 text-xs">
                               <span className="text-white/30 w-12 text-[9px] uppercase tracking-wider">Email:</span> {enq.customerEmail}
                             </div>
                             <div className="flex items-center gap-2 text-white/70 text-xs">
                               <span className="text-white/30 w-12 text-[9px] uppercase tracking-wider">Car:</span> {enq.carModel}
                             </div>
                             <div className="flex items-center gap-2 text-white/70 text-xs">
                               <span className="text-white/30 w-12 text-[9px] uppercase tracking-wider">Pickup:</span> {enq.pickupDate} ({enq.duration})
                             </div>
                           </div>
                        </div>

                        {/* Column 2: Booking Details parsed from message */}
                        <div className="space-y-3">
                           <p className="text-luxora-gold text-[9px] uppercase tracking-widest font-bold mb-2">Reservation Info</p>
                           <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                              {Object.entries(detailsMap).map(([key, val]) => (
                                key !== "Total" && key !== "Advance (10%)" && key !== "On Arrival (90%)" && (
                                  <div key={key} className="col-span-2 sm:col-span-1">
                                    <span className="text-white/30 text-[9px] block uppercase tracking-wider">{key}</span>
                                    <span className="text-white/80">{val}</span>
                                  </div>
                                )
                              ))}
                           </div>
                        </div>

                        {/* Column 3: Financials & ID */}
                        <div className="space-y-3">
                           <p className="text-luxora-gold text-[9px] uppercase tracking-widest font-bold mb-2">Payment & Verification</p>
                           <div className="bg-luxora-dark/40 p-3 rounded-sm border border-white/5 space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-white/40">Total</span>
                                <span className="text-luxora-gold font-bold">{detailsMap["Total"]}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-white/40">Advance</span>
                                <span className="text-white">{detailsMap["Advance (10%)"]}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-white/40">Balance</span>
                                <span className="text-white">{detailsMap["On Arrival (90%)"]}</span>
                              </div>
                           </div>

                           {/* ID Proof Display */}
                           {enq.idProof ? (
                             <div className="mt-2">
                               <span className="text-white/30 text-[9px] uppercase tracking-widest block mb-1">ID Proof</span>
                               <a href={enq.idProof} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-luxora-gold text-xs hover:underline cursor-pointer bg-luxora-gold/10 p-2 rounded-sm border border-luxora-gold/20">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                 View Driving License
                               </a>
                             </div>
                           ) : (
                             <div className="mt-2 text-white/20 text-[9px] uppercase tracking-widest">
                               No ID Uploaded
                             </div>
                           )}
                        </div>
                      </div>

                      {/* Message Body */}
                      {userMessage && (
                        <div className="mt-6 pt-4 border-t border-white/5">
                           <p className="text-white/30 text-[9px] uppercase tracking-widest mb-2 font-bold">Additional Notes</p>
                           <p className="text-white/70 text-sm italic bg-black/20 p-3 rounded-sm border border-white/5">
                             "{userMessage.trim()}"
                           </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-6 flex flex-wrap gap-3 justify-end">
                        {enq.status === "pending" && (
                          <button
                            onClick={async () => {
                              const success = await bookingService.updateStatus(enq.id, "viewed");
                              if (success) {
                                await new Promise((resolve) => setTimeout(resolve, 300));
                                await refreshFleet();
                              }
                            }}
                            className="px-4 py-2 border border-blue-500/30 text-blue-400 text-[10px] uppercase tracking-widest hover:bg-blue-500/10 transition-all font-bold"
                          >
                            Mark Viewed
                          </button>
                        )}
                        
                        {enq.status !== "contacted" && (
                          <button
                            onClick={async () => {
                              // Ensure we are passing the string "contacted" correctly
                              const success = await bookingService.updateStatus(enq.id, "contacted");
                              if (success) {
                                await new Promise((resolve) => setTimeout(resolve, 300));
                                await refreshFleet();
                              } else {
                                console.error("Failed to update status to contacted");
                              }
                            }}
                            className="px-4 py-2 border border-luxora-gold/30 text-luxora-gold text-[10px] uppercase tracking-widest hover:bg-luxora-gold hover:text-luxora-dark transition-all font-bold"
                          >
                            Mark Contacted
                          </button>
                        )}

                        {/* Approve Booking - Locks the car */}
                        {enq.status !== 'confirmed' && (
                          <button
                            onClick={async () => {
                              if (window.confirm(`Confirm booking for ${enq.customerName}? This will mark the ${enq.carModel} as BOOKED and unavailable.`)) {
                                // 1. Mark Enquiry as Confirmed (using a new status or reusing 'contacted' if 'confirmed' isn't supported yet - let's stick to 'contacted' or add 'confirmed' support)
                                // The User asked for "Admin gives or says car is given". 
                                // We'll assume 'contacted' is enough for the enquiry, but we need to update the CAR.
                                
                                // Update Car Status
                                const car = fleet.find(c => c.id === enq.carId);
                                if (car) {
                                  const formData = new FormData();
                                  const updatedCar = { ...car, status: 'Booked' };
                                  formData.append("carData", JSON.stringify(updatedCar));
                                  // Update car status
                                  await fleetService.updateCar(car.id, formData);
                                }
                                
                                // Update Enquiry Status
                                await bookingService.updateStatus(enq.id, "contacted");
                                
                                await new Promise((resolve) => setTimeout(resolve, 500));
                                await refreshFleet();
                                alert("Booking Confirmed. Car is now marked as BOOKED.");
                              }
                            }}
                            className="px-4 py-2 bg-luxora-gold text-luxora-dark text-[10px] uppercase tracking-widest hover:bg-white transition-all font-bold"
                          >
                            Approve & Book Car
                          </button>
                        )}

                        <button
                          onClick={async () => {
                            if (window.confirm("Delete enquiry?")) {
                              const success = await bookingService.deleteEnquiry(enq.id);
                              if (success) {
                                await new Promise((resolve) => setTimeout(resolve, 300));
                                await refreshFleet();
                              }
                            }
                          }}
                          className="px-4 py-2 border border-red-900/20 text-red-500/40 text-[10px] uppercase tracking-widest hover:text-red-500 transition-all font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
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
