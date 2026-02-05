
import React from 'react';
import { SERVICES } from '../constants';

const ServicesSection: React.FC = () => {
  return (
    <section className="py-24 bg-luxora-charcoal relative overflow-hidden" id="services">
      {/* Decorative BG element */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-luxora-gold/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 sm:px-12 md:px-16 lg:px-24 xl:px-48 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16">
          <div className="max-w-2xl mb-8 md:mb-0">
            <span className="text-luxora-gold font-serif italic text-xl mb-4 block">Refined Experiences</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Tailored For Discerning Clients</h2>
          </div>
          <p className="text-white/40 max-w-sm mb-2">
            From the arrival via private jet to the final toast at your majestic estate, Luxora ensures seamless perfection at every scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service) => (
            <div key={service.id} className="group p-10 bg-luxora-dark border border-white/5 hover:border-luxora-gold/30 transition-all duration-500 flex flex-col items-center text-center">
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-500">
                {service.icon}
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-4 group-hover:text-luxora-gold transition-colors">
                {service.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed font-light">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature List */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-16">
            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 flex-shrink-0 border border-luxora-gold/30 rounded-full flex items-center justify-center text-luxora-gold font-serif italic text-xl">1</div>
                <div>
                    <h4 className="text-white font-bold mb-2">Expert Personnel</h4>
                    <p className="text-white/40 text-[10px] leading-relaxed uppercase tracking-wider">Professionally trained captains, pilots, and chauffeurs embodying absolute discretion.</p>
                </div>
            </div>
            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 flex-shrink-0 border border-luxora-gold/30 rounded-full flex items-center justify-center text-luxora-gold font-serif italic text-xl">2</div>
                <div>
                    <h4 className="text-white font-bold mb-2">Curated Assets</h4>
                    <p className="text-white/40 text-[10px] leading-relaxed uppercase tracking-wider">Meticulously maintained vehicles, aircraft, and vessels ensuring safety and prestige.</p>
                </div>
            </div>
            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 flex-shrink-0 border border-luxora-gold/30 rounded-full flex items-center justify-center text-luxora-gold font-serif italic text-xl">3</div>
                <div>
                    <h4 className="text-white font-bold mb-2">Bespoke Concierge</h4>
                    <p className="text-white/40 text-[10px] leading-relaxed uppercase tracking-wider">Meticulous attention to detail with tailored arrangements for the most complex journeys.</p>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
