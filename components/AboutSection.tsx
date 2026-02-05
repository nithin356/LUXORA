
import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-luxora-dark overflow-hidden">
      <div className="container mx-auto px-6 sm:px-12 md:px-16 lg:px-24 xl:px-48 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="w-full lg:w-1/2 relative order-2 lg:order-1">
            <div className="relative z-10 border-4 md:border-8 border-luxora-gold/10 p-2 md:p-4">
               <img 
                src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200" 
                alt="Elite Chauffeur Service" 
                className="w-full h-[300px] md:h-[500px] object-cover rounded-sm shadow-2xl"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 md:w-40 md:h-40 border-l-2 border-b-2 border-luxora-gold/30 hidden lg:block"></div>
          </div>
          
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <span className="text-luxora-gold font-serif text-[10px] md:text-xs mb-4 tracking-[0.6em] block uppercase">Our Heritage</span>
            <h2 className="text-2xl md:text-4xl font-serif font-medium text-white mb-6 md:mb-8 leading-tight uppercase tracking-tight">
              Bengaluru’s Premier <span className="gold-text font-normal italic">Luxury Ecosystem</span>
            </h2>
            <div className="space-y-4 md:space-y-6 text-white/70 leading-relaxed font-light text-sm md:text-base">
              <p>
                Luxora is Bengaluru’s premier gateway to an elite lifestyle, delivering multi-vertical luxury experiences through a curated ecosystem of world-class assets. We cater to discerning individuals who demand nothing less than perfection across every touchpoint of their journey.
              </p>
              <p>
                Whether it's the precision of our chauffeur-driven fleet, the discretion of private aviation, the serenity of elite yachting, or the exclusivity of majestic estates, Luxora ensures every experience reflects unparalleled sophistication and class.
              </p>
              <p className="hidden md:block">
                From high-protocol corporate travel to bespoke private celebrations, we manage the logistics of the extraordinary. Our mission is to provide Bengaluru with a singular, trusted partner for the world's most prestigious services.
              </p>
            </div>
            
            <div className="mt-8 md:mt-10 grid grid-cols-2 gap-4 md:gap-8 border-t border-white/10 pt-8 md:pt-10">
              <div>
                <h4 className="text-luxora-gold font-serif text-2xl md:text-3xl font-bold mb-1">Tailored</h4>
                <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest">Luxury Experience</p>
              </div>
              <div>
                <h4 className="text-luxora-gold font-serif text-2xl md:text-3xl font-bold mb-1">Elite</h4>
                <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest">Trained Chauffeurs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
