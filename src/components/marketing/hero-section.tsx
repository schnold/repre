// src/components/marketing/hero-section.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function HeroSection() {
  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/5 via-muted/10 to-primary-foreground/5" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            School Representation{" "}
            <span className="text-primary">Made Simple</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Streamline your schools substitute teacher management with our 
            intuitive platform. Save time, reduce stress, and ensure your 
            classes are always covered.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="pt-8 text-sm text-muted-foreground">
            <p>No credit card required • 14-day free trial • Cancel anytime</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}