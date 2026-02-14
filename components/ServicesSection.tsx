import React from "react";
import { Page } from "../types";

interface ServiceCategoryProps {
  onNavigate?: (page: Page) => void;
}

const ServicesSection: React.FC<ServiceCategoryProps> = ({ onNavigate }) => {
  const serviceCategories = [
    {
      id: "cars",
      title: "Luxury Cars",
      subtitle: "Elite Fleet",
      icon: "🏎️",
      description:
        "Curated collection of premium vehicles with expert chauffeurs.",
      image: "/images/fleet/cars/1.jpg",
      page: Page.Fleet,
      highlight: true,
    },
    {
      id: "flights",
      title: "Chartered Flights",
      subtitle: "Private Aviation",
      icon: "✈️",
      description: "Bespoke air travel in state-of-the-art jets.",
      image: "/images/fleet/jets/1.jpg",
      page: Page.CharteredFlights,
    },
    {
      id: "helicopters",
      title: "Helicopter Service",
      subtitle: "Aerial Mobility",
      icon: "🚁",
      description: "Point-to-point urban luxury transfers.",
      image: "/images/fleet/helicopter/1.webp",
      page: Page.HelicopterService,
    },
    {
      id: "yachts",
      title: "Yacht Service",
      subtitle: "Maritime Excellence",
      icon: "⛵",
      description: "Exclusive yacht charters and maritime experiences.",
      image: "/images/fleet/yacht/1.jpg",
      page: Page.YachtService,
    },
    {
      id: "properties",
      title: "Majestic Estates",
      subtitle: "Exclusive Properties",
      icon: "🏰",
      description: "Portfolio of prestigious real estate & management.",
      image: "/images/fleet/properties/1.jpg",
      page: Page.Properties,
    },
    {
      id: "luxury",
      title: "Luxury Goods",
      subtitle: "Premium Marketplace",
      icon: "💎",
      description: "Designer collections and rare horological pieces.",
      image: "/images/fleet/luxury-goods/1.png",
      page: Page.LuxuryProducts,
    },
  ];

  return (
    <section
      className="py-16 md:py-24 bg-luxora-dark relative overflow-hidden"
      id="services"
    >
      {/* Decorative BG element */}
      <div className="absolute -top-40 -right-40 w-80 md:w-96 h-80 md:h-96 bg-luxora-gold/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 md:w-96 h-80 md:h-96 bg-luxora-gold/3 rounded-full blur-3xl"></div>

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="mb-12 md:mb-20 reveal">
          <span className="text-luxora-gold font-serif text-sm md:text-base mb-3 md:mb-4 block uppercase tracking-[0.4em] font-bold">
            Our Ecosystem
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-extrabold text-white mb-4 md:mb-6 leading-none uppercase tracking-tighter">
            Curated Services For The Elite
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-2xl font-light leading-relaxed">
            From the moment you arrive to the final farewell, Luxora
            orchestrates every touchpoint with meticulous attention to detail.
          </p>
        </div>

        {/* Main Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-16">
          {serviceCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => onNavigate?.(category.page)}
              className={`group relative h-64 md:h-72 overflow-hidden rounded-lg cursor-pointer transition-all duration-500 reveal gold-aura-hover ${
                category.highlight ? "md:col-span-2" : ""
              }`}
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://images.unsplash.com/photo-1494976388531-d1058494cdd0?auto=format&fit=crop&q=80&w=800`;
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-luxora-dark via-luxora-dark/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 z-10">
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">
                  {category.icon}
                </div>
                <span className="text-luxora-gold text-xs md:text-sm uppercase tracking-[0.2em] font-bold mb-1 md:mb-2 opacity-80">
                  {category.subtitle}
                </span>
                <h3 className="text-lg md:text-2xl lg:text-3xl font-serif font-extrabold text-white mb-2 md:mb-3 group-hover:text-luxora-gold transition-colors uppercase tracking-tight">
                  {category.title}
                </h3>
                <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-3 md:mb-4 line-clamp-2">
                  {category.description}
                </p>
                <div className="inline-flex items-center text-luxora-gold text-xs md:text-sm uppercase tracking-[0.2em] font-bold group-hover:gap-2 transition-all gap-1">
                  Explore{" "}
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>



        {/* Why Choose Luxora */}
        <div className="mt-16 md:mt-24 border-t border-white/5 pt-12 md:pt-16 reveal">
          <h3 className="text-2xl md:text-3xl font-serif font-extrabold text-white mb-8 md:mb-12 uppercase tracking-tight">
            Why Choose Luxora
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="flex gap-4 md:gap-6">
              <div className="w-10 md:w-12 h-10 md:h-12 flex-shrink-0 border-2 border-luxora-gold/30 rounded-full flex items-center justify-center text-luxora-gold font-serif font-black text-xl md:text-2xl">
                1
              </div>
              <div>
                <h4 className="text-white font-bold mb-2 text-sm md:text-base">
                  Expert Personnel
                </h4>
                <p className="text-white/40 text-xs md:text-sm leading-relaxed uppercase tracking-wider">
                  Professionally trained specialists embodying discretion &
                  excellence across all services.
                </p>
              </div>
            </div>
            <div className="flex gap-4 md:gap-6">
              <div className="w-10 md:w-12 h-10 md:h-12 flex-shrink-0 border-2 border-luxora-gold/30 rounded-full flex items-center justify-center text-luxora-gold font-serif font-black text-xl md:text-2xl">
                2
              </div>
              <div>
                <h4 className="text-white font-bold mb-2 text-sm md:text-base">
                  Curated Assets
                </h4>
                <p className="text-white/40 text-xs md:text-sm leading-relaxed uppercase tracking-wider">
                  Meticulously maintained vehicles, aircraft & vessels ensuring
                  safety & prestige.
                </p>
              </div>
            </div>
            <div className="flex gap-4 md:gap-6">
              <div className="w-10 md:w-12 h-10 md:h-12 flex-shrink-0 border-2 border-luxora-gold/30 rounded-full flex items-center justify-center text-luxora-gold font-serif font-black text-xl md:text-2xl">
                3
              </div>
              <div>
                <h4 className="text-white font-bold mb-2 text-sm md:text-base">
                  Bespoke Concierge
                </h4>
                <p className="text-white/40 text-xs md:text-sm leading-relaxed uppercase tracking-wider">
                  Tailored arrangements for complex journeys with meticulous
                  attention to detail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
