// components/marketing/Events.tsx
'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Events() {
  const [hoveredCharacter, setHoveredCharacter] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Characters data
  const characters = [
    { id: 1, name: 'Naruto', image: '/characters/naruto.png' },
    { id: 2, name: 'Sasuke', image: '/characters/sasuke.jpg' },
    { id: 3, name: 'Kakashi', image: '/characters/kakashi.jpg' },
    { id: 4, name: 'Sakura', image: '/characters/sakura.jpg' },
    { id: 5, name: 'Gaara', image: '/characters/gaara.jpg' },
  ]

  // Event details
  const eventDate = new Date('2026-03-15T18:00:00')
  const location = 'Yaoundé Arena - Cameroon'

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = eventDate.getTime() - now

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section id="events" className="relative py-20 bg-[#0a0a0f] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/grid.png')] opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff6b35]/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff0000]/10 rounded-full blur-[120px]"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-white uppercase mb-4">
            Storm <span className="text-[#ff6b35]">Tournament</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose your fighter and dominate the arena
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left - Characters Selection */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-[#ff6b35] uppercase mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Pick Your Fighter
            </h3>
            
            {/* Character Grid */}
            <div className="grid grid-cols-5 gap-4">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredCharacter(character.id)}
                  onMouseLeave={() => setHoveredCharacter(null)}
                >
                  <div 
                    className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                      hoveredCharacter === character.id 
                        ? 'border-[#ff6b35] scale-125 z-10 shadow-2xl shadow-[#ff6b35]/50' 
                        : 'border-[#1a1a1a] scale-100'
                    }`}
                  >
                    {/* Character image */}
                    <div className="aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0f] relative overflow-hidden">
                      <Image
                        src={character.image}
                        alt={character.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100px, 200px"
                      />
                    </div>
                    
                    {/* Character name overlay */}
                    {hoveredCharacter === character.id && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end justify-center pb-2">
                        <span className="text-white font-bold text-sm uppercase">
                          {character.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Favorite Character CTA */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0f] rounded-xl border border-[#ff6b35]/20">
              <h4 className="text-xl font-bold text-white mb-2">
                Who&apos;s Your Favorite Character?
              </h4>
              <p className="text-gray-400 mb-4">
                Register now and lock in your main fighter
              </p>
              <Link
                href="/register"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ff0000] text-white font-bold uppercase rounded-lg hover:scale-105 transition-transform"
              >
                Register Now - 500 XAF
              </Link>
            </div>
          </div>

          {/* Right - Event Details */}
          <div className="space-y-6">
            
            {/* Countdown Timer */}
            <div className="p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0f] rounded-xl border border-[#ff6b35]/30">
              <h4 className="text-lg font-bold text-[#ff6b35] uppercase mb-4 text-center">
                Registration Ends In
              </h4>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="bg-[#ff6b35]/10 rounded-lg p-3 border border-[#ff6b35]/30">
                    <span className="text-2xl font-black text-white block">
                      {timeLeft.days}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 uppercase mt-1 block">Days</span>
                </div>
                <div className="text-center">
                  <div className="bg-[#ff6b35]/10 rounded-lg p-3 border border-[#ff6b35]/30">
                    <span className="text-2xl font-black text-white block">
                      {timeLeft.hours}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 uppercase mt-1 block">Hours</span>
                </div>
                <div className="text-center">
                  <div className="bg-[#ff6b35]/10 rounded-lg p-3 border border-[#ff6b35]/30">
                    <span className="text-2xl font-black text-white block">
                      {timeLeft.minutes}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 uppercase mt-1 block">Mins</span>
                </div>
                <div className="text-center">
                  <div className="bg-[#ff6b35]/10 rounded-lg p-3 border border-[#ff6b35]/30">
                    <span className="text-2xl font-black text-white block">
                      {timeLeft.seconds}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 uppercase mt-1 block">Secs</span>
                </div>
              </div>
            </div>

            {/* Event Info */}
            <div className="p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0f] rounded-xl border border-[#ff6b35]/20 space-y-4">
              <h4 className="text-lg font-bold text-white uppercase mb-4">
                Event Details
              </h4>
              
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-5 h-5 text-[#ff6b35]" />
                <div>
                  <p className="font-bold text-white">March 15, 2026</p>
                  <p className="text-sm text-gray-400">Tournament Day</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-5 h-5 text-[#ff6b35]" />
                <div>
                  <p className="font-bold text-white">6:00 PM WAT</p>
                  <p className="text-sm text-gray-400">Check-in starts 5:00 PM</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-[#ff6b35]" />
                <div>
                  <p className="font-bold text-white">{location}</p>
                  <p className="text-sm text-gray-400">Main Arena Hall</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <Users className="w-5 h-5 text-[#ff6b35]" />
                <div>
                  <p className="font-bold text-white">128 Spots Available</p>
                  <p className="text-sm text-gray-400">86 already registered</p>
                </div>
              </div>
            </div>

            {/* Quick Register Button */}
            <Link
              href="/register"
              className="block w-full px-6 py-4 bg-gradient-to-r from-[#ff6b35] to-[#ff0000] text-white font-black text-center uppercase rounded-lg hover:scale-105 transition-transform shadow-lg shadow-[#ff6b35]/30"
            >
              Secure Your Spot
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}