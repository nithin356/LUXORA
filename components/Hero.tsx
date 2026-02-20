
import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../types';

interface HeroProps {
  onExplore: (page: Page) => void;
}

const slides = [
  // Cars
  {
    image: "/images/fleet/cars/forhome.png",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Premier Car Service",
    title: "Refining the Art of",
    highlight: "Travel",
    desc: "Elite chauffeur-driven experiences across Bengaluru's most prestigious routes.",
    target: Page.Fleet,
    button: "Our Fleet"
  },
  {
    image: "/images/fleet/cars/1_first.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Premier Car Service",
    title: "Refining the Art of",
    highlight: "Travel",
    desc: "Elite chauffeur-driven experiences across Bengaluru's most prestigious routes.",
    target: Page.Fleet,
    button: "Our Fleet"
  },
  {
    image: "/images/fleet/cars/2.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Premier Car Service",
    title: "Luxury",
    highlight: "Performance",
    desc: "Experience the thrill of driving our premium fleet.",
    target: Page.Fleet,
    button: "Our Fleet"
  },
  {
    image: "/images/fleet/cars/3.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Premier Car Service",
    title: "Elegant",
    highlight: "Journeys",
    desc: "Arrive in style with our chauffeur services.",
    target: Page.Fleet,
    button: "Our Fleet"
  },
  // Helicopters
  {
    image: "/images/fleet/helicopter/1.webp",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "AERIAL MOBILITY",
    title: "Swift Urban",
    highlight: "Transfers",
    desc: "Point-to-point urban aerial mobility via our fleet of elite helicopters.",
    target: Page.CharteredFlights,
    button: "Book Chopper"
  },
  {
    image: "/images/fleet/helicopter/2.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "AERIAL MOBILITY",
    title: "Sky High",
    highlight: "Excellence",
    desc: "Experience the city from a new perspective.",
    target: Page.CharteredFlights,
    button: "Book Chopper"
  },
  {
    image: "/images/fleet/helicopter/3.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "AERIAL MOBILITY",
    title: "Urban",
    highlight: "Freedom",
    desc: "Avoid the traffic and travel in comfort.",
    target: Page.CharteredFlights,
    button: "Book Chopper"
  },
  // Jets
  {
    image: "/images/fleet/jets/1.png",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Private Aviation",
    title: "High-Altitude",
    highlight: "Excellence",
    desc: "Bespoke chartered flights tailored for the requirements of the global traveler.",
    target: Page.CharteredFlights,
    button: "Aviation"
  },
  {
    image: "/images/fleet/jets/2.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Private Aviation",
    title: "Global",
    highlight: "Access",
    desc: "Fly to your destination on your own schedule.",
    target: Page.CharteredFlights,
    button: "Aviation"
  },
  {
    image: "/images/fleet/jets/3.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Private Aviation",
    title: "Ultimate",
    highlight: "Comfort",
    desc: "Redefining the standards of private air travel.",
    target: Page.CharteredFlights,
    button: "Aviation"
  },
  // Yacht
  {
    image: "/images/fleet/yacht/1.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Maritime Excellence",
    title: "Master the Waves with",
    highlight: "Luxora",
    desc: "Elite maritime experiences and private yacht charters for exclusive horizons.",
    target: Page.YachtService,
    button: "Yachts"
  },
  {
    image: "/images/fleet/yacht/2.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Maritime Excellence",
    title: "Ocean",
    highlight: "Voyages",
    desc: "Explore the seas in unparalleled luxury.",
    target: Page.YachtService,
    button: "Yachts"
  },
  {
    image: "/images/fleet/yacht/3.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Maritime Excellence",
    title: "Serene",
    highlight: "Waters",
    desc: "Relax and unwind on our private yachts.",
    target: Page.YachtService,
    button: "Yachts"
  },
  // Properties
  {
    image: "/images/fleet/properties/1.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Elite ESTATES",
    title: "Portfolios of",
    highlight: "Majestic Real Estate",
    desc: "Discreet access to Bengaluru's most prestigious properties and management.",
    target: Page.Properties,
    button: "Estates"
  },
  {
    image: "/images/fleet/properties/2.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Elite ESTATES",
    title: "Luxury",
    highlight: "Living",
    desc: "Find your dream home with Luxora.",
    target: Page.Properties,
    button: "Estates"
  },
  {
    image: "/images/fleet/properties/3.jpg",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Elite ESTATES",
    title: "Exclusive",
    highlight: "Residences",
    desc: "Properties that define elegance and sophistication.",
    target: Page.Properties,
    button: "Estates"
  },
  // Luxury Goods
  {
    image: "/images/fleet/luxury-goods/1.png",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Iconic Rarities",
    title: "Curated Market for",
    highlight: "Premium Pieces",
    desc: "Designer collections and rare horological pieces from the world's finest maisons.",
    target: Page.LuxuryProducts,
    button: "Luxury Market"
  },
  {
    image: "/images/fleet/luxury-goods/2.png",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Iconic Rarities",
    title: "Timeless",
    highlight: "Classics",
    desc: "Invest in pieces that last a lifetime.",
    target: Page.LuxuryProducts,
    button: "Luxury Market"
  },
  {
    image: "/images/fleet/luxury-goods/3.png",
    fallback: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000",
    tag: "Iconic Rarities",
    title: "Exquisite",
    highlight: "Craftsmanship",
    desc: "Discover the art of luxury.",
    target: Page.LuxuryProducts,
    button: "Luxury Market"
  }
].filter(slide => ![Page.CharteredFlights, Page.HelicopterService, Page.YachtService, Page.LuxuryProducts].includes(slide.target));

