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
  const [selectedTier, setSelectedTier] = useState<FleetTier | "All" | null>(null);
  const [fleet, setFleet] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [packageFilter, setPackageFilter] = useState<number | "All">("All");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const loadFleet = async () => {
      const data = await fleetService.getFleet();
      setFleet(data);
    };
    loadFleet();
  }, []);

  // Dynamic car count per tier (respects type filter and search)
  const getCountForTier = (tierId: string) => fleet.filter(c => {
    const tierMatch = c.fleetTier === tierId;
    const typeMatch = filter === "All" || c.type === filter;
    const searchMatch = !searchQuery || 
      c.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.model.toLowerCase().includes(searchQuery.toLowerCase());
    return tierMatch && typeMatch && searchMatch;
  }).length;

  const collections = [
    { 
      id: 'Gold', 
      title: 'Gold Collection', 
      desc: 'Audi A4 · Mercedes C-Class · Compact SUVs', 
      img: '/uploads/sales-audi-sedan.jpg',
      tag: '4hr / 40km — From ₹3,999',
      gradient: 'from-amber-900/80 via-amber-800/40'
    },
    { 
      id: 'Platinum', 
      title: 'Platinum Collection', 
      desc: 'BMW 5 Series · Audi A6 · Jaguar XF · Range Rover', 
      img: '/uploads/sales-bmw-sedan.jpg',
      tag: '4hr / 40km — From ₹5,999',
      gradient: 'from-slate-800/80 via-slate-700/40'
    },
    { 
      id: 'Diamond', 
      title: 'Diamond Collection', 
      desc: 'Mercedes S-Class · BMW 7 Series · Porsche Cayenne · Audi Q7', 
      img: '/images/fleet/cars/1.jpg',
      tag: '4hr / 40km — From ₹8,499',
      gradient: 'from-purple-900/80 via-purple-800/40'
    },
    { 
      id: 'Elite', 
      title: 'Elite Collection', 
      desc: 'Aston Martin · Lamborghini · Exotic Supercars', 
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      tag: '4hr / 40km — From ₹15,999',
      gradient: 'from-orange-900/80 via-orange-800/40'
    },
    { 
      id: 'VIP', 
      title: 'VIP Collection', 
      desc: 'Rolls-Royce · Bentley · Mercedes-Maybach', 
      img: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&q=80&w=800',
      tag: '4hr / 40km — From ₹25,999',
      gradient: 'from-red-900/80 via-red-800/40'
    }
  ];

  const filteredFleet = fleet.filter((car) => {
    const tierMatch = !selectedTier || selectedTier === "All" || car.fleetTier === selectedTier;
    const typeMatch = filter === "All" || car.type === filter;
    const searchMatch = !searchQuery || 
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (car.type && car.type.toLowerCase().includes(searchQuery.toLowerCase()));
    return tierMatch && typeMatch && searchMatch;
  });

  // Filter collections based on search too
  const filteredCollections = collections.filter(col => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    // Check if any car in this tier matches the search
    const hasCar = fleet.some(car => 
      car.fleetTier === col.id && 
      (car.brand.toLowerCase().includes(q) || car.model.toLowerCase().includes(q))
    );
    return col.title.toLowerCase().includes(q) || col.desc.toLowerCase().includes(q) || hasCar;
  });

  const handleBackToCollections = () => {
    setSelectedTier(null);
    setFilter("All");
    setSearchQuery("");
    setPackageFilter("All");
    setFilterOpen(false);
    setTimeout(() => {
      document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <section className="pt-32 pb-24 bg-luxora-dark min-h-screen" id="fleet">
      <div className="container mx-auto px-6 lg:px-24">
        <div className="text-center mb-16">
          <span className="text-luxora-gold font-serif text-[10px] md:text-xs mb-4 tracking-[0.6em] block uppercase">
            Curated Excellence
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-7xl font-serif font-extrabold gold-text mb-4 uppercase tracking-tighter">
            {selectedTier && selectedTier !== "All" ? `${selectedTier} Collection` : "The Elite Collection"}
          </h2>
          <div className="w-24 h-[1px] bg-luxora-gold mx-auto mb-8"></div>
          
          {selectedTier && (
            <button 
              onClick={handleBackToCollections}
              className="text-white/40 hover:text-luxora-gold text-[11px] uppercase tracking-widest flex items-center gap-3 mx-auto transition-all mb-8 py-2 px-6 border border-white/10 hover:border-luxora-gold/40 rounded-full"
            >
              <span className="text-lg">←</span> Back to All Collections
            </button>
          )}
        </div>


        {!selectedTier ? (
          /* ======= Tier Landing View ======= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((col) => {
              const count = getCountForTier(col.id);
              return (
                <div 
                  key={col.id}
                  onClick={() => {
                    setSelectedTier(col.id as FleetTier);
                    setFilter("All");
                    setTimeout(() => {
                      document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-white/10 hover:border-luxora-gold/50 cursor-pointer transition-all duration-700 shadow-2xl hover:shadow-luxora-gold/20"
                >
                  {/* Background Image */}
                  <img 
                    src={col.img} 
                    alt={col.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50 group-hover:opacity-70"
                    loading="lazy"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${col.gradient} to-transparent`}></div>
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-6 md:p-8 flex flex-col justify-end">
                    {/* Car Count Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-luxora-gold/90 text-luxora-dark text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                        {count} {count === 1 ? 'Car' : 'Cars'}
                      </span>
                    </div>

                    <span className="text-luxora-gold text-[8px] uppercase tracking-[0.5em] font-bold mb-2">
                      {col.tag}
                    </span>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white uppercase tracking-tight mb-2 group-hover:text-luxora-gold transition-colors duration-500">
                      {col.title}
                    </h3>
                    <p className="text-white/40 text-[10px] md:text-xs tracking-widest uppercase mb-4 group-hover:text-white/60 transition-colors">
                      {col.desc}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-[1px] w-12 bg-luxora-gold transition-all duration-500 group-hover:w-20"></div>
                      <span className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold group-hover:text-luxora-gold transition-all">
                        Explore →
                      </span>
                    </div>
                  </div>

                  {/* Decorative inner border */}
                  <div className="absolute top-3 left-3 right-3 bottom-3 border border-white/5 pointer-events-none group-hover:border-luxora-gold/15 transition-all duration-500 rounded-md"></div>
                </div>
              );
            })}
            
            {/* View All Card */}
            <div 
              onClick={() => {
                setSelectedTier("All");
                setFilter("All");
                setTimeout(() => {
                  document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-white/5 hover:border-luxora-gold/30 cursor-pointer transition-all duration-500 bg-gradient-to-br from-luxora-charcoal/40 to-black/40 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm"
            >
              <div className="absolute top-4 right-4">
                <span className="bg-white/10 text-white/50 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                  {fleet.length} Total
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white/40 uppercase tracking-widest mb-4 group-hover:text-luxora-gold transition-colors">
                View All Assets
              </h3>
              <p className="text-white/20 text-[10px] uppercase tracking-widest leading-relaxed">
                Browse our entire stable of <br/> luxury vehicles
              </p>
              <div className="mt-6 w-12 h-12 rounded-full border border-white/10 group-hover:border-luxora-gold/40 flex items-center justify-center transition-all">
                <span className="text-white/20 text-xl group-hover:text-luxora-gold transition-all">→</span>
              </div>
            </div>
          </div>
        ) : (
          /* ======= Drill-down Collection View ======= */
          <div>
            {/* Search Bar with Filter Icon */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="relative flex items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by brand, model, or type..."
                    className="w-full bg-white/5 border border-white/10 focus:border-luxora-gold/50 rounded-full px-6 py-3.5 pl-12 text-white text-sm placeholder:text-white/30 outline-none transition-all focus:bg-white/[0.07] focus:shadow-lg focus:shadow-luxora-gold/5"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-luxora-gold text-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`relative flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                    filterOpen || filter !== "All" || packageFilter !== "All"
                      ? "border-luxora-gold/60 bg-luxora-gold/10 text-luxora-gold"
                      : "border-white/15 bg-white/5 text-white/40 hover:text-white/70 hover:border-white/25"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                  {/* Active filter indicator dot */}
                  {(filter !== "All" || packageFilter !== "All") && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-luxora-gold rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Filter Dropdown Panel */}
              {filterOpen && (
                <div className="mt-3 bg-luxora-charcoal/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Vehicle Type */}
                    <div className="flex-1">
                      <label className="text-white/30 text-[9px] uppercase tracking-[0.3em] font-bold mb-2 block">Vehicle Type</label>
                      <div className="flex flex-wrap gap-2">
                        {["All", "SUV", "Sedan", "Luxury"].map((t) => (
                          <button
                            key={t}
                            onClick={() => setFilter(t as any)}
                            className={`text-[9px] uppercase tracking-[0.2em] font-bold px-4 py-1.5 transition-all border rounded-full ${
                              filter === t
                                ? "border-luxora-gold bg-luxora-gold/15 text-luxora-gold"
                                : "border-white/10 text-white/30 hover:text-white/60 hover:border-white/20"
                            }`}
                          >
                            {t === "All" ? "All" : t === "Luxury" ? "Ultra-Luxury" : t}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Package Duration */}
                    <div className="flex-1">
                      <label className="text-white/30 text-[9px] uppercase tracking-[0.3em] font-bold mb-2 block">Package</label>
                      <div className="flex flex-wrap gap-2">
                        {(["All", 4, 8, 12, 24] as (number | "All")[]).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPackageFilter(p)}
                            className={`text-[9px] uppercase tracking-[0.2em] font-bold px-4 py-1.5 transition-all border rounded-full ${
                              packageFilter === p
                                ? "border-luxora-gold bg-luxora-gold/15 text-luxora-gold"
                                : "border-white/10 text-white/30 hover:text-white/60 hover:border-white/20"
                            }`}
                          >
                            {p === "All" ? "All" : `${p}hr`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Active Filters Summary + Clear */}
                  {(filter !== "All" || packageFilter !== "All") && (
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {filter !== "All" && (
                          <span className="text-[9px] uppercase tracking-widest bg-luxora-gold/10 text-luxora-gold border border-luxora-gold/20 rounded-full px-3 py-1">
                            {filter === "Luxury" ? "Ultra-Luxury" : filter}
                          </span>
                        )}
                        {packageFilter !== "All" && (
                          <span className="text-[9px] uppercase tracking-widest bg-luxora-gold/10 text-luxora-gold border border-luxora-gold/20 rounded-full px-3 py-1">
                            {packageFilter}hr Package
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => { setFilter("All"); setPackageFilter("All"); }}
                        className="text-[9px] uppercase tracking-widest text-white/30 hover:text-luxora-gold transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {filteredFleet.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {filteredFleet.map((car) => {
                  const displayImages = car.images && car.images.length > 0 ? car.images : [car.image];

                  return (
                    <div
                      key={car.id}
                      className="group relative bg-gradient-to-b from-luxora-charcoal to-black/60 overflow-hidden border border-white/10 hover:border-luxora-gold/50 transition-all duration-500 rounded-lg flex flex-col h-full shadow-2xl hover:shadow-luxora-gold/10"
                    >
                      {/* Image Section */}
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <ImageCarousel
                          images={displayImages}
                          alt={`${car.brand} ${car.model}`}
                        />
                        
                        {/* Vehicle Type Label */}
                        <div className="absolute top-4 left-4 z-20">
                          <span className="bg-luxora-gold text-luxora-dark text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-xl flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-black/20 rounded-full"></span>
                             {car.type === "Luxury" ? "Ultra-Luxury" : car.type}
                          </span>
                        </div>

                        {/* Tier Badge */}
                        <div className="absolute top-4 right-4 z-20">
                          <span className="bg-black/70 backdrop-blur-md text-white/70 text-[8px] uppercase tracking-[0.2em] px-3 py-1.5 border border-white/10 rounded-sm">
                            {car.fleetTier}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <span className="text-luxora-gold text-[10px] uppercase tracking-[0.4em] mb-1 block font-extrabold opacity-70">
                              {car.brand}
                            </span>
                            <h3 className="text-xl md:text-2xl font-serif font-black text-white leading-tight uppercase tracking-tighter group-hover:text-luxora-gold transition-colors">
                              {car.model}
                            </h3>
                          </div>
                          <div className="text-right flex-shrink-0 bg-luxora-charcoal/80 rounded-lg p-3 border border-luxora-gold/20">
                            <span className="text-white/30 text-[7px] uppercase tracking-widest block mb-1">From</span>
                            <span className="text-luxora-gold font-bold text-lg block">
                              ₹{(() => {
                                if (!car.packages || car.packages.length === 0) return car.pricePerHour.toLocaleString("en-IN");
                                const pkg = packageFilter !== "All" 
                                  ? car.packages.find(p => p.duration === packageFilter) || car.packages[0]
                                  : car.packages[0];
                                return pkg.price.toLocaleString("en-IN");
                              })()}
                            </span>
                            <span className="text-white/20 text-[7px] uppercase tracking-widest block mt-1">
                              {(() => {
                                if (!car.packages || car.packages.length === 0) return "/hr";
                                const pkg = packageFilter !== "All" 
                                  ? car.packages.find(p => p.duration === packageFilter) || car.packages[0]
                                  : car.packages[0];
                                return `${pkg.duration}hr / ${pkg.kmLimit}km`;
                              })()}
                            </span>
                          </div>
                        </div>

                        <p className="text-white/40 text-xs mb-4 font-light leading-relaxed line-clamp-2 italic border-l border-luxora-gold/20 pl-3">
                          {car.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-4 py-4 border-y border-white/5">
                          {car.features.slice(0, 4).map((feature, idx) => (
                            <div
                              key={idx}
                              className="flex items-center text-[9px] text-white/50 uppercase tracking-wider"
                            >
                              <span className="text-luxora-gold mr-2 text-[6px]">✦</span>
                              <span className="truncate">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mb-6">
                          <span className="text-white/30 text-[9px] uppercase tracking-widest">{car.seats} Seater</span>
                          <span className="text-white/20 text-[9px] uppercase tracking-widest">{car.type}</span>
                        </div>

                        <button
                          onClick={() => onBook(car.id)}
                          className="w-full mt-auto py-3.5 bg-transparent border-2 border-luxora-gold/30 text-luxora-gold uppercase tracking-[0.2em] text-[9px] font-black hover:bg-luxora-gold hover:text-luxora-dark hover:border-luxora-gold transition-all duration-300 rounded-sm"
                        >
                          Reserve Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-white/20 font-serif font-bold text-2xl tracking-widest uppercase opacity-50 mb-4">
                  No vehicles found
                </p>
                <p className="text-white/10 text-xs uppercase tracking-widest">
                  Try a different vehicle type filter
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FleetSection;

