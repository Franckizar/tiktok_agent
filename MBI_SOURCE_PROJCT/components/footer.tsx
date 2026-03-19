// ```jsx
"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
  { href: "/quotation", label: "Quotation" },
]

const socialLinks = [
  { href: "https://github.com/mbidigital", label: "GitHub", icon: Github },
  { href: "https://twitter.com/mbidigital", label: "Twitter", icon: Twitter },
  { href: "https://linkedin.com/company/mbidigital", label: "LinkedIn", icon: Linkedin },
  { href: "mailto:info@mbidigital.cm", label: "Email", icon: Mail },
]

const contactInfo = [
  { label: "Phone", value: "+237 123 456 789", icon: Phone, href: "tel:+237123456789" },
  { label: "Email", value: "info@mbidigital.cm", icon: Mail, href: "mailto:info@mbidigital.cm" },
  { label: "Address", value: "Yaoundé, Cameroon", icon: MapPin, href: "#" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding & Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl font-bold mb-4">
              <span className="inline-block px-2 py-1 animate-gradient bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-700 bg-[length:200%_auto] text-transparent bg-clip-text">
                MBI Digital Agency
              </span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Empowering businesses with innovative digital solutions in Cameroon and beyond.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} MBI Digital Agency. All rights reserved.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:underline"
                    aria-label={`Navigate to ${link.label}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Get in Touch</h3>
            <ul className="space-y-2 mb-6">
              {contactInfo.map((info) => {
                const Icon = info.icon
                return (
                  <li key={info.label} className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <Link
                      href={info.href}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300"
                      aria-label={info.label}
                    >
                      {info.value}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110"
                    aria-label={`Visit our ${link.label}`}
                  >
                    <Icon className="h-6 w-6" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CSS for Gradient Animation */}
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
    </footer>
  )
}
// ```