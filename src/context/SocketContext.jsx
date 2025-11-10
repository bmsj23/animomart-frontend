import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../utils/logger';

// eslint-disable-next-line react-refresh/only-export-components
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {

      // disconnect socket if user logs out
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // socket connection creation:
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace('/api', '');
    const newSocket = io(baseUrl, {
      auth: {
        token: localStorage.getItem('token')
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', () => {
      setIsConnected(false);
      logger.warn('Socket connection error - messaging features may be unavailable');
    });

    newSocket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    // cleanup
    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    isUserOnline: (userId) => onlineUsers.includes(userId)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};