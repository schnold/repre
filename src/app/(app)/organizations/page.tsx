'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreVertical, Plus, Trash2 } from 'lucide-react';
import { IOrganization } from '@/lib/db/interfaces';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@auth0/nextjs-auth0/client';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { OrganizationDialog } from '@/components/organizations/organization-dialog';
import { useSelectedOrganization } from '@/hooks/use-selected-organization';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function OrganizationsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const { selectOrganization } = useSelectedOrganization();
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; orgId?: string }>({
    open: false,
  });

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
        description: 'Failed to load organizations',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orgId: string) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete organization');
      
      toast({
        title: 'Success',
        description: 'Organization deleted successfully',
      });
      fetchOrganizations();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete organization',
      });
    }
    setDeleteDialog({ open: false });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <OrganizationDialog mode="create" />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : organizations.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No organizations found</p>
              <OrganizationDialog mode="create" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card 
              key={org._id?.toString()} 
              className="relative cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => selectOrganization(org._id.toString())}
            >
              <div className="absolute right-4 top-4 z-10" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteDialog({ open: true, orgId: org._id?.toString() })}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              organization and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.orgId && handleDelete(deleteDialog.orgId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 