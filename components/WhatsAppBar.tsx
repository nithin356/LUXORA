
import React from 'react';

const WhatsAppBar: React.FC = () => {
  const whatsappUrl = "https://wa.me/918050313366";
  
  return (
    <div className="fixed right-6 bottom-0 z-40 hidden lg:flex flex-col items-center space-y-6">
      <span className="text-[10px] uppercase tracking-[0.4em] text-luxora-gold font-bold vertical-text-alt py-4 select-none opacity-50">
        WhatsApp Us
      </span>
      <div className="h-24 w-[1px] bg-luxora-gold/30"></div>
      <div className="flex flex-col space-y-6 mb-8">
        <a 
          href={whatsappUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center text-white/40 hover:text-luxora-gold transition-all duration-300 transform hover:-translate-y-1"
          aria-label="Chat on WhatsApp"
        >
          {/* Tooltip-style number reveal on hover */}
          <div className="absolute right-12 px-3 py-1 bg-luxora-charcoal border border-luxora-gold/30 text-luxora-gold text-[10px] tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-sm">
            +91 80503 13366
          </div>
          
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.155 1.416 4.756 1.417 5.405 0 9.803-4.397 9.806-9.803.001-2.618-1.02-5.079-2.871-6.932-1.851-1.853-4.312-2.873-6.932-2.873-5.405 0-9.803 4.398-9.806 9.804-.001 1.83.487 3.621 1.411 5.187l-1.004 3.667 3.757-.986zm11.389-5.477c-.316-.158-1.87-.924-2.16-.1029-.29-.105-.5-.158-.711-.474-.211-.316-.843-1.054-1.033-1.291-.19-.237-.38-.395-.696-.237-.316.158-1.161.455-1.396.711-.237.256-.474.286-.791.128-.316-.158-1.334-.492-2.541-1.568-.94-.839-1.573-1.875-1.758-2.191-.184-.316-.02-.487.138-.644.142-.141.316-.369.474-.553.158-.184.211-.316.316-.527.105-.211.053-.395-.026-.553-.08-.158-.711-1.713-.974-2.345-.256-.615-.517-.532-.711-.541l-.606-.01c-.211 0-.553.079-.843.395-.29.316-1.107 1.081-1.107 2.636 0 1.556 1.134 3.059 1.292 3.269.158.211 2.23 3.404 5.399 4.768.754.324 1.343.518 1.802.663.757.241 1.446.207 1.99.126.607-.09 1.87-.765 2.134-1.476.264-.711.264-1.318.184-1.446-.079-.128-.29-.191-.606-.349z"/></svg>
        </a>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .vertical-text-alt {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          select-none;
        }
      `}} />
    </div>
  );
};

export default WhatsAppBar;
