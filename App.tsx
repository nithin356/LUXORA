
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import FleetSection from './components/FleetSection';
import ServicesSection from './components/ServicesSection';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import SocialBar from './components/SocialBar';
import WhatsAppBar from './components/WhatsAppBar';
import AdminPage from './components/AdminPage';
import { Page } from './types';

const BackgroundSlideshow: React.FC<{ images: string[]; alt: string }> = ({ images, alt }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${alt} ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out ${
            idx === current ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
    </div>
  );
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(() => {
    const saved = localStorage.getItem('luxora_active_page');
    return (saved as Page) || Page.Home;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Persist page changes
  useEffect(() => {
    localStorage.setItem('luxora_active_page', activePage);
  }, [activePage]);

  // Smooth scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  // Initial loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-luxora-dark z-[9999] flex flex-col items-center justify-center px-6 transition-opacity duration-700">
        <div className="w-full max-w-xs flex flex-col items-center">
          <img src="/logo_Lg.png" alt="Luxora Logo" className="h-32 md:h-64 w-auto object-contain animate-pulse mb-12" />
          
          <div className="w-full flex flex-col items-center space-y-6">
            <div className="w-32 md:w-48 h-[1px] bg-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-luxora-gold animate-[loading_2s_infinite]"></div>
            </div>
            
            <div className="text-center">
                <p className="text-[10px] md:text-xs text-luxora-gold uppercase tracking-[0.6em] font-bold leading-relaxed">
                    Luxora Premier
                </p>
                <div className="mt-2 text-[8px] text-white/20 uppercase tracking-[0.4em]">Refining Excellence</div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { width: 0; left: 0; }
            50% { width: 100%; left: 0; }
            100% { width: 0; left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case Page.Home:
        return (
          <>
            <Hero onExplore={setActivePage} />
            <ServicesSection onNavigate={setActivePage} />
            <AboutSection />
            <FleetSection onBook={() => setActivePage(Page.Booking)} />
          </>
        );
      case Page.Fleet:
        return <FleetSection onBook={() => setActivePage(Page.Booking)} />;
      case Page.Services:
        return <ServicesSection onNavigate={setActivePage} />;
      case Page.Booking:
        return <BookingForm />;
      case Page.Properties:
        return (
          <section className="relative py-48 bg-luxora-dark min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
            <BackgroundSlideshow 
              images={["/images/fleet/properties/1.jpg", "/images/fleet/properties/2.jpg", "/images/fleet/properties/3.jpg"]} 
              alt="Elite Mansion" 
            />
            <div className="relative z-10 text-center">
                <span className="text-luxora-gold font-serif italic text-xl mb-4 block">Coming Soon</span>
                <h2 className="text-4xl md:text-8xl font-serif font-bold text-white mb-8 text-center uppercase tracking-widest leading-tight">Luxora <span className="gold-text">Properties</span></h2>
                <div className="w-24 h-[1px] bg-luxora-gold/50 mx-auto mb-10"></div>
                <p className="text-white/60 max-w-xl mx-auto leading-relaxed text-lg font-light tracking-wide italic">"We are currently curating an exclusive portfolio of elite real estate and majestic estates. Arriving shortly for the discerning investor."</p>
            </div>
          </section>
        );
      case Page.LuxuryProducts:
        return (
          <section className="relative py-48 bg-luxora-dark min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
            <BackgroundSlideshow 
              images={[
                "/images/fleet/luxury-goods/1.png",
                "/images/fleet/luxury-goods/2.png",
                "/images/fleet/luxury-goods/3.png"
              ]} 
              alt="Luxury Brands" 
            />
            <div className="relative z-10 text-center">
                <span className="text-luxora-gold font-serif italic text-xl mb-4 block">Coming Soon</span>
                <h2 className="text-4xl md:text-8xl font-serif font-bold text-white mb-8 text-center uppercase tracking-widest leading-tight">Elite <span className="gold-text">Goods</span></h2>
                <div className="w-24 h-[1px] bg-luxora-gold/50 mx-auto mb-10"></div>
                <p className="text-white/60 max-w-xl mx-auto leading-relaxed text-lg font-light tracking-wide italic">"A curated marketplace for ultra-premium lifestyle products, designer collections, and rare horological pieces from the world's most iconic maisons."</p>
            </div>
          </section>
        );
      case Page.CharteredFlights:
        return (
          <section className="relative py-48 bg-luxora-dark min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
            <BackgroundSlideshow 
              images={[
                "/images/fleet/jets/1.jpg", 
                "/images/fleet/jets/2.jpg", 
                "/images/fleet/jets/3.jpg"
              ]} 
              alt="Luxury Aviation" 
            />
            <div className="relative z-10 text-center">
                <span className="text-luxora-gold font-serif italic text-xl mb-4 block">Coming Soon</span>
                <h2 className="text-4xl md:text-8xl font-serif font-bold text-white mb-8 text-center uppercase tracking-widest leading-tight">Chartered <span className="gold-text">Flights</span></h2>
                <div className="w-24 h-[1px] bg-luxora-gold/50 mx-auto mb-10"></div>
                <p className="text-white/60 max-w-xl mx-auto leading-relaxed text-lg font-light tracking-wide italic">"Take to the skies in unparalleled comfort. Our bespoke private aviation services are being curated for the global traveler."</p>
            </div>
          </section>
        );
      case Page.HelicopterService:
        return (
          <section className="relative py-48 bg-luxora-dark min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
            <BackgroundSlideshow 
              images={[
                "/images/fleet/helicopter/1.webp",
                "/images/fleet/helicopter/2.jpg",
                "/images/fleet/helicopter/3.jpg"
              ]} 
              alt="Elite Helicopters" 
            />
            <div className="relative z-10 text-center">
                <span className="text-luxora-gold font-serif italic text-xl mb-4 block">Coming Soon</span>
                <h2 className="text-4xl md:text-8xl font-serif font-bold text-white mb-8 text-center uppercase tracking-widest leading-tight">Private <span className="gold-text">Helicopters</span></h2>
                <div className="w-24 h-[1px] bg-luxora-gold/50 mx-auto mb-10"></div>
                <p className="text-white/60 max-w-xl mx-auto leading-relaxed text-lg font-light tracking-wide italic">"Experience the ultimate in point-to-point luxury travel. Our exclusive helicopter fleet is being prepared for your next swift ascent."</p>
            </div>
          </section>
        );
      case Page.YachtService:
        return (
          <section className="relative py-48 bg-luxora-dark min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
            <BackgroundSlideshow 
              images={["/images/fleet/yacht/1.jpg", "/images/fleet/yacht/2.jpg", "/images/fleet/yacht/3.jpg"]} 
              alt="Super Yacht" 
            />
            <div className="relative z-10 text-center">
                <span className="text-luxora-gold font-serif italic text-xl mb-4 block">Coming Soon</span>
                <h2 className="text-4xl md:text-8xl font-serif font-bold text-white mb-8 text-center uppercase tracking-widest leading-tight">Yacht <span className="gold-text">Service</span></h2>
                <div className="w-24 h-[1px] bg-luxora-gold/50 mx-auto mb-10"></div>
                <p className="text-white/60 max-w-xl mx-auto leading-relaxed text-lg font-light tracking-wide italic">"Master the waves with Luxora. Elite maritime experiences and private yacht charters are arriving on the horizon."</p>
            </div>
          </section>
        );
      case Page.Admin:
        return <AdminPage />;
      default:
        return (
          <>
            <Hero onExplore={setActivePage} />
            <ServicesSection onNavigate={setActivePage} />
            <AboutSection />
            <FleetSection onBook={() => setActivePage(Page.Booking)} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-luxora-gold selection:text-luxora-dark">
      <Navbar activePage={activePage} setPage={setActivePage} />
      
      <SocialBar />
      <WhatsAppBar />

      <main className="flex-grow">
        {renderPage()}
      </main>

      <Footer setPage={setActivePage} />

    </div>
  );
};

export default App;
