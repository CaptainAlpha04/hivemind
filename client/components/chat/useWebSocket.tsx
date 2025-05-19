import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

interface WebSocketMessage {
  type: string;
  conversationId?: string;
  message?: any;
  // Add other message types as needed
}

export function useWebSocket() {
  const { data: session } = useSession();
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Create WebSocket connection
    // Use secure WebSocket if the site is served over HTTPS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_URL || 
                 (window.location.hostname + ':5000'); // Use server port
    
    const wsUrl = `${protocol}//${host}`;
    socket.current = new WebSocket(wsUrl);

    socket.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Send authentication message
      if (socket.current && session?.user?.id) {
        socket.current.send(JSON.stringify({
          type: 'auth',
          userId: session.user.id
        }));
      }
    };

    socket.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        setLastMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    socket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Clean up
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [session?.user?.id]);

  // Function to send messages
  const sendMessage = (data: any) => {
    if (socket.current && isConnected) {
      socket.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  };

  return { isConnected, lastMessage, sendMessage };
}

export default useWebSocket;
