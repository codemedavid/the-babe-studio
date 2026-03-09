import React from 'react';
import { HelpCircle, MapPin, Truck, FlaskConical, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-900 pt-16 pb-8 border-t border-charcoal-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <img
              src="/logo.jpeg?v=2"
              alt="The Babe Studio"
              className="h-14 w-auto object-contain bg-white/10 rounded-lg p-2"
            />
            <p className="text-charcoal-400 text-sm max-w-xs text-center md:text-left">
              Quality peptides for your wellness journey. Lab-tested, high-purity formulations you can trust.
            </p>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">Contact Us</h3>

            <a
              href="mailto:Glowwithjoo2026@gmail.com"
              className="text-charcoal-300 hover:text-brand-400 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Glowwithjoo2026@gmail.com
            </a>

            <a
              href="tel:+639989747336"
              className="text-charcoal-300 hover:text-brand-400 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              0998 974 7336
            </a>

            <div className="text-charcoal-300 flex items-center gap-2 text-sm mt-2">
              <MapPin className="w-4 h-4 text-brand-400" />
              Metro Manila, Philippines
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-2">Quick Links</h3>
            <a
              href="#"
              className="text-charcoal-300 hover:text-brand-400 transition-colors flex items-center gap-2 text-sm"
            >
              <FlaskConical className="w-4 h-4" />
              Products
            </a>
            <a
              href="/track-order"
              className="text-charcoal-300 hover:text-brand-400 transition-colors flex items-center gap-2 text-sm"
            >
              <Truck className="w-4 h-4" />
              Track Order
            </a>
            <a
              href="/faq"
              className="text-charcoal-300 hover:text-brand-400 transition-colors flex items-center gap-2 text-sm"
            >
              <HelpCircle className="w-4 h-4" />
              FAQ
            </a>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-charcoal-800 mb-6" />

        {/* Footer Bottom */}
        <div className="text-center">
          <p className="text-xs text-charcoal-500 flex items-center justify-center gap-1">
            Made with
            © {currentYear} The Babe Studio.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
