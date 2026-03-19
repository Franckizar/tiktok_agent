// components/marketing/MarketingFooter.tsx
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Zap } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="relative bg-[#0a0a0f] border-t border-[#ff6b35]/20 overflow-hidden">
      {/* Background textures - same as hero */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Textures */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url('/textures/texture.jpg')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-15 mix-blend-soft-light"
          style={{
            backgroundImage: `url('/textures/texture1.jpg')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '300px 300px',
          }}
        />
        
        <div 
          className="absolute inset-0 opacity-10 mix-blend-multiply"
          style={{
            backgroundImage: `url('/textures/texture2.jpg')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '150px 150px',
          }}
        />
        
        {/* Saber glow effects */}
        <div 
          className="absolute inset-0" 
          style={{
            background: 'radial-gradient(circle at bottom, rgba(255,107,53,0.1) 0%, transparent 70%)'
          }}
        />
        
        {/* Top saber line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-30"></div>
        
        {/* Animated glow lines */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35]/20 to-transparent"></div>
        <div className="absolute bottom-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35]/20 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block group mb-4">
              <h3 className="text-2xl font-black text-white">
                MBI<span className="text-[#ff6b35]" style={{ textShadow: '0 0 10px rgba(255,107,53,0.5)' }}>⚡</span>AGENCY
              </h3>
            </Link>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Creating digital experiences that drive results. Your partner in digital transformation.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Linkedin, label: 'LinkedIn' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="relative group w-10 h-10 rounded-full bg-[#1a1a24] border border-[#ff6b35]/20 flex items-center justify-center transition-all hover:border-[#ff6b35] hover:scale-110"
                >
                  <div className="absolute inset-0 rounded-full bg-[#ff6b35] opacity-0 group-hover:opacity-20 blur-md transition-opacity"></div>
                  <social.icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ff6b35]" />
              QUICK LINKS
            </h4>
            <ul className="space-y-2">
              {['About Us', 'Services', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(' ', '-')}`} 
                    className="text-gray-400 hover:text-[#ff6b35] transition-colors relative group inline-block"
                  >
                    {item.toUpperCase()}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#ff6b35] group-hover:w-full transition-all"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-black text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ff6b35]" />
              LEGAL
            </h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(' ', '-')}`} 
                    className="text-gray-400 hover:text-[#ff6b35] transition-colors relative group inline-block"
                  >
                    {item.toUpperCase()}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#ff6b35] group-hover:w-full transition-all"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section with saber glow */}
        <div className="relative mt-8 pt-8">
          {/* Saber divider */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-30"></div>
          
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} MBI DIGITAL AGENCY. ALL RIGHTS RESERVED.
            </p>
            <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
              <span>POWERED BY</span>
              <Zap className="w-3 h-3 text-[#ff6b35]" />
              <span className="text-[#ff6b35] font-bold">STORM</span>
              <span className="text-white">TECH</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}