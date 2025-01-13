"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL!, {
      path: '/api/ws',
      auth: {
        userId: localStorage.getItem('userId')
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  return socket;
} 