const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  const [current, setCurrent] = useState(0);

  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-luxora-dark"
    >
      {/* Background Slides */}
      {slides.map((slide, idx) => (
        <div 
          key={idx}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img 
            src={slide.image} 
            alt={slide.tag} 
            className={`w-full h-full object-cover sm:object-center object-top transition-transform duration-[2000ms] ease-linear ${idx === current ? 'scale-110' : 'scale-100'}`}
            style={{ 
              transform: `translateY(${scrollY * 0.4}px) scale(${idx === current ? 1.05 : 1})`,
              transition: idx === current ? 'transform 2000ms linear, opacity 1000ms ease-in-out' : 'opacity 1000ms ease-in-out'
            }}
            onError={(e) => {
              if (slide.fallback) {
                const target = e.target as HTMLImageElement;
                target.src = slide.fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-luxora-dark via-luxora-dark/60 to-transparent"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      <div 
        className="container mx-auto px-6 sm:px-12 md:px-16 lg:px-24 xl:px-48 relative z-10 py-24 flex flex-col items-center md:items-start text-center md:text-left"
        style={{ transform: `translateY(${scrollY * -0.2}px)` }}
      >
        <div className="max-w-2xl lg:max-w-3xl">
          {slides.map((slide, idx) => (
            <div 
              key={idx}
              className={`${idx === current ? 'block animate-in fade-in slide-in-from-left-8 duration-700' : 'hidden'}`}
            >
              <span className="text-luxora-gold font-serif text-[10px] md:text-xs mb-3 tracking-[0.4em] block uppercase font-bold opacity-70">{slide.tag}</span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-extrabold text-white mb-6 leading-[1.1] uppercase tracking-[-0.03em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {slide.title} <span className="text-white block sm:inline">{slide.highlight}</span>
              </h1>
              <p className="text-[10px] md:text-xs text-white/50 mb-10 max-w-sm mx-auto md:mx-0 font-medium leading-relaxed border-l-[1px] border-luxora-gold/20 pl-6 uppercase tracking-[0.2em] opacity-80">
                {slide.desc}
              </p>
              {slide.target === Page.Fleet ? (
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center md:justify-start">
                  <button 
                    onClick={() => onExplore(slide.target)}
                    className="px-10 py-5 gold-gradient text-luxora-dark font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-all shadow-[0_0_40px_rgba(212,175,55,0.2)] text-sm md:text-base active:scale-95"
                  >
                    {slide.button}
                  </button>
                  <button 
                    onClick={() => onExplore(Page.Booking)}
                    className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold uppercase tracking-widest rounded-sm hover:bg-white/10 transition-all text-sm md:text-base border-luxora-gold/20"
                  >
                    Direct Inquiry
                  </button>
                </div>
              ) : (
                <div className="flex justify-center md:justify-start">
                  <div className="px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full inline-block">
                    <span className="text-white/40 text-xs uppercase tracking-[0.4em] font-bold">Inaugural Collection Coming Soon</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-[2px] transition-all duration-500 ${idx === current ? 'w-12 bg-luxora-gold shadow-[0_0_10px_#D4AF37]' : 'w-4 bg-white/20'}`}
          />
        ))}
      </div>

      {/* Decorative pulse lines */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-luxora-dark to-transparent pointer-events-none"></div>
    </section>
  );
};

export default Hero;
