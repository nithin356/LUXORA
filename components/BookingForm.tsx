import React, { useState, useEffect } from "react";
import { fleetService } from "../services/fleetService";
import { bookingService } from "../services/bookingService";
import { Car } from "../types";

const BookingForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [fleet, setFleet] = useState<Car[]>([]);
  const [selectedVipOptions, setSelectedVipOptions] = useState({
    bodyguard: false,
    personalConcierge: false,
    premiumRefreshments: false,
    customRoute: false,
  });
  const [bookingHours, setBookingHours] = useState(1);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    carId: "",
    pickupDate: "",
    duration: "Full Day Disposal",
    message: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const cars = await fleetService.getFleet();
      setFleet(cars);
      if (cars.length > 0 && !formData.carId) {
        setFormData((prev) => ({ ...prev, carId: cars[0].id }));
      }
    };
    loadData();
  }, []);

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
    let cost = selectedCar.pricePerHour * bookingHours;
    // Add VIP option costs (example: each option adds 500)
    const vipCount = Object.values(selectedVipOptions).filter((v) => v).length;
    cost += vipCount * 500;
    return cost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const vipNote = Object.entries(selectedVipOptions)
      .filter(([_, selected]) => selected)
      .map(([option, _]) => option.replace(/([A-Z])/g, " $1"))
      .join(", ");

    await bookingService.addEnquiry({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      carId: formData.carId,
      carModel: selectedCar
        ? `${selectedCar.brand} ${selectedCar.model} (${selectedCar.fleetTier} Tier)`
        : "Unknown Car",
      pickupDate: formData.pickupDate,
      duration: formData.duration,
      message: `Hours: ${bookingHours} | VIP Options: ${vipNote || "None"} | Total: ₹${calculateTotalCost()}\n\n${formData.message}`,
    });

    // Smooth scroll to top to see success message
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="py-24 bg-luxora-dark min-h-screen flex items-center">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-xl mx-auto bg-luxora-charcoal p-12 border border-luxora-gold/30 rounded-sm shadow-2xl">
            <div className="w-20 h-20 bg-luxora-gold/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-10 h-10 text-luxora-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-3xl font-serif font-bold gold-text mb-4">
              Reservation Requested
            </h2>
            <p className="text-white/60 mb-8">
              Thank you, sir. Our concierge team will contact you within 15
              minutes to finalize your elite arrangements.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-8 py-3 border border-luxora-gold text-luxora-gold uppercase tracking-widest text-sm hover:bg-luxora-gold hover:text-luxora-dark transition-all"
            >
              Request Another Service
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-luxora-dark overflow-hidden">
      <div className="container mx-auto px-6 reveal">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-white/5 glass-card">
          {/* Left Side: Info */}
          <div className="md:w-1/3 bg-luxora-gold p-10 flex flex-col justify-between">
            <div>
              <h2 className="text-luxora-dark text-4xl font-serif font-bold mb-6">
                Book Your Journey
              </h2>
              <p className="text-luxora-dark/80 font-medium leading-relaxed mb-8">
                Reserve your experience today and the gold standard of elite
                lifestyle services in Bengaluru.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-luxora-dark">
                  <span className="w-8">💬</span>
                  <a
                    href="https://wa.me/918050213366"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold hover:underline"
                  >
                    WhatsApp: +91 80503 23366
                  </a>
                </div>
                <div className="flex items-center text-luxora-dark">
                  <span className="w-8">✉️</span>
                  <span className="font-bold">concierge@luxora.in</span>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-12 border-t border-luxora-dark/10">
              <p className="text-luxora-dark/60 text-sm italic">
                "Punctuality is not just a habit, it's our promise."
              </p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-2/3 bg-luxora-charcoal p-10">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="col-span-2 md:col-span-1">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  required
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  type="text"
                  className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <input
                  required
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  type="tel"
                  className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  required
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  type="email"
                  className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors"
                />
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
                  {fleet.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.brand} {car.model} - {car.fleetTier} Tier (₹
                      {car.pricePerHour}/hr)
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Car Info */}
              {selectedCar && (
                <div className="col-span-2 p-4 bg-luxora-gold/10 border border-luxora-gold/20 rounded-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-luxora-gold text-[9px] uppercase tracking-widest font-bold">
                        Hourly Rate
                      </p>
                      <p className="text-white text-lg font-bold">
                        ₹{selectedCar.pricePerHour.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-luxora-gold text-[9px] uppercase tracking-widest font-bold">
                        Fleet Tier
                      </p>
                      <p className="text-white text-lg font-bold">
                        {selectedCar.fleetTier}
                      </p>
                    </div>
                    <div>
                      <p className="text-luxora-gold text-[9px] uppercase tracking-widest font-bold">
                        Duration (Hours)
                      </p>
                      <input
                        type="number"
                        value={bookingHours}
                        onChange={(e) =>
                          setBookingHours(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        min="1"
                        max="24"
                        className="w-16 bg-luxora-dark border border-white/10 p-2 text-white focus:outline-none focus:border-luxora-gold transition-colors"
                      />
                    </div>
                    <div>
                      <p className="text-luxora-gold text-[9px] uppercase tracking-widest font-bold">
                        Estimated Total
                      </p>
                      <p className="text-luxora-gold text-lg font-bold">
                        ₹{calculateTotalCost().toLocaleString()}
                      </p>
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
