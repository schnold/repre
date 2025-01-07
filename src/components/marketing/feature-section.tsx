// src/components/marketing/feature-section.tsx
"use client";

import { motion } from "framer-motion";
import { 
  Calendar, 
  Users, 
  Clock, 
  Bell, 
  BarChart, 
  Shield 
} from "lucide-react";

const features = [
  {
    name: "Smart Scheduling",
    description: "Intelligent calendar management that automatically matches available substitutes with classes.",
    icon: Calendar
  },
  {
    name: "Teacher Management",
    description: "Track availability, specialties, and preferences of your entire teaching staff.",
    icon: Users
  },
  {
    name: "Real-time Updates",
    description: "Instant notifications ensure everyone stays informed of schedule changes.",
    icon: Bell
  },
  {
    name: "Time Tracking",
    description: "Monitor teaching hours and substitution coverage with detailed reporting.",
    icon: Clock
  },
  {
    name: "Analytics Dashboard",
    description: "Get insights into substitution patterns and staff availability.",
    icon: BarChart
  },
  {
    name: "Secure Platform",
    description: "Enterprise-grade security to protect sensitive educational data.",
    icon: Shield
  }
];

export function FeatureSection() {
  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to manage substitutions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Comprehensive tools designed specifically for educational institutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative p-6 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{feature.name}</h3>
              </div>
              <p className="mt-4 text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}