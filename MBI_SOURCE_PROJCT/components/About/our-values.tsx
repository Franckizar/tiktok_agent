'use client'

import { Users, Target, Award, Heart, Rocket, Zap } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useEffect, useState } from "react"

// EDIT THIS ARRAY — ADD/REMOVE ANYTIME
const values = [
  { icon: Users, title: "Customer First", description: "We prioritize our customers' needs and success above all else" },
  { icon: Target, title: "Innovation", description: "Constantly pushing boundaries to deliver cutting-edge solutions" },
  { icon: Award, title: "Excellence", description: "Committed to delivering the highest quality in everything we do" },
  { icon: Heart, title: "Passion", description: "We love what we do and it shows in every project" },
  { icon: Rocket, title: "Growth", description: "Helping businesses scale with powerful digital tools" },
  { icon: Zap, title: "Speed", description: "Fast delivery without compromising on quality" }
]

export default function OurValues() {
  const [currentIndices, setCurrentIndices] = useState([0, 1, 2])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices(prev => {
        // Move each index forward
        return prev.map(i => (i + 1) % values.length)
      })
    }, 6000) // 6 seconds per step

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Our Values
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            The principles that guide everything we do
          </p>
        </div>

        {/* 3 Cards Only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentIndices.map((idx, pos) => {
            const value = values[idx]
            const Icon = value.icon

            return (
              <div
                key={pos}
                className="relative overflow-hidden h-64"
              >
                {/* Outgoing Card (fades UP) */}
                <div
                  className="absolute inset-0 animate-slide-up-out"
                  style={{
                    animation: `slideUpOut 6s ease-in-out ${pos * 6}s infinite`,
                  }}
                >
                  <Card className="h-full rounded-2xl shadow-md bg-white dark:bg-gray-800">
                    <CardHeader>
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle>{value.title}</CardTitle>
                      <CardDescription>{value.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </div>

                {/* Incoming Card (fades IN from bottom) */}
                <div
                  className="absolute inset-0 animate-slide-up-in"
                  style={{
                    animation: `slideUpIn 6s ease-in-out ${(pos * 6) + 6}s infinite`,
                  }}
                >
                  <Card className="h-full rounded-2xl shadow-md bg-white dark:bg-gray-800">
                    <CardHeader>
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle>{value.title}</CardTitle>
                      <CardDescription>{value.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideUpOut {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          50%, 100% {
            opacity: 0;
            transform: translateY(-100%);
          }
        }

        @keyframes slideUpIn {
          0% {
            opacity: 0;
            transform: translateY(100%);
          }
          50%, 100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up-out {
          animation: slideUpOut 6s ease-in-out infinite;
        }

        .animate-slide-up-in {
          animation: slideUpIn 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}