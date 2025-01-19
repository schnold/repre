"use client";

import { useEffect, useState } from "react";
import { useOrganizationStore } from "@/store/organization-store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function OrganizationSelector() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { 
    organizations, 
    selectedOrganization, 
    setOrganizations, 
    setSelectedOrganization 
  } = useOrganizationStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations');
        if (!response.ok) throw new Error("Failed to fetch organizations");
        const data = await response.json();
        setOrganizations(data);
        
        // Select the first organization if none is selected
        if (!selectedOrganization && data.length > 0) {
          setSelectedOrganization(data[0]);
        }
      } catch (error) {
        setError("Failed to load organizations");
        console.error('Error fetching organizations:', error);
        toast({
          title: "Error",
          description: "Failed to load organizations",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [setOrganizations, setSelectedOrganization, selectedOrganization, toast]);

  if (loading) {
    return <div>Loading organizations...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (organizations.length === 0) {
    return (
      <Alert>
        <AlertDescription>No organizations available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-[200px]">
      <Select 
        value={selectedOrganization?._id.toString()} 
        onValueChange={(value) => {
          const org = organizations.find(o => o._id.toString() === value);
          if (org) {
            setSelectedOrganization(org);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem 
              key={org._id.toString()} 
              value={org._id.toString()}
            >
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 