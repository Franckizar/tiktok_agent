// ```tsx
"use client"

import Link from "next/link"
import { ArrowLeft, Home, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="max-w-lg w-full bg-white dark:bg-gray-800 shadow-2xl animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white">
            <span className="inline-block px-2 py-1 animate-gradient bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-700 bg-[length:200%_auto] text-transparent bg-clip-text">
              404
            </span>
          </CardTitle>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-4">
            Oops! Page Not Found
          </h2>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Looks like you&apos;ve wandered into uncharted digital territory. Let&apos;s get you back on track with MBI Digital Agency!
          </p>
          <div className="relative h-32 w-full flex justify-center items-center">
            {/* Animated Gradient Wave */}
            <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 opacity-20 animate-pulse-scale" />
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-700 opacity-30 animate-pulse-scale delay-150" />
            <svg
              className="w-16 h-16 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/" aria-label="Return to homepage">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Link href="/contact" aria-label="Contact MBI Digital Agency">
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSS for Animations */}
      <style jsx>{`
        @keyframes gradient-move {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-scale {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
        .animate-gradient {
          animation: gradient-move 4s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-pulse-scale {
          animation: pulse-scale 3s ease-in-out infinite;
        }
        .delay-150 {
          animation-delay: 0.15s;
        }
      `}</style>
    </div>
  )
}
// ```