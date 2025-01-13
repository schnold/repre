"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

interface NotificationSettingsProps {
  organizationId: string;
}

interface NotificationPreferences {
  events: {
    creation: boolean;
    modification: boolean;
    cancellation: boolean;
    reminders: boolean;
  };
  substitutions: {
    requests: boolean;
    confirmations: boolean;
    reminders: boolean;
  };
  system: {
    maintenance: boolean;
    announcements: boolean;
  };
  delivery: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export function NotificationSettings({ organizationId }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationPreferences>({
    events: {
      creation: true,
      modification: true,
      cancellation: true,
      reminders: true,
    },
    substitutions: {
      requests: true,
      confirmations: true,
      reminders: true,
    },
    system: {
      maintenance: true,
      announcements: true,
    },
    delivery: {
      email: true,
      push: true,
      inApp: true,
    },
  });

  useEffect(() => {
    if (organizationId) {
      fetchSettings();
    }
  }, [organizationId]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notification settings');
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to load notification settings"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/notifications`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        }
      );

      if (!response.ok) throw new Error('Failed to save notification settings');

      toast({
        title: "Success",
        children: "Notification settings updated successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to save notification settings"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="event-creation">Event Creation</Label>
            <Switch
              id="event-creation"
              checked={settings.events.creation}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  events: { ...settings.events, creation: checked }
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="event-modification">Event Modifications</Label>
            <Switch
              id="event-modification"
              checked={settings.events.modification}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  events: { ...settings.events, modification: checked }
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="event-cancellation">Event Cancellations</Label>
            <Switch
              id="event-cancellation"
              checked={settings.events.cancellation}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  events: { ...settings.events, cancellation: checked }
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="event-reminders">Event Reminders</Label>
            <Switch
              id="event-reminders"
              checked={settings.events.reminders}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  events: { ...settings.events, reminders: checked }
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Substitution Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sub-requests">Substitution Requests</Label>
            <Switch
              id="sub-requests"
              checked={settings.substitutions.requests}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  substitutions: { ...settings.substitutions, requests: checked }
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sub-confirmations">Substitution Confirmations</Label>
            <Switch
              id="sub-confirmations"
              checked={settings.substitutions.confirmations}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  substitutions: { ...settings.substitutions, confirmations: checked }
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sub-reminders">Substitution Reminders</Label>
            <Switch
              id="sub-reminders"
              checked={settings.substitutions.reminders}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  substitutions: { ...settings.substitutions, reminders: checked }
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={settings.delivery.email}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  delivery: { ...settings.delivery, email: checked }
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch
              id="push-notifications"
              checked={settings.delivery.push}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  delivery: { ...settings.delivery, push: checked }
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="inapp-notifications">In-App Notifications</Label>
            <Switch
              id="inapp-notifications"
              checked={settings.delivery.inApp}
              onCheckedChange={(checked) => 
                setSettings({
                  ...settings,
                  delivery: { ...settings.delivery, inApp: checked }
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
} 