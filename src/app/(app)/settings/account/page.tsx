"use client";

import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimezoneSelect } from '@/components/ui/timezone-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from '@auth0/nextjs-auth0/client';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

interface OrganizationSettings {
  name: string;
  type: string;
  settings: {
    timezone: string;
    workingDays: number[];
    defaultWorkingHours: {
      start: string;
      end: string;
    };
    notifications: {
      emailEnabled: boolean;
      pushEnabled: boolean;
    };
  };
}

export default function OrganizationSettings() {
  const { toast } = useToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<OrganizationSettings>({
    name: '',
    type: 'school',
    settings: {
      timezone: 'UTC',
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      defaultWorkingHours: {
        start: '08:00',
        end: '17:00',
      },
      notifications: {
        emailEnabled: true,
        pushEnabled: true,
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetchWithAuth('/api/settings/organization', {
        method: 'PUT',
        user,
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      toast({
        title: "Success",
        children: "Organization settings updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to update organization settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const weekdays = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '7', label: 'Sunday' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Organization Type</Label>
              <Select
                value={settings.type}
                onValueChange={(value: 'school' | 'district' | 'other') => 
                  setSettings({ ...settings, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="district">District</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Working Hours</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={settings.settings.defaultWorkingHours.start}
                  onChange={(e) => setSettings({
                    ...settings,
                    settings: {
                      ...settings.settings,
                      defaultWorkingHours: {
                        ...settings.settings.defaultWorkingHours,
                        start: e.target.value
                      }
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={settings.settings.defaultWorkingHours.end}
                  onChange={(e) => setSettings({
                    ...settings,
                    settings: {
                      ...settings.settings,
                      defaultWorkingHours: {
                        ...settings.settings.defaultWorkingHours,
                        end: e.target.value
                      }
                    }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <TimezoneSelect
              value={settings.settings.timezone}
              onChange={(timezone) => setSettings({
                ...settings,
                settings: {
                  ...settings.settings,
                  timezone
                }
              })}
            />
          </div>

          {/* Working Days */}
          <div className="space-y-2">
            <Label>Working Days</Label>
            <div className="flex flex-wrap gap-2">
              {weekdays.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={settings.settings.workingDays.includes(Number(day.value)) 
                    ? "default" 
                    : "outline"}
                  onClick={() => {
                    const dayNum = Number(day.value);
                    setSettings({
                      ...settings,
                      settings: {
                        ...settings.settings,
                        workingDays: settings.settings.workingDays.includes(dayNum)
                          ? settings.settings.workingDays.filter(d => d !== dayNum)
                          : [...settings.settings.workingDays, dayNum].sort()
                      }
                    });
                  }}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.settings.notifications.emailEnabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    settings: {
                      ...settings.settings,
                      notifications: {
                        ...settings.settings.notifications,
                        emailEnabled: e.target.checked
                      }
                    }
                  })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  checked={settings.settings.notifications.pushEnabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    settings: {
                      ...settings.settings,
                      notifications: {
                        ...settings.settings.notifications,
                        pushEnabled: e.target.checked
                      }
                    }
                  })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="pushNotifications">Enable Push Notifications</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
