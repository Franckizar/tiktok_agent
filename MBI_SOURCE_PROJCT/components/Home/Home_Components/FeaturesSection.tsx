"use client"

import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

const services = [
  {
    title: "SEO Optimization",
    image: "/1.jpg",
    description: "Boost your site's ranking with our expert SEO strategies.",
    link: "/services/seo-optimization",
  },
  {
    title: "Social Media Marketing",
    image: "/2.jpg",
    description: "Engage your audience with tailored social media campaigns.",
    link: "/services/social-media-marketing",
  },
  {
    title: "Content Creation",
    image: "/3.jpg",
    description: "Captivate your audience with compelling content.",
    link: "/services/content-creation",
  },
  {
    title: "Web Development",
    image: "/1.jpg",
    description: "Build modern, responsive websites that convert.",
    link: "/services/web-development",
  },
  {
    title: "Brand Strategy",
    image: "/2.jpg",
    description: "Develop a strong brand identity that resonates.",
    link: "/services/brand-strategy",
  },
  {
    title: "Digital Analytics",
    image: "/3.jpg",
    description: "Make data-driven decisions with our analytics.",
    link: "/services/digital-analytics",
  },
]

export default function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center sm:text-left text-foreground">
            Our Digital Marketing Services
          </h2>
          <Button
            asChild
            size="lg"
            className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/Quota">Get a Quote</Link>
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card
              key={index}
              className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 bg-card border-border flex flex-col h-full overflow-hidden group"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              <CardHeader className="flex-grow pb-2">
                <CardTitle className="text-xl font-semibold text-card-foreground">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardFooter className="flex justify-between items-center pt-2 pb-6 px-6">
                <Link
                  href={service.link}
                  className="text-sky-600 hover:text-sky-700 font-medium text-sm transition-colors duration-200 inline-flex items-center"
                >
                  Learn More
                </Link>

                <Button
                  asChild
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Link href="/Quota">
                    Get a Quote
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}