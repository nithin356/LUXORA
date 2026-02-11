
import React, { useState, useEffect } from 'react';
import { fleetService } from '../services/fleetService';
import { Car, FleetTier } from '../types';

interface FleetSectionProps {
  onBook: (carId: string) => void;
}

const ImageCarousel: React.FC<{ images: string[]; alt: string }> = ({ images, alt }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images]);

  if (!images || images.length === 0) return <div className="w-full h-full bg-luxora-charcoal flex items-center justify-center text-white/10 uppercase tracking-widest text-xs">No Image</div>;

  return (
    <div className="w-full h-full relative group/carousel overflow-hidden">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${alt} - view ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-in-out ${
            idx === current ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
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
                  idx === current ? 'w-full' : 'w-0'
                }`}
                style={{ transitionDuration: idx === current ? '5000ms' : '0ms' }}
              ></div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrent(prev => (prev - 1 + images.length) % images.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/50 hover:bg-luxora-gold hover:text-luxora-dark flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 z-10 border border-white/5"
          >
            ←
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrent(prev => (prev + 1) % images.length); }}
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
  const [filter, setFilter] = useState<'All' | 'Sedan' | 'SUV' | 'Luxury'>('All');
  const [tierFilter, setTierFilter] = useState<'All' | FleetTier>('All');
  const [fleet, setFleet] = useState<Car[]>([]);

  useEffect(() => {
    const loadFleet = async () => {
      const data = await fleetService.getFleet();
      setFleet(data);
    };
    loadFleet();
  }, []);

  const filteredFleet = fleet.filter(car => {
    const typeMatch = filter === 'All' || car.type === filter;
    const tierMatch = tierFilter === 'All' || car.fleetTier === tierFilter;
    return typeMatch && tierMatch;
  });

  return (
    <section className="py-24 bg-luxora-dark" id="fleet">
      <div className="container mx-auto px-6 sm:px-12 md:px-16 lg:px-24 xl:px-48">
        <div className="text-center mb-16">
          <span className="text-luxora-gold font-serif text-[10px] md:text-xs mb-4 tracking-[0.6em] block uppercase">Curated Excellence</span>
          <h2 className="text-3xl md:text-5xl font-serif font-medium gold-text mb-4 uppercase tracking-tight">The Elite Collection</h2>
          <div className="w-24 h-[1px] bg-luxora-gold mx-auto mb-8"></div>
          
          {/* Type Filter */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 mb-6">
            {['All', 'Sedan', 'SUV', 'Luxury'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat as any)}
                className={`px-6 py-2 text-xs uppercase tracking-widest transition-all rounded-full border ${
                  filter === cat 
                    ? 'bg-luxora-gold text-luxora-dark border-luxora-gold font-bold' 
                    : 'text-white/40 border-white/10 hover:border-luxora-gold/50'
                }`}
              >
                {cat === 'Luxury' ? 'Ultra-Luxury' : cat + 's'}
              </button>
            ))}
          </div>

          {/* Fleet Tier Filter */}
          <div className="flex flex-wrap justify-center gap-4">
            {['All', 'Normal', 'Elite', 'Platinum', 'VIP'].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier as any)}
                className={`px-6 py-2 text-xs uppercase tracking-widest transition-all rounded-full border ${
                  tierFilter === tier 
                    ? 'bg-luxora-gold text-luxora-dark border-luxora-gold font-bold' 
                    : 'text-white/40 border-white/10 hover:border-luxora-gold/50'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredFleet.map((car) => {
            // Robust fallback for images array
            const displayImages = (car.images && car.images.length > 0) 
              ? car.images 
              : [
                  car.image,
                  car.image.replace('1.jpg', '2.jpg').replace('1.webp', '2.jpg'),
                  car.image.replace('1.jpg', '3.jpg').replace('1.webp', '3.jpg'),
                ].filter((v, i, a) => a.indexOf(v) === i); // Deduplicate

            return (
              <div 
                key={car.id} 
                className="group relative bg-luxora-charcoal overflow-hidden border border-white/5 hover:border-luxora-gold/30 transition-all duration-500 rounded-sm flex flex-col h-full"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <ImageCarousel images={displayImages} alt={`${car.brand} ${car.model}`} />
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      <span className="bg-luxora-dark/80 backdrop-blur-sm text-luxora-gold text-[10px] uppercase tracking-widest px-3 py-1 border border-luxora-gold/20">
                          {car.type === 'Luxury' ? 'Ultra-Luxury' : car.type}
                      </span>
                      <span className={`text-[10px] uppercase tracking-widest px-3 py-1 border font-bold ${
                        car.fleetTier === 'VIP' ? 'bg-red-900/60 text-red-300 border-red-400/30' :
                        car.fleetTier === 'Platinum' ? 'bg-blue-900/60 text-blue-300 border-blue-400/30' :
                        car.fleetTier === 'Elite' ? 'bg-yellow-900/60 text-yellow-300 border-yellow-400/30' :
                        'bg-white/10 text-white/70 border-white/20'
                      }`}>
                          {car.fleetTier} Tier
                      </span>
                  </div>
                </div>
              
              <div className="p-6 md:p-8 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
                    <span className="text-luxora-gold text-[10px] uppercase tracking-[0.2em] mb-1 block font-bold">{car.brand}</span>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-white leading-tight">{car.model}</h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-luxora-gold font-bold text-lg md:text-xl block">₹{car.pricePerHour.toLocaleString('en-IN')}</span>
                    <span className="text-white/30 text-[10px] uppercase tracking-widest block">per hour</span>
                  </div>
                </div>

                <p className="text-white/50 text-xs md:text-sm mb-6 font-light leading-relaxed line-clamp-2 italic">
                  "{car.description}"
                </p>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-8 mt-auto">
                  {car.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-[10px] text-white/40 uppercase tracking-wider">
                      <div className="w-1 h-1 bg-luxora-gold rounded-full mr-2 opacity-60"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {car.fleetTier === 'VIP' && car.vipOptions && Object.values(car.vipOptions).some(v => v) && (
                  <div className="mb-6 p-3 bg-red-900/20 border border-red-400/20 rounded-sm">
                    <p className="text-red-400 text-[9px] uppercase tracking-widest font-bold mb-2">VIP Options Available</p>
                    <div className="space-y-1">
                      {car.vipOptions.bodyguard && <div className="text-[9px] text-white/60">✓ Professional Bodyguard</div>}
                      {car.vipOptions.personalConcierge && <div className="text-[9px] text-white/60">✓ Personal Concierge</div>}
                      {car.vipOptions.premiumRefreshments && <div className="text-[9px] text-white/60">✓ Premium Refreshments</div>}
                      {car.vipOptions.customRoute && <div className="text-[9px] text-white/60">✓ Custom Route Planning</div>}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => onBook(car.id)}
                  className="w-full py-4 border border-luxora-gold/30 text-luxora-gold uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-luxora-gold hover:text-luxora-dark transition-all duration-300 group-hover:border-luxora-gold"
                >
                  Book Experience
                </button>
              </div>
            </div>
          );
        })}
          {filteredFleet.length === 0 && (
            <div className="col-span-full text-center py-20">
              <p className="text-white/20 italic font-serif text-xl tracking-widest">No assets available in this category currently.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FleetSection;
