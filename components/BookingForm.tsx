import React, { useState, useEffect } from "react";
import { fleetService } from "../services/fleetService";
import { bookingService } from "../services/bookingService";
import { Car } from "../types";

interface BookingFormProps {
  selectedCarId?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ selectedCarId }) => {
  const [submitted, setSubmitted] = useState(false);
  const [fleet, setFleet] = useState<Car[]>([]);
  const [selectedVipOptions, setSelectedVipOptions] = useState({
    bodyguard: false,
    personalConcierge: false,
    premiumRefreshments: false,
    customRoute: false,
  });
  const [selectedPackageIndex, setSelectedPackageIndex] = useState<number>(0);
  const [selectedSecurityId, setSelectedSecurityId] = useState<string>("");
  const [bookingHours, setBookingHours] = useState(4); // Default to 4h package min
  const [outKm, setOutKm] = useState<number>(0);
  const [inKm, setInKm] = useState<number>(0);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerIdType: "Aadhaar", // Removed from UI but keeping for type safety if needed, can initiate as empty
    customerIdNumber: "",
    driverId: "",
    carId: "",
    pickupDate: "",
    duration: "Full Day Disposal",
    message: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const cars = await fleetService.getFleet();
      setFleet(cars);
      
      // If we have a selectedCarId from props, use that
      if (selectedCarId) {
        setFormData(prev => ({ ...prev, carId: selectedCarId }));
        // Also update package selection for this car
        const car = cars.find(c => c.id === selectedCarId);
        if (car && car.packages && car.packages.length > 0) {
           setSelectedPackageIndex(0);
        }
      } 
      // Otherwise fallback to first car if nothing selected
      else if (cars.length > 0 && !formData.carId) {
        setFormData((prev) => ({ ...prev, carId: cars[0].id }));
        if (cars[0].packages && cars[0].packages.length > 0) {
          setSelectedPackageIndex(0);
        }
      }
    };
    loadData();
  }, [selectedCarId]); // Remove formData.carId dependency to prevent loops

  // Update form if prop changes later (though usually mounts with it)
  useEffect(() => {
    if (selectedCarId) {
      setFormData((prev) => ({ ...prev, carId: selectedCarId }));
    }
  }, [selectedCarId]);

  const selectedCar = fleet.find((c) => c.id === formData.carId);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVipOptionChange = (option: keyof typeof selectedVipOptions) => {
    setSelectedVipOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const calculateTotalCost = () => {
    if (!selectedCar) return 0;
    
    let baseCost = 0;
    
    // Check for tiered packages
    if (selectedCar.packages && selectedCar.packages.length > 0) {
      const pkg = selectedCar.packages[selectedPackageIndex];
      baseCost = pkg ? pkg.price : 0;
    } else {
      // Legacy hourly pricing
      baseCost = selectedCar.pricePerHour * bookingHours;
    }

    // Add Security Cost
    if (selectedSecurityId && selectedCar.securityOptions) {
      const security = selectedCar.securityOptions.find(s => s.id === selectedSecurityId);
      if (security && security.price) {
        baseCost += security.price;
      }
    }

    // Add VIP Options
    const vipCost =
      (selectedVipOptions.bodyguard ? 500 : 0) +
      (selectedVipOptions.personalConcierge ? 500 : 0) +
      (selectedVipOptions.premiumRefreshments ? 500 : 0) +
      (selectedVipOptions.customRoute ? 500 : 0);

    return baseCost + vipCost;
  };

  const getPaymentBreakdown = () => {
    const total = calculateTotalCost();
    const isStandardPayment = selectedCar?.paymentPolicy?.advancePercentage === 10;
    
    if (isStandardPayment) {
      return {
        advance: Math.round(total * 0.1),
        arrival: Math.round(total * 0.9)
      };
    }
    
    // Default fallback
    return {
      advance: Math.round(total * 0.2), 
      arrival: Math.round(total * 0.8)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const breakdown = getPaymentBreakdown();
    const pkg = selectedCar?.packages?.[selectedPackageIndex];
    const security = selectedCar?.securityOptions?.find(s => s.id === selectedSecurityId);
    
    const vipNote = Object.entries(selectedVipOptions)
      .filter(([_, v]) => v)
      .map(([k]) => k.replace(/([A-Z])/g, " $1").trim())
      .join(", ");

    const submissionData = new FormData();
    submissionData.append("customerName", formData.customerName);
    submissionData.append("customerPhone", formData.customerPhone);
    submissionData.append("customerEmail", formData.customerEmail);
    submissionData.append("carId", formData.carId);
    submissionData.append("carModel", selectedCar
      ? `${selectedCar.brand} ${selectedCar.model} (${selectedCar.fleetTier} Tier)`
      : "Unknown Car");
    submissionData.append("pickupDate", formData.pickupDate);
    submissionData.append("duration", formData.duration);
    
    // Construct the formatted message
    const formattedMessage = `Package: ${pkg ? `${pkg.duration}h / ${pkg.kmLimit}km` : `${bookingHours}h`} | Security: ${security?.label || "None"} | VIP: ${vipNote || "None"} | Total: ₹${calculateTotalCost()} | Advance (10%): ₹${breakdown.advance} | On Arrival (90%): ₹${breakdown.arrival} | KM Status: Out ${outKm} - In ${inKm} | Driver ID: TBD\n\n${formData.message}`;
    
    submissionData.append("message", formattedMessage);

    if (formData.idProofFile) {
      submissionData.append("idProof", formData.idProofFile);
    }

    await bookingService.addEnquiry(submissionData);

    // Smooth scroll to top to see success message
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-luxora-dark flex items-center justify-center p-6">
        <div className="bg-luxora-charcoal border border-luxora-gold/20 p-8 md:p-12 rounded-lg max-w-2xl text-center shadow-2xl reveal">
          <div className="w-20 h-20 bg-luxora-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-luxora-gold/30">
            <span className="text-4xl">✨</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 uppercase tracking-wider">
            Reservation <span className="gold-text">Confirmed</span>
          </h2>
          <div className="w-24 h-[1px] bg-luxora-gold mx-auto mb-8"></div>
          <p className="text-white/70 text-lg mb-8 font-light leading-relaxed">
            Thank you for choosing Luxora. Your elite driving experience has been
            tentatively reserved. Our concierge will contact you shortly to
            finalize details and arrange the 10% advance payment.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-luxora-gold text-luxora-dark font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 rounded-sm"
          >
            Return to Fleet
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="pt-32 pb-24 bg-luxora-dark min-h-screen relative overflow-hidden" id="booking">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-luxora-gold/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-6 reveal">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-luxora-gold font-serif text-xs tracking-[0.3em] uppercase mb-4 block">
              Secure Your Journey
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 uppercase tracking-tight">
              Elite <span className="gold-text">Reservation</span>
            </h2>
            <div className="w-24 h-[1px] bg-luxora-gold mx-auto"></div>
          </div>

          <div className="bg-luxora-charcoal/40 backdrop-blur-md border border-white/5 p-8 md:p-12 rounded-xl shadow-2xl relative overflow-hidden">
            {/* Decorative glint */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxora-gold/50 to-transparent opacity-50"></div>
            
            {/* Booking Form */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="col-span-2">
                <p className="text-luxora-gold text-xs uppercase tracking-[0.2em] mb-2 font-bold border-b border-white/5 pb-2">
                  1. Personal Details
                </p>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-white/50 text-[10px] uppercase tracking-widest mb-2 font-bold">
                  Full Name
                </label>
                <input
                  required
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  type="text"
                  className="w-full bg-black/40 border border-white/10 p-4 text-white focus:outline-none focus:border-luxora-gold transition-colors text-sm rounded-sm"
                  placeholder="JOHN DOE"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-white/50 text-[10px] uppercase tracking-widest mb-2 font-bold">
                  Phone Number
                </label>
                <input
                  required
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  type="tel"
                  className="w-full bg-black/40 border border-white/10 p-4 text-white focus:outline-none focus:border-luxora-gold transition-colors text-sm rounded-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-white/50 text-[10px] uppercase tracking-widest mb-2 font-bold">
                  Email Address
                </label>
                <input
                  required
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  type="email"
                  className="w-full bg-black/40 border border-white/10 p-4 text-white focus:outline-none focus:border-luxora-gold transition-colors text-sm rounded-sm"
                  placeholder="CLIENT@EXAMPLE.COM"
                />
              </div>

              {/* ID Upload - Simplified */}
              <div className="col-span-2 bg-white/5 p-6 rounded-sm border border-white/5 border-dashed hover:border-luxora-gold/30 transition-colors">
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <span className="text-luxora-gold text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
                    Upload Driving License (Mandatory)
                  </span>
                  <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center mb-4 border border-white/10">
                    <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                  </div>
                  <span className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Click to upload photo of license</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                       if (e.target.files && e.target.files.length > 0) {
                         setFormData(prev => ({ ...prev, idProofFile: e.target.files![0] }));
                       }
                    }}
                  />
                  <div className="text-center mt-2">
                    <span className="bg-luxora-gold/10 text-luxora-gold px-3 py-1 text-[9px] uppercase tracking-widest rounded-full">
                      {formData.idProofFile ? "File Selected" : "Secure Upload"}
                    </span>
                  </div>
                </label>
              </div>

              <div className="col-span-2">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                  Select Vehicle
                </label>
                <select
                  name="carId"
                  value={formData.carId}
                  onChange={handleInputChange}
                  className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors"
                >
                  {fleet.filter(c => c.category === 'Chauffeur Driven' && c.status === 'Available').map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.brand} {car.model} — {car.fleetTier} Tier
                      {car.packages && car.packages.length > 0 ? ` (from ₹${Math.min(...car.packages.map(p => p.price)).toLocaleString()})` : ` (₹${car.pricePerHour}/hr)`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Car Info & Packages */}
              {selectedCar && (
                <div className="col-span-2 space-y-4">
                  <div className="p-4 bg-luxora-gold/10 border border-luxora-gold/20 rounded-sm">
                    <p className="text-luxora-gold text-[10px] uppercase tracking-widest font-bold mb-4">Select Rental Package</p>
                    {selectedCar.packages && selectedCar.packages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {selectedCar.packages.map((pkg, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedPackageIndex(idx)}
                            className={`p-3 border transition-all text-center ${
                              selectedPackageIndex === idx
                                ? "border-luxora-gold bg-luxora-gold/20 text-white"
                                : "border-white/10 text-white/40 hover:border-white/20"
                            }`}
                          >
                            <div className="text-sm font-bold">{pkg.duration} Hours</div>
                            <div className="text-[10px] opacity-60">{pkg.kmLimit} KM Limit</div>
                            <div className="mt-1 text-luxora-gold font-bold">₹{pkg.price.toLocaleString()}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-white/40 text-[10px] uppercase tracking-widest">Hourly Duration</p>
                          <input
                            type="number"
                            value={bookingHours}
                            onChange={(e) => setBookingHours(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-luxora-dark border border-white/10 p-2 mt-1 text-white"
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-white/40 text-[10px] uppercase tracking-widest text-right">Base Price</p>
                          <p className="text-white text-lg font-bold">₹{selectedCar.pricePerHour.toLocaleString()}/hr</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-black/40 border border-white/5 rounded-sm">
                    <p className="text-luxora-gold text-[10px] uppercase tracking-widest font-bold mb-4">Security & Bodyguards</p>
                    {selectedCar.securityOptions && selectedCar.securityOptions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedSecurityId("")}
                          className={`p-3 border transition-all text-center ${
                            selectedSecurityId === ""
                              ? "border-luxora-gold bg-luxora-gold/20 text-white"
                              : "border-white/10 text-white/40 hover:border-white/20"
                          }`}
                        >
                          <div className="text-xs font-bold uppercase">Standard</div>
                          <div className="text-[8px] opacity-60 tracking-widest">No Bodyguard</div>
                        </button>
                        {selectedCar.securityOptions.map((sec) => (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => setSelectedSecurityId(sec.id)}
                            className={`p-3 border transition-all text-center ${
                              selectedSecurityId === sec.id
                                ? "border-luxora-gold bg-luxora-gold/20 text-white"
                                : "border-white/10 text-white/40 hover:border-white/20"
                            }`}
                          >
                            <div className="text-xs font-bold uppercase">{sec.label}</div>
                            <div className="text-[8px] opacity-60 tracking-widest">Elite Security</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/20 text-[10px] italic uppercase tracking-widest">Security options not available for this tier.</p>
                    )}
                  </div>

                  {/* Payment Breakdown */}
                  <div className="p-6 bg-luxora-gold/5 border border-luxora-gold/10 rounded-sm">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h4 className="text-luxora-gold text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Elite Reservation Summary</h4>
                        <div className="text-white/30 text-[9px] uppercase tracking-widest">Includes selected package & personnel</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Total Premium</div>
                        <div className="text-3xl font-serif text-white font-bold">₹{calculateTotalCost().toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="p-4 bg-luxora-gold/10 border border-luxora-gold/20">
                        <p className="text-luxora-gold text-[9px] uppercase tracking-widest font-bold mb-1">10% Advance Booking</p>
                        <p className="text-white text-xl font-bold">₹{getPaymentBreakdown().advance.toLocaleString()}</p>
                        <p className="text-white/30 text-[8px] uppercase tracking-widest mt-1">To Confirm Reservation</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10">
                        <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold mb-1">90% On Arrival</p>
                        <p className="text-white text-xl font-bold">₹{getPaymentBreakdown().arrival.toLocaleString()}</p>
                        <p className="text-white/30 text-[8px] uppercase tracking-widest mt-1">Pay at Start of Trip</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIP Options - Only for VIP Tier Cars */}
              {selectedCar?.fleetTier === "VIP" && (
                <div className="col-span-2 p-4 bg-red-900/20 border border-red-400/30 rounded-sm">
                  <p className="text-red-400 text-[10px] uppercase tracking-widest font-bold mb-4">
                    Premium VIP Package Options
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 cursor-pointer hover:text-luxora-gold transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedVipOptions.bodyguard}
                        onChange={() => handleVipOptionChange("bodyguard")}
                        className="w-4 h-4 accent-luxora-gold"
                      />
                      <span className="text-white/80 text-[10px] uppercase tracking-widest">
                        Professional Bodyguard (+₹500)
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:text-luxora-gold transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedVipOptions.personalConcierge}
                        onChange={() =>
                          handleVipOptionChange("personalConcierge")
                        }
                        className="w-4 h-4 accent-luxora-gold"
                      />
                      <span className="text-white/80 text-[10px] uppercase tracking-widest">
                        Personal Concierge (+₹500)
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:text-luxora-gold transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedVipOptions.premiumRefreshments}
                        onChange={() =>
                          handleVipOptionChange("premiumRefreshments")
                        }
                        className="w-4 h-4 accent-luxora-gold"
                      />
                      <span className="text-white/80 text-[10px] uppercase tracking-widest">
                        Premium Refreshments (+₹500)
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:text-luxora-gold transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedVipOptions.customRoute}
                        onChange={() => handleVipOptionChange("customRoute")}
                        className="w-4 h-4 accent-luxora-gold"
                      />
                      <span className="text-white/80 text-[10px] uppercase tracking-widest">
                        Custom Route Planning (+₹500)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="col-span-2 md:col-span-1">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                  Pickup Date
                </label>
                <input
                  required
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleInputChange}
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                  Service Type
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors"
                >
                  <option>Elite Chauffeur Service</option>
                  <option>Full Day Disposal</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                  Special Instructions
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors"
                  placeholder="Any specific requirements..."
                ></textarea>
              </div>
              <div className="col-span-2 mt-4">
                <button
                  type="submit"
                  className="w-full py-4 gold-gradient text-luxora-dark font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-sm"
                >
                  Request Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
