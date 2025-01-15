'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { IOrganization } from '@/lib/db/interfaces';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@auth0/nextjs-auth0/client';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

export default function OrganizationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, [user]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetchWithAuth('/api/organizations', { user });
      if (!response.ok) throw new Error('Failed to fetch organizations');
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        children: 'Failed to load organizations',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <Button onClick={() => router.push('/organizations/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Organization
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : organizations.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No organizations found</p>
              <Button onClick={() => router.push('/organizations/new')}>
                Create your first organization
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card 
              key={org._id?.toString()} 
              className="cursor-pointer hover:bg-accent/50 transition-colors" 
              onClick={() => router.push(`/organizations/${org._id}`)}
            >
              <CardHeader>
                <CardTitle>{org.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mt-2">
                  {org.description || 'No description'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 