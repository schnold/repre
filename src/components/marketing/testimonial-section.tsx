// src/components/marketing/testimonial-section.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Repre has completely transformed how we manage our substitute teachers. The efficiency gained is remarkable.",
    author: "Sarah Johnson",
    position: "School Principal",
    school: "Lincoln High School"
  },
  {
    quote: "The automated scheduling and real-time updates have made my job so much easier. I can't imagine going back to our old system.",
    author: "Michael Chen",
    position: "Department Head",
    school: "Westfield Academy"
  },
  {
    quote: "The interface is intuitive and the support team is incredibly responsive. It's been a game-changer for our institution.",
    author: "Emily Rodriguez",
    position: "Administrative Director",
    school: "St. Mary's College"
  }
];

export function TestimonialSection() {
  return (
    <section id="testimonials" className="py-24 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by educators worldwide
          </h2>
          <p className="text-xl text-muted-foreground">
            See what school administrators are saying about Repre
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-primary/40 mb-4" />
                  <blockquote className="text-lg mb-4">
                    
                  </blockquote>
                  <footer>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.position}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.school}
                    </div>
                  </footer>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}