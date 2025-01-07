// src/components/marketing/pricing-section.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Basic",
    price: "$29",
    description: "Perfect for small schools",
    features: [
      "Up to 50 teachers",
      "Basic scheduling",
      "Email notifications",
      "Standard support",
    ],
    button: {
      text: "Start Basic",
      variant: "outline" as const,
    }
  },
  {
    name: "Pro",
    price: "$79",
    description: "Ideal for medium-sized institutions",
    features: [
      "Up to 200 teachers",
      "Advanced scheduling",
      "Priority support",
      "Analytics dashboard",
      "Custom integrations",
    ],
    button: {
      text: "Start Pro",
      variant: "default" as const,
    },
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large educational organizations",
    features: [
      "Unlimited teachers",
      "24/7 support",
      "Custom features",
      "Dedicated account manager",
      "API access",
    ],
    button: {
      text: "Contact Sales",
      variant: "outline" as const,
    }
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan thats right for your school
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name}
              className={`flex flex-col ${plan.featured ? 'border-primary shadow-lg' : ''}`}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.name !== "Enterprise" && <span className="ml-1 text-muted-foreground">/month</span>}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/signup" className="w-full">
                  <Button 
                    variant={plan.button.variant} 
                    className="w-full"
                  >
                    {plan.button.text}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}