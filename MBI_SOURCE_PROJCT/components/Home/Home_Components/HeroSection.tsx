// components/marketing/Hero.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Trophy, Users, Zap, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/storm.mp4" type="video/mp4" />
        </video>
        
        {/* Base dark overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* TEXTURE - Main texture.jpg (comic dot pattern) */}
        <div 
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `url('/textures/texture.jpg')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        ></div>
        
        {/* TEXTURE 1 - texture1.jpg (secondary effect) */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-soft-light"
          style={{
            backgroundImage: `url('/textures/texture1.jpg')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '300px 300px',
          }}
        ></div>
        
        {/* TEXTURE 2 - texture2.jpg (additional layer) */}
        <div 
          className="absolute inset-0 opacity-15 mix-blend-multiply"
          style={{
            backgroundImage: `url('/textures/texture2.jpg')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '150px 150px',
          }}
        ></div>
        
        {/* Radial overlay - Bigger circular dark center */}
        <div 
          className="absolute inset-0" 
          style={{
            background: 'radial-gradient(circle, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0.3) 80%, transparent 100%)'
          }}
        ></div>
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
      </div>

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-8 right-8 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 border-2 border-[#ff6b35]/50 backdrop-blur-sm hover:bg-[#ff6b35]/30 transition-all hover:scale-110"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-[#ff6b35]" />
        )}
      </button>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          
          {/* Badge - with comic style border */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border-2 border-[#ff6b35] mb-6 backdrop-blur-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              boxShadow: '0 0 15px rgba(255, 107, 53, 0.5)'
            }}
          >
            <Zap className="w-4 h-4 text-[#ff6b35]" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              ⚡ SEASON 2 - NOW LIVE ⚡
            </span>
          </div>

          {/* Main Headline - with comic style outline */}
          <h1 
            className={`text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 uppercase leading-tight transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              textShadow: '4px 4px 0 #ff6b35, 8px 8px 0 rgba(0,0,0,0.5), 0 0 30px rgba(255, 107, 53, 0.8)',
              WebkitTextStroke: '2px rgba(255, 107, 53, 0.3)'
            }}
          >
            DOMINATE
            <span className="block text-[#ff6b35]" style={{
              textShadow: '3px 3px 0 #000, 6px 6px 0 rgba(255,0,0,0.3)',
              WebkitTextStroke: '1px #000'
            }}>THE ARENA</span>
          </h1>

          {/* Subtext */}
          <p 
            className={`text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              textShadow: '2px 2px 0 rgba(0,0,0,0.5)'
            }}
          >
            COMPETE AGAINST THE BEST. WIN MASSIVE PRIZES. PROVE YOU&apos;RE THE CHAMPION.
          </p>

          {/* Stats Bar - comic style */}
          <div 
            className={`flex flex-wrap justify-center gap-8 mb-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-[#ff6b35]/50">
              <Trophy className="w-5 h-5 text-[#ff6b35]" />
              <span className="text-white font-bold">$50,000 PRIZE POOL</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-[#ff6b35]/50">
              <Users className="w-5 h-5 text-[#ff6b35]" />
              <span className="text-white font-bold">2,500+ PLAYERS</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-[#ff6b35]/50">
              <Play className="w-5 h-5 text-[#ff6b35]" />
              <span className="text-white font-bold">LIVE TOURNAMENTS</span>
            </div>
          </div>

          {/* CTA Buttons - comic style */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-[#ff6b35] to-[#ff0000] text-white font-black text-lg uppercase tracking-wider rounded-lg overflow-hidden transition-all hover:scale-105"
              style={{
                border: '3px solid #fff',
                boxShadow: '0 0 0 3px #ff6b35, 0 10px 20px rgba(0,0,0,0.5), 0 0 30px rgba(255,107,53,0.8)'
              }}
            >
              <span className="relative z-10">APPLY NOW - 500 XAF</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff0000] to-[#ff6b35] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>

            <Link
              href="#events"
              className="px-8 py-4 bg-transparent border-4 border-white text-white font-bold text-lg uppercase tracking-wider rounded-lg transition-all hover:bg-white/20 hover:border-[#ff6b35] hover:scale-105"
              style={{
                textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
              }}
            >
              VIEW EVENTS
            </Link>
          </div>

          {/* Entry Fee Note - with comic style */}
          <p className="text-sm text-gray-300 mt-6 font-bold uppercase tracking-wider bg-black/30 inline-block px-4 py-1 rounded-full border border-[#ff6b35]/30">
            ⚡ ONE-TIME ENTRY FEE • UNLIMITED TOURNAMENT ACCESS ⚡
          </p>
        </div>
      </div>
    </section>
  )
}