import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChevronRight,
  Globe,
  Satellite,
  Map,
  BarChart3,
  Layers,
  ArrowDown,
} from 'lucide-react'
import { useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0)
  const featuresRef = useRef(null)
  const isInView = useInView(featuresRef, { once: true, margin: '-100px 0px' })

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex flex-col min-h-screen -mt-12">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900"
          style={{ transform: `rotate(${scrollY * 0.02}deg) scale(1.5)` }}
        />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute h-56 w-56 rounded-full bg-blue-600/30 blur-3xl animate-blob animation-delay-2000 top-1/4 -left-10" />
          <div className="absolute h-64 w-64 rounded-full bg-green-600/20 blur-3xl animate-blob animation-delay-4000 bottom-1/4 right-1/3" />
          <div className="absolute h-80 w-80 rounded-full bg-purple-600/20 blur-3xl animate-blob top-1/3 right-1/4" />
        </div>
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-30 mix-blend-soft-light" />
      </div>
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <Badge
            variant="outline"
            className="mb-8 px-4 py-1.5 text-lg border-blue-400/50 bg-blue-950/30 backdrop-blur-sm"
          >
            <Globe className="h-5 w-5 mr-2 text-blue-400" />
            <span className="font-semibold">Earth.Project</span>
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Monitor Our World
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              From Above
            </span>
          </h1>

          <p className="text-xl max-w-2xl mx-auto mb-10 text-gray-300 backdrop-blur-sm bg-black/10 px-4 py-2 rounded-lg">
            Advanced tools for environmental monitoring, disaster response, and
            tracking changes on our planet using satellite imagery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="default">
              <Link to="/projects">Explore Projects</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/login">
                Get Started <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-white animate-bounce rounded-full h-10 w-10 p-0"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>
      </section>
      <section className="py-24">
        <div className="container mx-auto px-4 relative">
          <div className="absolute inset-0 bg-blue-950/20 backdrop-blur-sm rounded-3xl -z-10"></div>

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Powerful Earth Monitoring Tools
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Access satellite data, analyze changes over time, and collaborate
              on environmental projects
            </p>
          </div>

          <div
            ref={featuresRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2"
          >
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={cn(
                  'border border-white/20 bg-blue-950/30 shadow-lg shadow-blue-900/20 backdrop-blur-sm transition-all duration-700 ease-out hover:border-blue-400/30',
                  isInView
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-20'
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="bg-blue-900/50 p-3 rounded-lg w-fit mb-2">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-200">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 mt-8">
        <div className="container mx-auto px-4 relative">
          {/* Subtle section background */}
          <div className="absolute inset-0 bg-indigo-950/20 backdrop-blur-sm rounded-3xl -z-10"></div>

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              How Earth.Project Works
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              From satellite to insights in three simple steps
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-12 right-12 h-1 bg-white/30 -z-10 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex flex-col items-center text-center bg-blue-950/20 backdrop-blur-sm p-6 rounded-xl border border-white/10"
                >
                  <div className="bg-blue-900/50 w-16 h-16 rounded-full flex items-center justify-center border-2 border-primary shadow-lg mb-6 relative z-10">
                    <span className="text-2xl font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-200">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 mt-8">
        <div className="container mx-auto px-4 relative">
          <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-md rounded-3xl -z-10 border border-blue-400/20 shadow-xl"></div>

          <div className="text-center p-4">
            <h2 className="text-3xl font-bold mb-6 text-white">
              Ready to start monitoring Earth?
            </h2>
            <p className="text-xl max-w-2xl mx-auto mb-8 text-gray-100">
              Join researchers and environmental experts using Earth.Project for
              critical insights.
            </p>
            <Button asChild size="lg" variant="secondary" className="px-8">
              <Link to="/register">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>
      <footer className="bg-black/30 backdrop-blur-sm text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Globe className="h-8 w-8 mr-2 text-blue-400" />
              <span className="text-xl font-bold">Earth.Project</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Earth.Project. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Feature data
const features = [
  {
    title: 'Satellite Imagery',
    description:
      'Access and analyze high-resolution satellite imagery from multiple sources including Sentinel-2 and Landsat.',
    icon: <Satellite className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Change Detection',
    description:
      'Track environmental changes over time with advanced algorithms that highlight differences between images.',
    icon: <Layers className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Map Integration',
    description:
      'Visualize data on interactive maps with customizable layers for comprehensive spatial analysis.',
    icon: <Map className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Data Analytics',
    description:
      'Generate insights with powerful analytics tools designed specifically for environmental monitoring.',
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Project Collaboration',
    description:
      'Work together with team members on shared projects with real-time updates and notifications.',
    icon: <Globe className="h-6 w-6 text-primary" />,
  },
  {
    title: 'API Access',
    description:
      'Integrate Earth.Project data into your own applications with our comprehensive API.',
    icon: <ChevronRight className="h-6 w-6 text-primary" />,
  },
]

// Steps data
const steps = [
  {
    title: 'Select Area of Interest',
    description:
      'Define your region by drawing on a map or entering coordinates to focus your analysis.',
  },
  {
    title: 'Choose Data Sources',
    description:
      'Select from multiple satellite imagery providers and time periods for your analysis.',
  },
  {
    title: 'Analyze & Share Results',
    description:
      'Use our tools to detect changes, measure impact, and share insights with your team.',
  },
]

export default HomePage
