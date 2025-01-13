"use client";

import { UserProfile as Auth0User } from "@auth0/nextjs-auth0/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface UserProfileProps {
  user: Auth0User;
}

export function UserProfile({ user }: UserProfileProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    picture: user.picture || "",
  });

  const handleSave = async () => {
    try {
      // In a real app, you would update the user profile via API
      toast({
        title: "Profile updated",
        children: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to update profile. Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your personal information and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={formData.picture} alt={formData.name} />
            <AvatarFallback className="text-lg">
              {formData.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-medium">{formData.name}</h3>
            <p className="text-sm text-muted-foreground">{formData.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={!isEditing}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support for assistance.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      name: user.name || "",
                      email: user.email || "",
                      picture: user.picture || "",
                    });
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save changes</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit profile</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 