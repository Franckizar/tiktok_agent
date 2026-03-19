'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'

// EDIT THIS ARRAY — ADD/REMOVE TEAM MEMBERS
const team = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    image: "/team/1.jpg"
  },
  {
    name: "Michael Chen",
    role: "CTO",
    image: "/team/2.jpg"
  },
  {
    name: "Emma Davis",
    role: "Head of Design",
    image: "/team/3.jpg"
  },
  {
    name: "James Wilson",
    role: "Lead Developer",
    image: "/team/4.jpg"
  },
  {
    name: "Lisa Park",
    role: "Marketing Director",
    image: "/team/1.jpg"
  }
]

// Duplicate first 3 items at end for seamless loop
const extendedTeam = [...team, ...team.slice(0, 3)]

export default function TeamSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1
        if (next >= team.length) {
          // Jump to duplicate start without animation
          setTimeout(() => {
            setIsTransitioning(false)
            setCurrentIndex(0)
          }, 50)
          setIsTransitioning(true)
          return next
        }
        return next
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Meet Our Team
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
            Passionate professionals driving innovation
          </p>
        </div>

        {/* Seamless 3-Card Slider */}
        <div className="relative overflow-hidden">
          <div
            className={`flex ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
            style={{
              transform: `translateX(-${currentIndex * 33.333}%)`
            }}
          >
            {extendedTeam.map((member, index) => (
              <div
                key={index}
                className="flex-none w-full md:w-1/3 px-4"
              >
                <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 overflow-hidden">
                  <div className="relative h-64 w-full bg-gray-200">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGnAZ7d1gAAAABJRU5ErkJggg=="
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-muted-foreground mt-1">{member.role}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {team.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsTransitioning(true)
                setCurrentIndex(i)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === (currentIndex % team.length) ? 'bg-primary w-8' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}