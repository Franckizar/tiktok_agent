// components/marketing/LiveBanner.tsx
'use client'

import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'

export default function LiveBanner() {
  const [matches] = useState([
    { player1: 'DragonSlayer', player2: 'ShadowNinja', game: 'Storm Fighter', viewers: 1240 },
    { player1: 'ThunderGod', player2: 'IceQueen', game: 'Arena Clash', viewers: 890 },
    { player1: 'PhoenixRise', player2: 'VenomStrike', game: 'Battle Zone', viewers: 2100 },
  ])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] overflow-hidden">
      {/* Main banner with Storm 4 style gradient */}
      <div className="relative bg-gradient-to-r from-[#2a0f0f] via-[#8b1a1a] to-[#2a0f0f] py-3 border-b-2 border-[#ffaa33] shadow-[0_0_15px_rgba(255,170,51,0.5)]">
        
        {/* Storm 4 Style Textures Layer */}
        
        {/* 1. Halftone/Dot Pattern (like anime shading) */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,200,100,0.1) 0%, transparent 50%),
                             repeating-linear-gradient(45deg, transparent 0px, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 12px)`
          }}
        />
        
        {/* 2. Screen Tone Effect (manga style) */}
        <div 
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* 3. Speed Lines (dynamic anime effect) */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-[#ffaa33] to-transparent animate-speedLine"
              style={{
                top: `${Math.random() * 100}%`,
                left: 0,
                width: '100%',
                opacity: 0.3,
                animation: `speedLine 2s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* 4. Cel-Shaded Highlight Strip */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#fff0c0] to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffaa33] to-transparent opacity-40" />
        
        {/* Content */}
        <div className="relative flex animate-scroll">
          <div className="flex gap-12 whitespace-nowrap">
            {[...matches, ...matches].map((match, i) => (
              <div key={i} className="flex items-center gap-3 text-white font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                <Flame className="w-4 h-4 text-yellow-300 animate-pulse filter drop-shadow-[0_0_8px_rgba(255,255,0,0.6)]" />
                <span className="text-sm tracking-wider">
                  <span className="text-[#ffaa33] font-black">LIVE</span>: {match.player1} vs {match.player2}
                </span>
                <span className="text-xs px-2 py-0.5 bg-black/30 rounded-full border border-[#ffaa33]/30">
                  {match.viewers.toLocaleString()} <span className="text-[#ffaa33]">⚡</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes speedLine {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        .animate-speedLine {
          animation: speedLine 2s linear infinite;
        }
      `}</style>
    </div>
  )
}