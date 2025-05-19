import WebSocket, { WebSocketServer } from 'ws';

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map(); // Map user IDs to their WebSocket connections
    this.setupWebSocketServer();
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws) => {
      console.log('New client connected');
      
      // Handle authentication and store user connection
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'auth' && data.userId) {
            this.clients.set(data.userId, ws);
            console.log(`User ${data.userId} connected`);
          }
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      });
      
      ws.on('close', () => {
        // Remove disconnected clients
        for (const [userId, client] of this.clients.entries()) {
          if (client === ws) {
            this.clients.delete(userId);
            console.log(`User ${userId} disconnected`);
            break;
          }
        }
      });
    });
  }

  // Send message to specific user
  sendToUser(userId, data) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  // Broadcast to conversation participants
  broadcastToConversation(conversationId, participantIds, data, excludeUserId = null) {
    participantIds.forEach(userId => {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, data);
      }
    });
  }
}

export default WebSocketService;
