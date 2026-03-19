// components/about/our-story.tsx
import Image from 'next/image'

export default function OurStory() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Text Content */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Our Story
            </h2>
            <p className="text-muted-foreground md:text-lg leading-relaxed">
              Founded with a vision to transform the digital landscape, we've been at the forefront
              of innovation and excellence. Our journey began with a simple idea: to create solutions
              that make a real difference.
            </p>
            <p className="text-muted-foreground md:text-lg leading-relaxed">
              Today, we're proud to serve clients worldwide, delivering exceptional results through
              cutting-edge technology and unwavering dedication to quality. Our team of passionate
              professionals works tirelessly to exceed expectations and drive success.
            </p>
          </div>

          {/* Image Box */}
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/team/1.jpg"
              alt="Our Story - MBI Digital Agency"
              fill
              className="object-cover"
              priority
            />
            {/* Optional overlay for better text contrast if needed */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-500/20" />
          </div>
        </div>
      </div>
    </section>
  )
}