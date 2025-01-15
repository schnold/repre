"use client";

import { useState } from 'react';
import { IEvent } from '@/lib/db/schema/event';

interface UseEventsProps {
  scheduleId: string;
}

export function useEvents({ scheduleId }: UseEventsProps) {
  const [events, setEvents] = useState<(IEvent & { _id: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/events?scheduleId=${scheduleId}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Partial<IEvent>) => {
    try {
      setError(null);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventData, scheduleId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create event');
      }

      const newEvent = await response.json();
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<IEvent>) => {
    try {
      setError(null);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update event');
      }

      const updatedEvent = await response.json();
      setEvents(prev => prev.map(event => 
        event._id === eventId ? updatedEvent : event
      ));
      return updatedEvent;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete event');
      }

      const deletedEvent = await response.json();
      setEvents(prev => prev.filter(event => event._id !== eventId));
      return deletedEvent;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
} 