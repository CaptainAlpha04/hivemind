'use client';
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Send, Image as ImageIcon, Smile, Paperclip } from 'lucide-react';

interface Chat {
  id: string;
  name: string;
  username: string;
  profilePicture: string;
}

interface User {
  id: string;
  username: string;
  profilePicture: string;
}

interface Message {
  _id: string;
  senderId: string | {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  content?: string;
  hasImage?: boolean;
  createdAt: string;
  reactions: Array<{
    userId: string;
    emoji: string;
  }>;
}

interface ChatAreaProps {
  selectedChat: Chat | undefined;
  currentUser: User;
}

const ChatArea = ({ selectedChat, currentUser }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    } else {
      // Clear messages when no chat is selected
      setMessages([]);
    }
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    
    setIsLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/chats/${selectedChat.id}/messages?userId=${currentUser.id}`;
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Failed to fetch messages:', response.status);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedFile) || !selectedChat) return;
    
    try {
      const formData = new FormData();
      formData.append('conversationId', selectedChat.id);
      formData.append('userId', currentUser.id);
      
      if (newMessage.trim()) {
        formData.append('content', newMessage.trim());
      }
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/chats/messages`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const sentMessage = await response.json();
        setMessages([...messages, sentMessage]);
        setNewMessage('');
        setSelectedFile(null);
      } else {
        console.error('Failed to send message:', response.status);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/chats/messages/${messageId}/react`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji, userId: currentUser.id }),
      });
      
      if (response.ok) {
        const updatedMessage = await response.json();
        // Update the specific message in our messages array
        setMessages(messages.map(msg => 
          msg._id === updatedMessage._id ? updatedMessage : msg
        ));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine if a message is from the current user
  const isCurrentUserMessage = (message: Message) => {
    const senderId = typeof message.senderId === 'string' 
      ? message.senderId 
      : message.senderId._id;
    return senderId === currentUser.id;
  };

  // Get sender name from message
  const getSenderName = (message: Message) => {
    if (typeof message.senderId === 'string') {
      return 'Unknown User';
    }
    return message.senderId.username;
  };

  // Get sender profile pic URL
  const getSenderProfilePic = (message: Message) => {
    if (typeof message.senderId === 'string') {
      return '/default-avatar.png';
    }
    return message.senderId.profilePicture || '/default-avatar.png';
  };

  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center bg-base-100">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Welcome to HiveMind Chat</h3>
          <p className="text-base-content/60">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b border-base-300 flex items-center">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
            <Image 
              src={selectedChat.profilePicture} 
              alt={selectedChat.name} 
              width={40} 
              height={40} 
              className="object-cover" 
              unoptimized
            />
          </div>
        </div>
        <div className="ml-3">
          <h2 className="font-semibold">{selectedChat.name}</h2>
          <p className="text-xs text-base-content/60">#{selectedChat.username}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isUserMessage = isCurrentUserMessage(message);
            return (
              <div 
                key={message._id} 
                className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col max-w-[70%]">
                  {!isUserMessage && (
                    <div className="flex items-center mb-1">
                      <div className="avatar">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700">
                          <Image 
                            src={getSenderProfilePic(message)} 
                            alt={getSenderName(message)} 
                            width={24} 
                            height={24} 
                            className="object-cover" 
                            unoptimized
                          />
                        </div>
                      </div>
                      <span className="text-xs font-medium ml-2">{getSenderName(message)}</span>
                    </div>
                  )}
                  <div className={`rounded-lg p-3 ${
                    isUserMessage 
                      ? 'bg-primary text-primary-content rounded-tr-none' 
                      : 'bg-base-300 rounded-tl-none'
                  }`}>
                    {message.content && <p className="break-words">{message.content}</p>}
                    {message.hasImage && (
                      <div className="mt-2">
                        <Image 
                          src={`${process.env.NEXT_PUBLIC_API_URL}/api/chats/messages/${message._id}/image`}
                          alt="Message image"
                          width={200}
                          height={200}
                          className="rounded-md max-w-full h-auto"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="text-right text-xs mt-1 opacity-70">
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                  {message.reactions.length > 0 && (
                    <div className="flex mt-1 gap-1">
                      {message.reactions.map((reaction, index) => (
                        <span 
                          key={index} 
                          className="bg-base-200 px-1.5 py-0.5 rounded-full text-xs"
                        >
                          {reaction.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-base-300">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {selectedFile && (
            <div className="relative bg-base-200 rounded p-1 mr-2">
              <span className="text-xs">{selectedFile.name}</span>
              <button 
                type="button"
                className="ml-2 text-xs text-error" 
                onClick={() => setSelectedFile(null)}
              >
                ×
              </button>
            </div>
          )}
          <button 
            type="button"
            className="btn btn-circle btn-sm btn-ghost" 
            onClick={triggerFileInput}
          >
            <ImageIcon size={18} />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
          </button>
          <button type="button" className="btn btn-circle btn-sm btn-ghost">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder="Type your message..."
            className="input input-bordered flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit" 
            className="btn btn-circle btn-primary" 
            disabled={!newMessage.trim() && !selectedFile}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;