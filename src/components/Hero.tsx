import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Shield, FlaskConical, Award } from 'lucide-react';

interface HeroProps {
  onShopAll: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShopAll }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-white flex items-center justify-center pt-20 pb-16">

      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-charcoal-50 opacity-50" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Column: Content */}
        <div className={`
          flex flex-col text-left max-w-2xl
          transition-all duration-1000 ease-out transform
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}>


          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold text-charcoal-900 mb-4 leading-tight tracking-tight">
            The Babe Studio
          </h1>
          <h2 className="text-xl md:text-2xl font-light text-brand-600 mb-6 tracking-wide uppercase">
            Premium Peptide & Beauty Science
          </h2>

          <p className="text-lg text-charcoal-600 mb-10 leading-relaxed font-light">
            Advanced peptide formulations designed for research, innovation, and beauty science.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <button
              onClick={onShopAll}
              className="w-full sm:w-auto px-8 py-4 bg-brand-400 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-brand-200 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Shop Peptides
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="/assessment"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-charcoal-300 text-charcoal-800 hover:border-charcoal-800 hover:bg-charcoal-50 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              Take Assessment
            </a>
          </div>

          <p className="mt-4 text-sm text-charcoal-500 italic">
            Not sure which peptide is right for you? Click <span className="font-semibold text-brand-600">Take Assessment</span> to get a personalized recommendation.
          </p>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap gap-6 border-t border-charcoal-100 pt-8">
            {[
              { icon: Shield, label: '99% Purity Guaranteed' },
              { icon: FlaskConical, label: 'Lab Tested' },
              { icon: Award, label: 'Premium Grade' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm font-medium text-charcoal-600">
                <item.icon className="w-4 h-4 text-brand-400" />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Visual / Layout element */}
        <div className={`
          relative hidden md:flex justify-center items-center h-full min-h-[500px]
          transition-all duration-1000 delay-300 ease-out
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}>
          {/* A modern, abstract DNA/Biotech representation using CSS and Lucide icons */}
          <div className="absolute inset-0 bg-brand-50 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '6s' }} />

          <div className="relative z-10 p-12 bg-white/40 border border-white/60 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col items-center justify-center animate-float">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-300">
                <path d="M2 15c6.667-6 13.333 0 20-6" />
                <path d="M9 22c1.798-1.559 2.43-2.826 2.508-4.3M5.111 20.378c.849-1.928 2.308-3.085 4.38-3.472M18.889 3.622c-.849 1.928-2.308 3.085-4.38 3.472M15 2c-1.798 1.559-2.43 2.826-2.508 4.3M17 14.5l-2-2.5M10.5 7l-2-2.5M14 11s-2-2-4 0" />
                <path d="M2 9c6.667 6 13.333 0 20 6" />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Sparkles className="w-8 h-8 text-brand-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-8 text-sm font-semibold tracking-widest text-charcoal-400 uppercase">Peptide Science</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
