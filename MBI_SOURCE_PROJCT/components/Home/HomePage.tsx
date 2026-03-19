"use client"

import HeroSection from "./Home_Components/HeroSection"
import FeaturesSection from "./Home_Components/FeaturesSection"
import CTASection from "./Home_Components/CTASection"
import ShortAbout from "./Home_Components/ShortAbout"
import Events from "../marketing/Events"

export default function HomePage() {
  return (
    <main className="flex-1">
      <HeroSection />
       <Events />
      {/* <ShortAbout />
      <FeaturesSection />
      <CTASection /> */}
      
    </main>
  )
}
