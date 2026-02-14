import React, { useState, useEffect } from 'react';

const AboutSection: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-luxora-dark overflow-hidden relative border-t border-white/5">
      {/* Parallax Background Text */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] md:text-[20vw] font-serif font-black text-white/[0.02] uppercase tracking-[0.2em] pointer-events-none select-none z-0 whitespace-nowrap"
        style={{ transform: `translate(-50%, calc(-50% + ${scrollY * 0.05}px))` }}
      >
        Heritage
      </div>
      <div className="container mx-auto px-6 sm:px-12 md:px-16 lg:px-24 xl:px-48 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Professional Portfolio Grid */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              {/* Land */}
              <div className="relative group overflow-hidden rounded-sm border border-white/5">
                <img 
                  src="/images/fleet/cars/1_first.jpg" 
                  alt="Elite Fleet" 
                  className="w-full h-48 md:h-60 object-cover group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute top-4 left-4 text-[7px] uppercase tracking-[0.3em] text-white/60 font-bold px-2 py-1 border border-white/10 bg-black/40 backdrop-blur-sm">Land</div>
              </div>

              {/* Air */}
              <div className="relative group overflow-hidden rounded-sm border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&q=95&w=1200" 
                  alt="Private Aviation" 
                  className="w-full h-48 md:h-60 object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute top-4 left-4 text-[7px] uppercase tracking-[0.3em] text-white/60 font-bold px-2 py-1 border border-white/10 bg-black/40 backdrop-blur-sm">Air</div>
              </div>

              {/* Sea */}
              <div className="relative group overflow-hidden rounded-sm border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=95&w=1200" 
                  alt="Elite Yachts" 
                  className="w-full h-48 md:h-60 object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute top-4 left-4 text-[7px] uppercase tracking-[0.3em] text-white/60 font-bold px-2 py-1 border border-white/10 bg-black/40 backdrop-blur-sm">Sea</div>
              </div>

              {/* Estates */}
              <div className="relative group overflow-hidden rounded-sm border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=95&w=1200" 
                  alt="Luxury Estates" 
                  className="w-full h-48 md:h-60 object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute top-4 left-4 text-[7px] uppercase tracking-[0.3em] text-white/60 font-bold px-2 py-1 border border-white/10 bg-black/40 backdrop-blur-sm">Estates</div>
              </div>
            </div>
          </div>
          
          {/* Content Column */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="max-w-xl">
              <span className="text-luxora-gold font-futuristic text-[9px] md:text-[10px] mb-4 tracking-[0.5em] block uppercase font-black">Our Heritage</span>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-8 leading-tight uppercase tracking-tight">
                Bengaluru’s <span className="gold-text">Premier</span><br />
                Luxury Ecosystem
              </h2>

              <div className="space-y-6 text-white/50 leading-relaxed font-light text-sm md:text-base mb-12">
                <p className="border-l border-luxora-gold/20 pl-6">
                  Luxora is Bengaluru’s premier gateway to an elite lifestyle, delivering multi-vertical luxury experiences through a curated ecosystem of world-class assets.
                </p>
                <p>
                  From high-protocol corporate travel to bespoke private celebrations, we manage the logistics of the extraordinary, serving as a singular partner for prestigious services across land, air, and sea.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 border-t border-white/5 pt-10">
                <div>
                  <h4 className="text-luxora-gold font-serif text-xl sm:text-2xl md:text-3xl font-black mb-1 uppercase tracking-tight">Tailored</h4>
                  <p className="text-white/20 text-[9px] uppercase tracking-[0.3em] font-bold">Bespoke Excellence</p>
                </div>
                <div>
                  <h4 className="text-luxora-gold font-serif text-xl sm:text-2xl md:text-3xl font-black mb-1 uppercase tracking-tight">Protocol</h4>
                  <p className="text-white/20 text-[9px] uppercase tracking-[0.3em] font-bold">Elite Certified</p>
                </div>
              </div>

              <div className="flex">
                <button 
                  className="px-8 py-3 border border-white/10 text-white/40 text-[10px] uppercase tracking-[0.3em] font-black hover:border-white/30 hover:text-white transition-all duration-300 rounded-none"
                >
                  The Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
