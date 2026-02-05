
import React, { useState, useEffect } from 'react';
import { Page } from '../types';

interface NavbarProps {
  activePage: Page;
  setPage: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, setPage }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', value: Page.Home },
    { label: 'Fleet', value: Page.Fleet },
    { label: 'Flights', value: Page.CharteredFlights },
    { label: 'Helicopters', value: Page.HelicopterService },
    { label: 'Yachts', value: Page.YachtService },
    { label: 'Properties', value: Page.Properties },
    { label: 'Luxury Goods', value: Page.LuxuryProducts },
  ];

  const handleNavClick = (page: Page) => {
    setPage(page);
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || isMenuOpen ? 'bg-luxora-dark/95 backdrop-blur-md py-3 shadow-2xl' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 flex justify-between items-center">
        <div 
          className="flex items-center cursor-pointer group z-50 gap-1.5"
          onClick={() => handleNavClick(Page.Home)}
        >
          <img src="/logo_Lg.png" alt="Luxora Premier Ecosystem" className="h-10 md:h-16 w-auto object-contain transform group-hover:scale-105 transition-transform" />
          <span className="text-xl md:text-3xl font-futuristic gold-text tracking-[0.2em] font-bold group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] transition-all">LUXORA</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-8 items-center">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleNavClick(item.value)}
              className={`text-sm uppercase tracking-widest font-medium transition-colors ${activePage === item.value ? 'text-luxora-gold underline underline-offset-8' : 'text-white/70 hover:text-luxora-gold'}`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick(Page.Booking)}
            className="px-6 py-2 border border-luxora-gold text-luxora-gold text-sm uppercase tracking-widest hover:bg-luxora-gold hover:text-luxora-dark transition-all duration-300 rounded-sm"
          >
            Book Now
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden z-50">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-luxora-gold focus:outline-none p-2"
              aria-label="Toggle menu"
            >
                {isMenuOpen ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                )}
            </button>
        </div>
      </div>

      <div 
        className={`fixed top-0 left-0 w-full h-screen bg-luxora-dark z-[9999] transition-all duration-700 ease-[cubic-bezier(0.22, 1, 0.36, 1)] flex flex-col ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
      >
          <div className="flex justify-between items-center p-6 border-b border-white/5 bg-transparent">
              <div className="flex items-center gap-2">
                <img src="/logo_Lg.png" alt="Luxora Logo" className="h-12 w-auto object-contain" />
                <span className="text-xl font-futuristic gold-text tracking-[0.2em] font-bold">LUXORA</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-luxora-gold p-3 border border-luxora-gold/20 rounded-full bg-luxora-gold/5 active:scale-90 transition-transform"
              >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
          </div>

          <div className="flex-grow flex flex-col justify-center px-10">
              <div className="flex flex-col space-y-6">
                {navItems.map((item, index) => (
                  <button
                    key={item.value}
                    onClick={() => handleNavClick(item.value)}
                    className={`text-xl uppercase tracking-[0.4em] font-serif transition-all duration-700 text-left relative group ${
                      activePage === item.value ? 'text-luxora-gold pl-6' : 'text-white/60 hover:text-white pl-0'
                    }`}
                    style={{ 
                      transitionDelay: isMenuOpen ? `${100 + index * 50}ms` : '0ms',
                      transform: isMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                      opacity: isMenuOpen ? 1 : 0
                    }}
                  >
                    {activePage === item.value && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-luxora-gold"></span>
                    )}
                    {item.label}
                  </button>
                ))}
              </div>

              <div 
                className="mt-16 transition-all duration-700 delay-500"
                style={{ 
                  transform: isMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                  opacity: isMenuOpen ? 1 : 0
                }}
              >
                  <button
                    onClick={() => handleNavClick(Page.Booking)}
                    className="w-full py-5 gold-gradient text-luxora-dark text-xs uppercase tracking-[0.4em] font-black shadow-[0_10px_30px_rgba(212,175,55,0.2)] rounded-sm active:scale-95 transition-transform"
                  >
                    Request Reservation
                  </button>
              </div>
          </div>

          <div 
            className="p-10 border-t border-white/5 bg-black/40 transition-all duration-700 delay-700"
            style={{ opacity: isMenuOpen ? 1 : 0 }}
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="flex space-x-8">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-luxora-gold transition-colors">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Instagram</span>
                </a>
                <a href="#" className="text-white/40 hover:text-luxora-gold transition-colors">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold">WhatsApp</span>
                </a>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-[0.6em] text-luxora-gold font-bold mb-1">Bengaluru, India</p>
                <p className="text-[8px] uppercase tracking-[0.4em] text-white/20">The Premier Ecosystem</p>
              </div>
            </div>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
