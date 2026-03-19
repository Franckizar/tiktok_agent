'use client'

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"

const images = ["/1.jpg", "/2.jpg", "/3.jpg"]

export default function ShortAbout() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let scrollAmount = 3
    const scrollSpeed = 0.5

    const animate = () => {
      if (scrollContainer) {
        scrollAmount += scrollSpeed
        if (scrollAmount >= scrollContainer.scrollWidth / 2) {
          scrollAmount = 0
        }
        scrollContainer.style.transform = `translateX(-${scrollAmount}px)`
      }
      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-sky-500 to-blue-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          <div className="relative overflow-hidden rounded-2xl">
            <div
              ref={scrollRef}
              className="flex gap-4"
              style={{ width: "max-content" }}
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  {images.map((src, idx) => (
                    <div
                      key={`${i}-${idx}`}
                      className="w-64 h-64 md:w-80 md:h-80 bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl flex-shrink-0 overflow-hidden border border-white/20"
                    >
                      <img
                        src={src}
                        alt={`MBI Digital Team ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-sky-500 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-blue-600 to-transparent pointer-events-none z-10" />
          </div>

          <div className="flex flex-col items-start space-y-6 text-left text-white">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                About{" "}
                <span className="inline-block px-2 py-1 animate-gradient bg-gradient-to-r from-white via-sky-200 to-white bg-[length:200%_auto] text-transparent bg-clip-text">
                  MBI Digital
                </span>
              </h2>
              <p className="max-w-[600px] text-white/90 md:text-xl">
                We are a creative digital agency based in Cameroon, crafting modern, high-performance websites and marketing solutions that help businesses grow online.
              </p>
              <p className="text-white/80">
                From stunning designs to powerful SEO strategies, we bring your vision to life with cutting-edge technology and a passion for excellence.
              </p>
            </div>

            <Link href="/about">
              <Button
                size="lg"
                className="bg-white text-sky-600 hover:bg-gray-100 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Learn More About Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-move {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        .animate-gradient {
          animation: gradient-move 4s linear infinite;
        }
      `}</style>
    </section>
  )
}