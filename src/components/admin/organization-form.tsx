"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TimezoneSelect } from '@/components/timezone-select';
import { useToast } from "@/components/ui/use-toast";
import { IOrganization } from '@/lib/db/schemas';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface OrganizationFormProps {
  initialData?: Partial<IOrganization>;
  onSuccess?: () => void;
}

export function OrganizationForm({ initialData, onSuccess }: OrganizationFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    type: initialData?.type ?? 'school',
    settings: {
      timezone: initialData?.settings?.timezone ?? 'UTC',
      workingDays: initialData?.settings?.workingDays ?? [1, 2, 3, 4, 5],
      defaultWorkingHours: {
        start: initialData?.settings?.defaultWorkingHours?.start ?? '08:00',
        end: initialData?.settings?.defaultWorkingHours?.end ?? '17:00'
      },
      notifications: {
        events: {
          creation: true,
          modification: true,
          cancellation: true,
          reminders: true
        },
        substitutions: {
          requests: true,
          confirmations: true,
          reminders: true
        },
        system: {
          maintenance: true,
          announcements: true
        },
        delivery: {
          email: true,
          push: true,
          inApp: true
        }
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData?.id 
        ? `/api/admin/organizations/${initialData.id}`
        : '/api/admin/organizations';

      const response = await fetch(url, {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save organization');

      toast({
        title: "Success",
        children: `Organization ${initialData?.id ? 'updated' : 'created'} successfully`
      });

      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to save organization"
      });
    } finally {
      setLoading(false);
    }
  };

  const weekdays = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
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
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    type: e.target.value as IOrganization['type']
                  })}
                  className="w-full p-2 border rounded"
                >
                  <option value="school">School</option>
                  <option value="district">District</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Timezone</Label>
                <TimezoneSelect
                  value={formData.settings.timezone}
                  onChange={(timezone) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, timezone }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="flex flex-wrap gap-2">
                  {weekdays.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={formData.settings.workingDays.includes(day.value) 
                        ? "default" 
                        : "outline"}
                      onClick={() => {
                        const newDays = formData.settings.workingDays.includes(day.value)
                          ? formData.settings.workingDays.filter(d => d !== day.value)
                          : [...formData.settings.workingDays, day.value].sort();
                        
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            workingDays: newDays
                          }
                        });
                      }}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Working Hours</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.settings.defaultWorkingHours.start}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          defaultWorkingHours: {
                            ...formData.settings.defaultWorkingHours,
                            start: e.target.value
                          }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.settings.defaultWorkingHours.end}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          defaultWorkingHours: {
                            ...formData.settings.defaultWorkingHours,
                            end: e.target.value
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Event Notifications</h3>
                  <div className="grid gap-2">
                    {Object.entries(formData.settings.notifications.events).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={`event-${key}`} className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Switch
                          id={`event-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              notifications: {
                                ...formData.settings.notifications,
                                events: {
                                  ...formData.settings.notifications.events,
                                  [key]: checked
                                }
                              }
                            }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Delivery Methods</h3>
                  <div className="grid gap-2">
                    {Object.entries(formData.settings.notifications.delivery).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={`delivery-${key}`} className="capitalize">
                          {key === 'inApp' ? 'In-App' : key} Notifications
                        </Label>
                        <Switch
                          id={`delivery-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              notifications: {
                                ...formData.settings.notifications,
                                delivery: {
                                  ...formData.settings.notifications.delivery,
                                  [key]: checked
                                }
                              }
                            }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (initialData?.id ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
} 