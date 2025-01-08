// FILE: src/app/(app)/teachers/page.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TeacherData {
  _id?: string;
  name: string;
  email?: string;
  subjects: string[];
  color: string;
}

export default function TeachersPage() {
  const router = useRouter();
  const { user, isLoading, hasRole } = useAuth();
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subjects, setSubjects] = useState("");
  const [color, setColor] = useState("#BFD5FF");

  useEffect(() => {
    // role check
    if (!isLoading && user && !hasRole(["admin", "editor"])) {
      router.push("/dashboard");
    } else if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, hasRole, router]);

  async function fetchTeachers() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/teachers");
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error fetching teachers");
      setTeachers(json.teachers);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function handleCreateTeacher() {
    try {
      setError(null);
      const payload = {
        name,
        email,
        subjects: subjects.split(",").map((s) => s.trim()),
        color,
      };
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create teacher");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Unknown error");
      // success
      await fetchTeachers();
      // clear form
      setName("");
      setEmail("");
      setSubjects("");
      setColor("#BFD5FF");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    }
  }

  if (isLoading || loading) {
    return <p className="p-4">Loading teacher data...</p>;
  }
  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="space-y-8">
      {/* Page banner */}
      <div className="rounded-xl p-6 bg-brand-50 shadow-md">
        <h1 className="text-2xl font-bold text-brand-800">Manage Teachers</h1>
        <p className="text-sm text-brand-600">
          Create and organize teacher profiles in your school.
        </p>
      </div>

      {/* Existing Teachers */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Existing Teachers</h2>
        {teachers.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No teachers found. Create the first teacher below!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((t) => (
              <Card key={t._id || t.name} className="shadow-sm">
                <CardHeader>
                  <CardTitle>{t.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {t.email && (
                    <p className="text-sm text-muted-foreground">{t.email}</p>
                  )}
                  <p className="text-sm">
                    Subjects:{" "}
                    {t.subjects.length > 0
                      ? t.subjects.join(", ")
                      : "No subjects"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Color:</span>
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: t.color }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Create Teacher Form */}
      <section>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Create a New Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Subjects (comma separated)</Label>
                <Textarea
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="Math, Physics, Chemistry"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleCreateTeacher} className="mt-4">
              Create Teacher
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
