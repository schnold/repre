import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganizations } from './use-organizations';
import { IEvent } from '@/lib/db/schemas';
import { useSocket } from './use-socket';
import { startOfDay, endOfDay } from 'date-fns';

interface FetchEventsParams {
  startDate: Date;
  endDate: Date;
  teacherId?: string;
  subjectId?: string;
}

export function useCalendarEventsQuery() {
  const { currentOrg } = useOrganizations();
  const queryClient = useQueryClient();
  const socket = useSocket();

  // Listen for real-time event updates
  useEffect(() => {
    if (!socket || !currentOrg) return;

    const handleEventUpdate = (event: IEvent) => {
      queryClient.setQueryData<IEvent[]>(
        ['events', currentOrg],
        (old) => old?.map(e => e._id === event._id ? event : e) ?? []
      );
    };

    const handleEventCreate = (event: IEvent) => {
      queryClient.setQueryData<IEvent[]>(
        ['events', currentOrg],
        (old) => [...(old ?? []), event]
      );
    };

    const handleEventDelete = (eventId: string) => {
      queryClient.setQueryData<IEvent[]>(
        ['events', currentOrg],
        (old) => old?.filter(e => e._id !== eventId) ?? []
      );
    };

    socket.on('event:update', handleEventUpdate);
    socket.on('event:create', handleEventCreate);
    socket.on('event:delete', handleEventDelete);

    return () => {
      socket.off('event:update', handleEventUpdate);
      socket.off('event:create', handleEventCreate);
      socket.off('event:delete', handleEventDelete);
    };
  }, [socket, currentOrg, queryClient]);

  // Query for fetching events
  const fetchEvents = async ({ startDate, endDate, teacherId, subjectId }: FetchEventsParams) => {
    if (!currentOrg) throw new Error('No organization selected');

    const params = new URLSearchParams({
      startDate: startOfDay(startDate).toISOString(),
      endDate: endOfDay(endDate).toISOString(),
      ...(teacherId && { teacherId }),
      ...(subjectId && { subjectId }),
    });

    const response = await fetch(
      `/api/organizations/${currentOrg}/events?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    return response.json();
  };

  // Mutation for creating events
  const createEvent = useMutation({
    mutationFn: async (eventData: Partial<IEvent>) => {
      const response = await fetch(`/api/organizations/${currentOrg}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      return response.json();
    },
    onSuccess: (newEvent) => {
      queryClient.setQueryData<IEvent[]>(
        ['events', currentOrg],
        (old) => [...(old ?? []), newEvent]
      );
    },
  });

  // Mutation for updating events
  const updateEvent = useMutation({
    mutationFn: async (updates: Partial<IEvent>) => {
      const response = await fetch(
        `/api/organizations/${currentOrg}/events/${updates._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );
      return response.json();
    },
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData<IEvent[]>(
        ['events', currentOrg],
        (old) => old?.map(e => e._id === updatedEvent._id ? updatedEvent : e) ?? []
      );
    },
  });

  // Mutation for deleting events
  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      await fetch(`/api/organizations/${currentOrg}/events/${eventId}`, {
        method: 'DELETE',
      });
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.setQueryData<IEvent[]>(
        ['events', currentOrg],
        (old) => old?.filter(e => e._id !== eventId) ?? []
      );
    },
  });

  return {
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
} 