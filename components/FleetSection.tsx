import React, { useState, useEffect } from "react";
import { fleetService } from "../services/fleetService";
import { Car, FleetTier } from "../types";

interface FleetSectionProps {
  onBook: (carId: string) => void;
}

const ImageCarousel: React.FC<{ images: string[]; alt: string }> = ({
  images,
  alt,
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images]);

  if (!images || images.length === 0)
    return (
      <div className="w-full h-full bg-luxora-charcoal flex items-center justify-center text-white/10 uppercase tracking-widest text-xs">
        No Image
      </div>
    );

  return (
    <div className="w-full h-full relative group/carousel overflow-hidden">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${alt} - view ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-in-out ${
            idx === current
              ? "opacity-100 scale-100"
              : "opacity-0 scale-110 pointer-events-none"
          }`}
        />
      ))}

      {/* Progress indicators instead of dots for a cleaner wait look */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 px-4 flex space-x-2 z-10">
          {images.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-[2px] bg-white/10 overflow-hidden rounded-full"
            >
              <div
                className={`h-full bg-luxora-gold transition-all duration-[5000ms] ease-linear ${
                  idx === current ? "w-full" : "w-0"
                }`}
                style={{
                  transitionDuration: idx === current ? "5000ms" : "0ms",
                }}
              ></div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((prev) => (prev - 1 + images.length) % images.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/50 hover:bg-luxora-gold hover:text-luxora-dark flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 z-10 border border-white/5"
          >
            ←
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((prev) => (prev + 1) % images.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/50 hover:bg-luxora-gold hover:text-luxora-dark flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 z-10 border border-white/5"
          >
            →
          </button>
        </>
      )}
    </div>
  );
};

const FleetSection: React.FC<FleetSectionProps> = ({ onBook }) => {
  const [filter, setFilter] = useState<"All" | "Sedan" | "SUV" | "Luxury">(
    "All",
  );
  const [tierFilter, setTierFilter] = useState<"All" | FleetTier>("All");
  const [fleet, setFleet] = useState<Car[]>([]);

  useEffect(() => {
    const loadFleet = async () => {
      const data = await fleetService.getFleet();
      setFleet(data);
    };
    loadFleet();
  }, []);

  const filteredFleet = fleet.filter((car) => {
    const typeMatch = filter === "All" || car.type === filter;
    const tierMatch = tierFilter === "All" || car.fleetTier === tierFilter;
    return typeMatch && tierMatch;
  });

  return (
    <section className="py-24 bg-luxora-dark" id="fleet">
      <div className="container mx-auto px-6 sm:px-12 md:px-16 lg:px-24 xl:px-48">
        <div className="text-center mb-16 reveal">
          <span className="text-luxora-gold font-serif text-[10px] md:text-xs mb-4 tracking-[0.6em] block uppercase">
            Curated Excellence
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-extrabold gold-text mb-4 uppercase tracking-tighter">
            The Elite Collection
          </h2>
          <div className="w-24 h-[1px] bg-luxora-gold mx-auto mb-8"></div>

          {/* Filters Section */}
          <div className="max-w-4xl mx-auto">
            {/* Vehicle Type Filter */}
            <div className="mb-6">
              <p className="text-luxora-gold text-[9px] uppercase tracking-[0.4em] font-bold mb-3">
                Vehicle Type
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {["All", "Sedan", "SUV", "Luxury"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat as any)}
                    className={`px-5 py-2 text-xs uppercase tracking-widest transition-all rounded-full border ${
                      filter === cat
                        ? "bg-luxora-gold text-luxora-dark border-luxora-gold font-bold"
                        : "text-white/40 border-white/10 hover:border-luxora-gold/50"
                    }`}
                  >
                    {cat === "Luxury"
                      ? "Ultra-Luxury"
                      : cat === "All"
                        ? "All Types"
                        : cat + "s"}
                  </button>
                ))}
              </div>
            </div>

            {/* Fleet Tier Filter */}
            <div>
              <p className="text-luxora-gold text-[9px] uppercase tracking-[0.4em] font-bold mb-3">
                Fleet Tier
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {["All", "Normal", "Elite", "Platinum", "VIP"].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier as any)}
                    className={`px-5 py-2 text-xs uppercase tracking-widest transition-all rounded-full border ${
                      tierFilter === tier
                        ? "bg-luxora-gold text-luxora-dark border-luxora-gold font-bold"
                        : "text-white/40 border-white/10 hover:border-luxora-gold/50"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mt-16">
            {filteredFleet.map((car) => {
              // Robust fallback for images array
              const displayImages =
                car.images && car.images.length > 0
                  ? car.images
                  : [
                      car.image,
                      car.image
                        .replace("1.jpg", "2.jpg")
                        .replace("1.webp", "2.jpg"),
                      car.image
                        .replace("1.jpg", "3.jpg")
                        .replace("1.webp", "3.jpg"),
                    ].filter((v, i, a) => a.indexOf(v) === i); // Deduplicate

              return (
                <div
                  key={car.id}
                  className="group relative bg-gradient-to-b from-luxora-charcoal to-black/60 overflow-hidden border border-white/10 hover:border-luxora-gold/50 transition-all duration-500 rounded-lg flex flex-col h-full shadow-2xl hover:shadow-luxora-gold/20 reveal gold-aura-hover"
                >
                  {/* Image Section */}
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <ImageCarousel
                      images={displayImages}
                      alt={`${car.brand} ${car.model}`}
                    />

                    {/* Premium Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none"></div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <span className="bg-luxora-dark/90 backdrop-blur-md text-luxora-gold text-[10px] uppercase tracking-widest px-3 py-1.5 border border-luxora-gold/40 rounded-sm font-bold">
                        {car.type === "Luxury" ? "Ultra-Luxury" : car.type}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-widest px-3 py-1.5 border rounded-sm font-bold backdrop-blur-md transition-all ${
                          car.fleetTier === "VIP"
                            ? "bg-red-600/80 text-red-100 border-red-400/60"
                            : car.fleetTier === "Platinum"
                              ? "bg-blue-600/80 text-blue-100 border-blue-400/60"
                              : car.fleetTier === "Elite"
                                ? "bg-amber-600/80 text-amber-100 border-amber-400/60"
                                : "bg-white/20 text-white border-white/40"
                        }`}
                      >
                        {car.fleetTier} Tier
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 md:p-6 flex-grow flex flex-col">
                    {/* Header with Brand and Price */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 mr-4">
                        <span className="text-luxora-gold text-[9px] uppercase tracking-[0.3em] mb-1 block font-bold opacity-80">
                          {car.brand}
                        </span>
                        <h3 className="text-xl md:text-2xl font-serif font-extrabold text-white leading-none uppercase tracking-tight">
                          {car.model}
                        </h3>
                      </div>
                      <div className="text-right flex-shrink-0 bg-luxora-charcoal/80 rounded-lg p-3 border border-luxora-gold/20">
                        <span className="text-luxora-gold font-bold text-xl md:text-2xl block">
                          ₹{car.pricePerHour.toLocaleString("en-IN")}
                        </span>
                        <span className="text-white/40 text-[9px] uppercase tracking-widest block mt-1">
                          / hour
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/50 text-xs md:text-sm mb-4 font-normal leading-relaxed line-clamp-2 border-l-2 border-luxora-gold/40 pl-3">
                      {car.description}
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 mb-4 py-3 border-y border-white/5">
                      {car.features.slice(0, 4).map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center text-[9px] text-white/60 uppercase tracking-wider"
                        >
                          <div className="w-1.5 h-1.5 bg-luxora-gold rounded-full mr-2 opacity-70 flex-shrink-0"></div>
                          <span className="line-clamp-1">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* VIP Options Section */}
                    {car.fleetTier === "VIP" &&
                      car.vipOptions &&
                      Object.values(car.vipOptions).some((v) => v) && (
                        <div className="mb-4 p-3.5 bg-gradient-to-r from-red-900/30 to-red-900/10 border border-red-400/40 rounded-lg backdrop-blur-sm">
                          <p className="text-red-300 text-[8px] uppercase tracking-[0.3em] font-bold mb-2.5 opacity-90">
                            ✦ Premium VIP Services
                          </p>
                          <div className="space-y-1.5">
                            {car.vipOptions.bodyguard && (
                              <div className="text-[8px] text-red-200/80 flex items-center gap-2">
                                <span className="text-red-400">●</span>
                                <span>Professional Bodyguard</span>
                              </div>
                            )}
                            {car.vipOptions.personalConcierge && (
                              <div className="text-[8px] text-red-200/80 flex items-center gap-2">
                                <span className="text-red-400">●</span>
                                <span>Personal Concierge</span>
                              </div>
                            )}
                            {car.vipOptions.premiumRefreshments && (
                              <div className="text-[8px] text-red-200/80 flex items-center gap-2">
                                <span className="text-red-400">●</span>
                                <span>Premium Refreshments</span>
                              </div>
                            )}
                            {car.vipOptions.customRoute && (
                              <div className="text-[8px] text-red-200/80 flex items-center gap-2">
                                <span className="text-red-400">●</span>
                                <span>Custom Route Planning</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {/* CTA Button */}
                    <button
                      onClick={() => onBook(car.id)}
                      className="w-full mt-auto py-3.5 border-2 border-luxora-gold/50 text-luxora-gold uppercase tracking-[0.15em] text-[9px] font-bold hover:bg-luxora-gold hover:text-luxora-dark hover:border-luxora-gold transition-all duration-300 group-hover:border-luxora-gold/80 rounded-lg bg-luxora-dark/50 backdrop-blur-sm"
                    >
                      Reserve Now
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredFleet.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-white/20 font-serif font-bold text-2xl tracking-widest uppercase opacity-50">
                  No assets available in this category currently.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FleetSection;
