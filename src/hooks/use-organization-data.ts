import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganizations } from './use-organizations';
import { ITeacher, ISubject, ISchedule } from '@/lib/db/schemas';

interface OrganizationData {
  teachers: ITeacher[];
  subjects: ISubject[];
  schedules: ISchedule[];
}

export function useOrganizationData() {
  const { currentOrg } = useOrganizations();
  const queryClient = useQueryClient();

  // Fetch all organization data in parallel
  const { data, isLoading, error } = useQuery<OrganizationData>({
    queryKey: ['organization-data', currentOrg],
    queryFn: async () => {
      if (!currentOrg) throw new Error('No organization selected');

      const [teachersRes, subjectsRes, schedulesRes] = await Promise.all([
        fetch(`/api/organizations/${currentOrg}/teachers`),
        fetch(`/api/organizations/${currentOrg}/subjects`),
        fetch(`/api/organizations/${currentOrg}/schedules`)
      ]);

      const [teachers, subjects, schedules] = await Promise.all([
        teachersRes.json(),
        subjectsRes.json(),
        schedulesRes.json()
      ]);

      return { teachers, subjects, schedules };
    },
    enabled: !!currentOrg,
  });

  // Mutation for updating teacher data
  const updateTeacher = useMutation({
    mutationFn: async (updates: Partial<ITeacher>) => {
      const response = await fetch(`/api/organizations/${currentOrg}/teachers/${updates._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onSuccess: (updatedTeacher) => {
      queryClient.setQueryData<OrganizationData>(['organization-data', currentOrg], 
        (old) => old ? {
          ...old,
          teachers: old.teachers.map(t => 
            t._id === updatedTeacher._id ? updatedTeacher : t
          )
        } : undefined
      );
    },
  });

  // Mutation for updating subject data
  const updateSubject = useMutation({
    mutationFn: async (updates: Partial<ISubject>) => {
      const response = await fetch(`/api/organizations/${currentOrg}/subjects/${updates._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onSuccess: (updatedSubject) => {
      queryClient.setQueryData<OrganizationData>(['organization-data', currentOrg], 
        (old) => old ? {
          ...old,
          subjects: old.subjects.map(s => 
            s._id === updatedSubject._id ? updatedSubject : s
          )
        } : undefined
      );
    },
  });

  // Mutation for updating schedule data
  const updateSchedule = useMutation({
    mutationFn: async (updates: Partial<ISchedule>) => {
      const response = await fetch(`/api/organizations/${currentOrg}/schedules/${updates._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onSuccess: (updatedSchedule) => {
      queryClient.setQueryData<OrganizationData>(['organization-data', currentOrg], 
        (old) => old ? {
          ...old,
          schedules: old.schedules.map(s => 
            s._id === updatedSchedule._id ? updatedSchedule : s
          )
        } : undefined
      );
    },
  });

  return {
    data,
    isLoading,
    error,
    updateTeacher,
    updateSubject,
    updateSchedule,
  };
} 