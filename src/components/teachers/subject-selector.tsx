"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Computer Science",
] as const;

interface SubjectSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function SubjectSelector({ value, onChange }: SubjectSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {subjects.map((subject) => (
        <Button
          key={subject}
          type="button"
          variant={value.includes(subject) ? "default" : "outline"}
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            onChange(
              value.includes(subject)
                ? value.filter((x) => x !== subject)
                : [...value, subject]
            );
          }}
        >
          {value.includes(subject) && <Check className="mr-2 h-4 w-4" />}
          {subject}
        </Button>
      ))}
    </div>
  );
} 