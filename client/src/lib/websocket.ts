import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { queryClient } from './queryClient';

type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

export function useWebSocket() {
  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts.current = 0;
      
      // Authenticate if user is logged in
      if (user) {
        ws.current?.send(JSON.stringify({
          type: 'AUTH',
          userId: user.id,
          role: user.role
        }));
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'NEW_ORDER':
            // Invalidate orders cache to refresh the list
            queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
            break;
            
          case 'ORDER_UPDATED':
            // Update specific order in cache
            queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
            break;
            
          case 'NEGATIVE_FEEDBACK':
            // Show notification for negative feedback
            queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
            break;
            
          default:
            console.log('Unknown WebSocket message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      
      // Attempt to reconnect
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          connect();
        }, 2000 * reconnectAttempts.current); // Exponential backoff
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [user]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: ws.current?.readyState === WebSocket.OPEN
  };
}
