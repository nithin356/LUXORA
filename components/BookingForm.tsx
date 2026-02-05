
import React, { useState, useEffect } from 'react';
import { fleetService } from '../services/fleetService';
import { bookingService } from '../services/bookingService';
import { Car } from '../types';

const BookingForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [fleet, setFleet] = useState<Car[]>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    carId: '',
    pickupDate: '',
    duration: 'Full Day Disposal',
    message: ''
  });

  useEffect(() => {
    const loadData = async () => {
      const cars = await fleetService.getFleet();
      setFleet(cars);
      if (cars.length > 0 && !formData.carId) {
        setFormData(prev => ({ ...prev, carId: cars[0].id }));
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCar = fleet.find(c => c.id === formData.carId);
    
    await bookingService.addEnquiry({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      carId: formData.carId,
      carModel: selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : 'Unknown Car',
      pickupDate: formData.pickupDate,
      duration: formData.duration,
      message: formData.message
    });
    
    // Smooth scroll to top to see success message
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="py-24 bg-luxora-dark min-h-screen flex items-center">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-xl mx-auto bg-luxora-charcoal p-12 border border-luxora-gold/30 rounded-sm shadow-2xl">
            <div className="w-20 h-20 bg-luxora-gold/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-luxora-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-serif font-bold gold-text mb-4">Reservation Requested</h2>
            <p className="text-white/60 mb-8">Thank you, sir. Our concierge team will contact you within 15 minutes to finalize your elite arrangements.</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="px-8 py-3 border border-luxora-gold text-luxora-gold uppercase tracking-widest text-sm hover:bg-luxora-gold hover:text-luxora-dark transition-all"
            >
              Request Another Service
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-luxora-dark">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row shadow-2xl rounded-lg overflow-hidden border border-white/5">
          {/* Left Side: Info */}
          <div className="md:w-1/3 bg-luxora-gold p-10 flex flex-col justify-between">
            <div>
              <h2 className="text-luxora-dark text-4xl font-serif font-bold mb-6">Book Your Journey</h2>
              <p className="text-luxora-dark/80 font-medium leading-relaxed mb-8">
                Reserve your experience today and the gold standard of elite lifestyle services in Bengaluru.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-luxora-dark">
                  <span className="w-8">📞</span>
                  <span className="font-bold">+91 80 4444 8888</span>
                </div>
                <div className="flex items-center text-luxora-dark">
                  <span className="w-8">💬</span>
                  <a href="https://wa.me/918050313366" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">WhatsApp: +91 80503 13366</a>
                </div>
                <div className="flex items-center text-luxora-dark">
                  <span className="w-8">✉️</span>
                  <span className="font-bold">concierge@luxora.in</span>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-12 border-t border-luxora-dark/10">
              <p className="text-luxora-dark/60 text-sm italic">"Punctuality is not just a habit, it's our promise."</p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-2/3 bg-luxora-charcoal p-10">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Full Name</label>
                <input required name="customerName" value={formData.customerName} onChange={handleInputChange} type="text" className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Phone Number</label>
                <input required name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} type="tel" className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors" />
              </div>
              <div className="col-span-2">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Email Address</label>
                <input required name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} type="email" className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors" />
              </div>
              <div className="col-span-2">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Select Vehicle</label>
                <select name="carId" value={formData.carId} onChange={handleInputChange} className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors">
                  {fleet.map(car => <option key={car.id} value={car.id}>{car.brand} {car.model}</option>)}
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Pickup Date</label>
                <input required name="pickupDate" value={formData.pickupDate} onChange={handleInputChange} type="date" className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Service Type</label>
                <select name="duration" value={formData.duration} onChange={handleInputChange} className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors">
                  <option>Airport Transfer</option>
                  <option>Corporate Event</option>
                  <option>Wedding Service</option>
                  <option>Full Day Disposal</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Special Instructions</label>
                <textarea name="message" value={formData.message} onChange={handleInputChange} rows={3} className="w-full bg-luxora-dark border border-white/10 p-3 text-white focus:outline-none focus:border-luxora-gold transition-colors" placeholder="Any specific requirements..."></textarea>
              </div>
              <div className="col-span-2 mt-4">
                <button type="submit" className="w-full py-4 gold-gradient text-luxora-dark font-bold uppercase tracking-widest hover:opacity-90 transition-all rounded-sm">
                  Request Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
