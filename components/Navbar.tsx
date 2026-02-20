import React, { useState, useEffect } from "react";
import { Page } from "../types";

interface NavbarProps {
  activePage: Page;
  setPage: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, setPage }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", value: Page.Home },
    { label: "Fleet", value: Page.Fleet },
    { label: "Properties", value: Page.Properties },
  ];

  const handleNavClick = (page: Page) => {
    setPage(page);
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled || isMenuOpen ? "glass-nav py-2 sm:py-3 shadow-2xl border-b border-white/5" : "bg-transparent py-3 sm:py-5"}`}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 flex justify-between items-center">
        <div
          className="flex items-center cursor-pointer group z-50 gap-1 sm:gap-2 min-w-0"
          onClick={() => handleNavClick(Page.Home)}
        >
          <img
            src="/logo_Lg.png"
            alt="Luxora Premier Ecosystem"
            className="h-8 sm:h-10 md:h-14 lg:h-16 w-auto object-contain flex-shrink-0 transform group-hover:scale-105 transition-transform"
          />
          <span className="text-sm sm:text-lg md:text-2xl lg:text-3xl font-futuristic gold-text tracking-[0.1em] sm:tracking-[0.2em] font-bold group-hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] transition-all truncate">
            LUXORA
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-4 lg:space-x-8 items-center">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleNavClick(item.value)}
              className={`text-xs lg:text-sm uppercase tracking-widest font-medium transition-all duration-300 relative group/nav ${activePage === item.value ? "text-luxora-gold" : "text-white/70 hover:text-luxora-gold"}`}
            >
              <span className="relative z-10">{item.label}</span>
              <span className={`absolute -bottom-2 left-0 w-full h-[1px] bg-luxora-gold transition-transform duration-500 scale-x-0 group-hover/nav:scale-x-100 ${activePage === item.value ? "scale-x-100" : ""}`}></span>
            </button>
          ))}
          <button
            onClick={() => handleNavClick(Page.Booking)}
            className="px-4 lg:px-6 py-2 border border-luxora-gold text-luxora-gold text-xs lg:text-sm uppercase tracking-widest hover:bg-luxora-gold hover:text-luxora-dark transition-all duration-300 rounded-sm whitespace-nowrap"
          >
            Book Now
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden z-50">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-luxora-gold focus:outline-none p-2 transition-transform active:scale-90"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        className={`fixed top-0 left-0 w-full h-screen bg-luxora-dark z-[9999] transition-all duration-700 ease-[cubic-bezier(0.22, 1, 0.36, 1)] flex flex-col ${isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/5 bg-transparent">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/logo_Lg.png"
              alt="Luxora Logo"
              className="h-8 sm:h-10 w-auto object-contain flex-shrink-0"
            />
            <span className="text-sm sm:text-lg md:text-xl font-futuristic gold-text tracking-[0.15em] sm:tracking-[0.2em] font-bold truncate">
              LUXORA
            </span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-luxora-gold p-2 sm:p-3 border border-luxora-gold/20 rounded-full bg-luxora-gold/5 active:scale-90 transition-transform flex-shrink-0"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="flex-grow flex flex-col justify-center px-6 sm:px-10 md:px-12 overflow-y-auto">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {navItems.map((item, index) => (
              <button
                key={item.value}
                onClick={() => handleNavClick(item.value)}
                className={`text-lg sm:text-2xl md:text-3xl uppercase tracking-[0.2em] sm:tracking-[0.3em] font-serif font-black transition-all duration-700 text-left relative group ${
                  activePage === item.value
                    ? "text-luxora-gold pl-4 sm:pl-6"
                    : "text-white/60 hover:text-white pl-0"
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${100 + index * 50}ms` : "0ms",
                  transform: isMenuOpen ? "translateX(0)" : "translateX(20px)",
                  opacity: isMenuOpen ? 1 : 0,
                }}
              >
                {activePage === item.value && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-[1px] bg-luxora-gold"></span>
                )}
                {item.label}
              </button>
            ))}
          </div>

          <div
            className="mt-12 sm:mt-16 transition-all duration-700 delay-500"
            style={{
              transform: isMenuOpen ? "translateY(0)" : "translateY(20px)",
              opacity: isMenuOpen ? 1 : 0,
            }}
          >
            <button
              onClick={() => handleNavClick(Page.Booking)}
              className="w-full py-4 sm:py-5 gold-gradient text-luxora-dark text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] font-black shadow-[0_10px_30px_rgba(212,175,55,0.2)] rounded-sm active:scale-95 transition-transform"
            >
              Request Reservation
            </button>
          </div>
        </div>

        <div
          className="p-6 sm:p-10 border-t border-white/5 bg-black/40 transition-all duration-700 delay-700"
          style={{ opacity: isMenuOpen ? 1 : 0 }}
        >
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <div className="flex space-x-6 sm:space-x-8">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-luxora-gold transition-colors"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-bold">
                  Instagram
                </span>
              </a>
              <a
                href="#"
                className="text-white/40 hover:text-luxora-gold transition-colors"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-bold">
                  WhatsApp
                </span>
              </a>
            </div>
            <div className="text-center">
              <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.6em] text-luxora-gold font-bold mb-1">
                Bengaluru, India
              </p>
              <p className="text-[7px] sm:text-[8px] uppercase tracking-[0.4em] text-white/20">
                The Premier Ecosystem
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
