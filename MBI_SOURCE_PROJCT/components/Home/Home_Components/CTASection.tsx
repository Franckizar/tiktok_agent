'use client'

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-r from-sky-500 to-blue-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white">
              Ready to Get Started?
            </h2>
            <p className="mx-auto text-white/90 md:text-xl leading-relaxed">
              Join us today and experience the difference. No credit card required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-white text-sky-600 hover:bg-gray-100 font-bold text-lg px-10 py-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/quota">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-sky-600 font-bold text-lg px-10 py-7 rounded-2xl backdrop-blur-sm transition-all duration-300"
              >
                Get a Free Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}