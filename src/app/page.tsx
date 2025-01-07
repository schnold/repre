// src/app/page.tsx
import { FeatureSection } from '@/components/marketing/feature-section';
import { HeroSection } from '@/components/marketing/hero-section';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { PricingSection } from '@/components/marketing/pricing-section';
import { TestimonialSection } from '@/components/marketing/testimonial-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold">Repre</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-primary">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-primary">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-primary">
                Testimonials
              </Link>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              {/* We'll implement mobile menu later */}
              <Button variant="ghost" size="icon">
                <span className="sr-only">Open menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Feature Section */}
        <FeatureSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* Testimonial Section */}
        <TestimonialSection />
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}