
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Notice, Event, UserRole } from '@/lib/types';
import { getNotices, getEvents } from '@/lib/firebase/firestore';

const NOTIFICATION_STORAGE_KEY = 'read-notification-ids';

export function useNotifications(role?: UserRole) {
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const storedIds = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (storedIds) {
        setReadIds(new Set(JSON.parse(storedIds)));
      }
    } catch (e) {
      console.error("Failed to parse read notifications from localStorage", e);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [noticeData, eventData] = await Promise.all([getNotices(), getEvents()]);
        
        // Sort by creation date descending
        noticeData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        eventData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setAllNotices(noticeData);
        setAllEvents(eventData);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredNotices = useMemo(() => {
    if (!role) return [];
    return allNotices.filter(notice => notice.targetAudience.includes('all') || notice.targetAudience.includes(role));
  }, [allNotices, role]);

  const filteredEvents = useMemo(() => {
    if (!role) return [];
    return allEvents.filter(event => event.targetAudience.includes('all') || event.targetAudience.includes(role));
  }, [allEvents, role]);
  
  const allFilteredNotifications = useMemo(() => {
    const combined = [...filteredNotices, ...filteredEvents];
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return combined;
  }, [filteredNotices, filteredEvents]);


  const unreadCount = useMemo(() => {
    return allFilteredNotifications.filter(item => !readIds.has(item.id)).length;
  }, [allFilteredNotifications, readIds]);

  const markAllAsRead = useCallback(() => {
    const allIds = new Set(allFilteredNotifications.map(item => item.id));
    setReadIds(allIds);
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(Array.from(allIds)));
    } catch (e) {
       console.error("Failed to save read notifications to localStorage", e);
    }
  }, [allFilteredNotifications]);

  return {
    notices: filteredNotices,
    events: filteredEvents,
    notifications: allFilteredNotifications.slice(0, 10), // For dropdown
    unreadCount,
    loading,
    markAllAsRead,
  };
}
