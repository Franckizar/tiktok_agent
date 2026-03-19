// components/auth/AuthHeader.tsx
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function AuthHeader() {
  return (
    <header className="relative z-50 border-b border-[#ff6b35]/20 bg-[#0a0a0f]/80 backdrop-blur-xl">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('/textures/texture.jpg')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px 100px',
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Saber glow line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-50"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo with saber glow */}
          <Link href="/" className="group relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#ff6b35] to-[#ff0000] rounded-lg opacity-0 group-hover:opacity-20 blur-lg transition-opacity"></div>
            <span className="relative text-xl font-black text-white">
              MBI<span className="text-[#ff6b35]" style={{ textShadow: '0 0 10px rgba(255,107,53,0.5)' }}>⚡</span>AGENCY
            </span>
          </Link>
          
          <nav className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors group"
            >
              <span className="relative z-10">LOGIN</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#ff6b35] group-hover:w-full transition-all"></span>
            </Link>
            
            <Link 
              href="/register" 
              className="relative px-4 py-2 bg-transparent border-2 border-[#ff6b35] text-white font-bold rounded-lg overflow-hidden group"
              style={{
                boxShadow: '0 0 15px rgba(255,107,53,0.3)',
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#ff6b35] to-[#ff0000] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                SIGN UP
                <Zap className="w-4 h-4" />
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}