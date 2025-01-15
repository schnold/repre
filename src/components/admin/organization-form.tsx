"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { TimezoneSelect } from '@/components/ui/timezone-select';
import { useUser } from '@auth0/nextjs-auth0/client';

export function OrganizationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    timeZone: 'UTC',
    workingHours: {
      start: '09:00',
      end: '17:00'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create organization');
      }

      toast({
        title: "Success",
        description: "Organization created successfully",
      });

      router.push('/organizations');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create organization",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Time Zone</Label>
            <TimezoneSelect
              value={formData.timeZone}
              onChange={(value) => setFormData({ ...formData, timeZone: value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workStart">Working Hours Start</Label>
              <Input
                id="workStart"
                type="time"
                value={formData.workingHours.start}
                onChange={(e) => setFormData({
                  ...formData,
                  workingHours: { ...formData.workingHours, start: e.target.value }
                })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEnd">Working Hours End</Label>
              <Input
                id="workEnd"
                type="time"
                value={formData.workingHours.end}
                onChange={(e) => setFormData({
                  ...formData,
                  workingHours: { ...formData.workingHours, end: e.target.value }
                })}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Organization'}
        </Button>
      </div>
    </form>
  );
} 