
import React from 'react';
import { Page } from '../types';

interface FooterProps {
  setPage: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ setPage }) => {
  const socials = [
    { 
      name: 'Instagram', 
      href: 'https://www.instagram.com/luxurycarrentalsbangalore/', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.058-1.69-.072-4.949-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-luxora-dark pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6 sm:px-12 md:px-16 lg:px-24 xl:px-48">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex flex-col mb-8">
              <button 
                onClick={() => setPage(Page.Home)}
                className="flex flex-col items-start mb-8 gap-2 group/flogo outline-none"
              >
                <img src="/logo_Lg.png" alt="Luxora Logo" className="h-28 w-auto object-contain transform -translate-x-2 group-hover/flogo:scale-105 transition-transform duration-500" />
                <span className="text-2xl md:text-3xl font-futuristic gold-text tracking-[0.2em] font-bold group-hover/flogo:drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-all">
                  LUXORA
                </span>
              </button>
              <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-sm font-medium">
                Bengaluru's premier luxury ecosystem. Delivering world-class elite travel and lifestyle experiences with unparalleled sophistication.
              </p>
            </div>
            
            <div className="mb-8">
              <div className="flex flex-wrap gap-3">
                {socials.map((social) => (
                  <a 
                    key={social.name} 
                    href={social.href} 
                    target={social.href !== '#' ? "_blank" : undefined}
                    rel={social.href !== '#' ? "noopener noreferrer" : undefined}
                    aria-label={social.name}
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-luxora-gold hover:border-luxora-gold hover:bg-luxora-gold/5 transition-all duration-300"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-6 underline decoration-luxora-gold/30 underline-offset-8">Quick Links</h4>
            <ul className="space-y-4">
              <li><button onClick={() => setPage(Page.Home)} className="text-white/40 hover:text-luxora-gold transition-colors text-sm">Home</button></li>
              <li><button onClick={() => setPage(Page.Fleet)} className="text-white/40 hover:text-luxora-gold transition-colors text-sm">Our Fleet</button></li>
              <li><button onClick={() => setPage(Page.Services)} className="text-white/40 hover:text-luxora-gold transition-colors text-sm">Luxury Services</button></li>
              <li><button onClick={() => setPage(Page.Booking)} className="text-white/40 hover:text-luxora-gold transition-colors text-sm">Reservations</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-6 underline decoration-luxora-gold/30 underline-offset-8">Our Tiers</h4>
            <ul className="space-y-4">
              <li className="text-white/40 text-sm flex items-center gap-2"><span className="w-1.5 h-1.5 bg-luxora-gold rounded-full shadow-[0_0_5px_rgba(212,175,55,0.5)]"></span> Elite Fleet</li>
              <li className="text-white/40 text-sm flex items-center gap-2"><span className="w-1.5 h-1.5 bg-luxora-gold rounded-full shadow-[0_0_5px_rgba(212,175,55,0.5)]"></span> VIP Platinum</li>
              <li className="text-white/40 text-sm flex items-center gap-2"><span className="w-1.5 h-1.5 bg-luxora-gold rounded-full shadow-[0_0_5px_rgba(212,175,55,0.5)]"></span> Chauffeur Excellence</li>
              <li className="text-white/40 text-sm flex items-center gap-2"><span className="w-1.5 h-1.5 bg-luxora-gold rounded-full shadow-[0_0_5px_rgba(212,175,55,0.5)]"></span> Monthly Rental</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-serif text-sm font-black uppercase tracking-[0.2em] mb-6 underline decoration-luxora-gold/30 underline-offset-8">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <span className="text-luxora-gold mt-1">📍</span>
                <p className="text-white/40 text-sm leading-relaxed">No. 2C-324, basement, 2nd Main Rd, OMBR Layout, Banaswadi, Bengaluru, Karnataka 560043</p>
              </div>
              <div className="flex items-center space-x-3 group">
                <span className="text-luxora-gold">💬</span>
                <p className="text-white/40 text-sm">
                  <a href="https://wa.me/918050323366" target="_blank" rel="noopener noreferrer" className="hover:text-luxora-gold transition-colors">+91 80503 23366</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            <p className="text-white/20 text-[10px] uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Luxora Premier Luxury Ecosystem.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-white/20 hover:text-white/40 text-[10px] uppercase tracking-widest transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/20 hover:text-white/40 text-[10px] uppercase tracking-widest transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
