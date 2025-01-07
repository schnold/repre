// src/app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: "",
    organizationName: "",
    organizationType: "",
    position: "",
    subjects: [] as string[],
  });

  const handleSubmit = async () => {
    try {
      // Send the form data to your API to create/update user profile
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          email: user?.email,
          name: user?.name || user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save onboarding data");
      }

      // Redirect to dashboard after successful onboarding
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      // Handle error (show error message to user)
    }
  };

  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-10">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Please wait while we load your information
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Ensure user is present
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome {user.name || user.email}! Tell us a bit about yourself to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>I am a...</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="school-admin" id="school-admin" />
                    <Label htmlFor="school-admin">School Administrator</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teacher" id="teacher" />
                    <Label htmlFor="teacher">Teacher</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="substitute" id="substitute" />
                    <Label htmlFor="substitute">Substitute Teacher</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!formData.role}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {formData.role === "school-admin" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">School/Organization Name</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organizationName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationType">Organization Type</Label>
                    <Select
                      value={formData.organizationType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, organizationType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary School</SelectItem>
                        <SelectItem value="secondary">Secondary School</SelectItem>
                        <SelectItem value="higher">Higher Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {(formData.role === "teacher" || formData.role === "substitute") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Title</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      placeholder="e.g., Mathematics Teacher"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjects">Subjects</Label>
                    <Input
                      id="subjects"
                      placeholder="e.g., Mathematics, Physics, Chemistry"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subjects: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter subjects separated by commas
                    </p>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={
                    formData.role === "school-admin" 
                      ? !formData.organizationName || !formData.organizationType
                      : !formData.position || !formData.subjects.length
                  }
                >
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}