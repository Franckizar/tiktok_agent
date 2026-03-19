// components/about/page-header.tsx
import Image from 'next/image'

export default function PageHeader() {
  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/team/2.jpg"
          alt="About Us - MBI Digital Agency"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white drop-shadow-lg">
              About Us
            </h1>
            <p className="mx-auto max-w-[700px] text-white/90 md:text-xl drop-shadow">
              Building the future, one project at a time
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}