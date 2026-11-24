import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Smartphone, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';

// --- MENU TICKER COMPONENT ---
const MenuTicker = () => {
  const tickerItems = [
    "Signature Pizzas",
    "Hot Honey Chicken",
    "Loaded Fries",
    "Kochchi Prawns Spaghetti",
    "Korean Crispy Chicken",
    "Mongolian Fried Rice",
    "The Baconator",
    "Blueberry Cheesecake",
    "Classic Margherita",
    "Fresh Mojitos"
  ];

  return (
    <div 
      aria-hidden="true" 
      role="marquee" 
      className="relative overflow-hidden py-3.5" 
      style={{ backgroundColor: '#FDFBF7', borderBottom: '1px solid #f0e6d2' }}
    >
      <style>
        {`
          @keyframes ticker {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
        `}
      </style>

      {/* Gradient Fades for smooth entry/exit */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16" style={{ background: 'linear-gradient(to right, #FDFBF7, transparent)' }}></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16" style={{ background: 'linear-gradient(to left, #FDFBF7, transparent)' }}></div>
      
      {/* Scrolling Content */}
      <div className="flex whitespace-nowrap w-max" style={{ animation: 'ticker 40s linear infinite' }}>
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <span 
            key={index} 
            className="mx-5 flex items-center gap-5 text-[0.7rem] font-bold uppercase tracking-[0.38em]" 
            style={{ color: '#D45D3C' }}
          >
            {item}
            <span style={{ color: 'rgba(212, 93, 60, 0.35)' }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const reviews = [
    {
      id: 1,
      name: "Sathsarani Weeramanthre",
      text: "Had a really great experience at Piccolo Pizza, Pannipitiya! The food was delicious, fresh, and served with great attention to detail. The overall atmosphere was lovely, and the service made the experience even better."
    },
    {
      id: 2,
      name: "Dakshina Jayawardena",
      text: "This was my first time trying Piccolo’s Pizza, and although I had intended to try it on a previous occasion, I couldn’t make it happen. However, today I finally had the opportunity to enjoy a dining experience at their Pannipitiya branch."
    },
    {
      id: 3,
      name: "Ishani Wijesinghe",
      text: "Tried  this place and was pleasantly surprised! They serve a wide range of Italian dishes at very affordable prices. (There are Chinese dishes too) Though we were skeptical at first, everything tasted great, and they even offered a free regular pizza. Calm atmosphere and friendly staff! definitely a must-try pizza spot!"
    }
  ];

  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(timer);
  }, [reviews.length]);

  const nextReview = () => {
    setCurrentReview((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  return (
    <div className="bg-[#FDFBF7] font-sans text-[#2C3E2D]">
      
      {/* HERO SECTION */}
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        
        {/* Background Videos Container */}
        <div className="absolute inset-0 z-0 grid grid-cols-1 md:grid-cols-3">
          
          {/* Video 1: Always visible (Fills the whole screen on mobile) */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
            src="/video1.mp4" 
          />
          
          {/* Video 2: Hidden on mobile, visible on desktop */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="hidden md:block w-full h-full object-cover"
            src="/video2.mp4" 
          />
          
          {/* Video 3: Hidden on mobile, visible on desktop */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="hidden md:block w-full h-full object-cover"
            src="/video3.mp4" 
          />
          
        </div>
        {/* Dark Overlay to make text readable */}
        <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-['Montserrat'] font-bold text-[#FDFBF7] mb-6 drop-shadow-lg">
            Authentic Flavors,<br/>Seamless Experience
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl drop-shadow-md">
            Savor the rich tastes of Italy. Dine in our cozy ambiance or grab your favorites on the go.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link
                to="/booking"
                className="bg-[#FDFBF7] text-[#2C3E2D] hover:bg-gray-100 px-8 py-4 rounded-full text-xl font-semibold transition-all shadow-xl hover:scale-105 text-center"
            >
              Book a Table
            </Link>
            <Link to="/menu" className="bg-[#D45D3C] hover:bg-[#B84A2E] text-white px-8 py-4 rounded-full text-xl font-semibold transition-all shadow-xl hover:scale-105 text-center">
              Order for Pickup
            </Link>
          </div>
        </div>
      </section>

      {/* --- MENU TICKER INJECTED HERE --- */}
      <MenuTicker />

      {/* QUICK HIGHLIGHTS */}
      <section className="py-20 px-4 max-w-7xl mx-auto" id="about">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[#2C3E2D]/10 rounded-full flex items-center justify-center mb-6 text-[#2C3E2D]">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">Artisan Ingredients</h3>
            <p className="text-gray-600 leading-relaxed">
              Locally sourced produce and imported Italian specialties, crafted with love.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[#D45D3C]/10 rounded-full flex items-center justify-center mb-6 text-[#D45D3C]">
              <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">Skip the Line</h3>
            <p className="text-gray-600 leading-relaxed">
              Order ahead through our digital pickup portal. Hot, fresh, and ready when you arrive.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[#2C3E2D]/10 rounded-full flex items-center justify-center mb-6 text-[#2C3E2D]">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">Cozy Atmosphere</h3>
            <p className="text-gray-600 leading-relaxed">
              A warm, inviting space perfect for family dinners, dates, and celebrations.
            </p>
          </div>
        </div>
      </section>

      {/* GOOGLE REVIEWS SLIDESHOW */}
      <section className="py-20 px-4 bg-white border-y border-gray-100 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-[#D45D3C]">
            Loved by Our Guests
          </h2>
          
          <div className="relative flex items-center justify-center min-h-[300px]">
            
            {/* Left Arrow */}
            <button 
              onClick={prevReview}
              className="absolute left-0 md:-left-12 z-10 p-2 text-[#2C3E2D] hover:text-[#D45D3C] transition-colors bg-white/50 md:bg-transparent rounded-full"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            {/* The Review Card */}
            <div className="bg-[#FDFBF7] p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center w-full max-w-2xl mx-10 transition-opacity duration-500">
              <div className="flex gap-1 mb-6 text-[#D45D3C]">
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
              </div>
              
              <p className="text-xl md:text-2xl italic text-gray-700 mb-8 min-h-[120px] flex items-center justify-center">
                "{reviews[currentReview].text}"
              </p>
              
              <div className="flex flex-col items-center gap-2 border-t border-gray-200 pt-6 w-full">
                <p className="font-bold text-[#2C3E2D] text-lg">{reviews[currentReview].name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-4 h-4" />
                  <span>Google Review</span>
                </div>
              </div>
            </div>

            {/* Right Arrow */}
            <button 
              onClick={nextReview}
              className="absolute right-0 md:-right-12 z-10 p-2 text-[#2C3E2D] hover:text-[#D45D3C] transition-colors bg-white/50 md:bg-transparent rounded-full"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
            
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReview(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentReview === index ? 'bg-[#D45D3C]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

        </div>
      </section>
      
    </div>
  );
}