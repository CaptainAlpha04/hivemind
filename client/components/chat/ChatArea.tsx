'use client';
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Send, Image as ImageIcon, Paperclip, User, Phone, MoreVertical, Mic } from 'lucide-react';

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

  // Generate a consistent color based on username
const getUsernameColor = (username: string) => {
  const colors = [
    'bg-primary', 'bg-secondary', 'bg-accent', 'bg-info',
    'bg-success', 'bg-warning', 'bg-error', 'bg-neutral'
  ];
  
  // Simple hash function to generate a consistent index
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle input change
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
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
      return '/images/user.png';
    }
    return message.senderId.profilePicture || '/images/user.png';
  };

  // Group messages by sender for consecutive messages
  const getMessageGroups = () => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];
    let currentSenderId: string | null = null;

    messages.forEach((message) => {
      const senderId = typeof message.senderId === 'string' 
        ? message.senderId 
        : message.senderId._id;

      if (senderId !== currentSenderId) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
          currentGroup = [];
        }
        currentSenderId = senderId;
      }
      currentGroup.push(message);
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  if (!selectedChat) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-base-200">
        <div className="text-center max-w-md p-6 rounded-xl  backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <Image 
              src="https://i.postimg.cc/sfccCSVg/image.png" 
              alt="HiveMind Welcome" 
              width={400} 
              height={400}
              className="rounded-lg" 
              unoptimized
            />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-white">Welcome to HiveMind Chat!</h2>
          <p className="text-gray-300 mb-5">Connect with friends, colleagues, and communities in real-time.</p>
          <p className="text-gray-400">Select a conversation from the sidebar or start a new chat to begin messaging.</p>
        </div>
      </div>
    );
  }

  return (

    <div className="h-full flex flex-col bg-base-200">
      {/* Horizontal divider at top */}
      <div className="h-px w-full bg-base-300"></div>
      
      {/* Chat header */}
      <div className="p-3 border-b border-base-300 flex items-center justify-between bg-base-200">
        <div className="flex items-center">
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
            <h2 className="font-semibold text-white">{selectedChat.name}</h2>
            <div className="flex items-center">
              <div className={`${getUsernameColor(selectedChat.username)} rounded-full px-2 py-0.5 mr-2`}>
                <span className="text-xs text-white font-medium">#{selectedChat.username}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-circle">
            <User size={20} className="text-gray-400" />
          </button>
          <button className="btn btn-ghost btn-circle">
            <Phone size={20} className="text-gray-400" />
          </button>
          <button className="btn btn-ghost btn-circle">
            <MoreVertical size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages area - independently scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-base-200 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          getMessageGroups().map((group, groupIndex) => {
            const isUserGroup = isCurrentUserMessage(group[0]);
            return (
              <div 
                key={`group-${groupIndex}`} 
                className={`flex ${isUserGroup ? 'justify-end' : 'justify-start'}`}
              >
                {!isUserGroup && (
                  <div className="avatar self-end mr-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                      <Image 
                        src={getSenderProfilePic(group[0])} 
                        alt={getSenderName(group[0])} 
                        width={32} 
                        height={32} 
                        className="object-cover" 
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                <div className={`flex flex-col max-w-[70%] ${isUserGroup ? 'items-end' : 'items-start'}`}>
                  {!isUserGroup && (
                    <span className="text-xs text-gray-400 mb-1 ml-1">{getSenderName(group[0])}</span>
                  )}
                  <div className="space-y-1">
                    {group.map((message, i) => (
                      <div key={message._id} className="flex items-end gap-1">
                        <div 
                          className={`rounded-2xl px-4 py-2 ${
                            isUserGroup 
                              ? 'bg-primary text-primary-content' 
                              : 'bg-base-300 text-white'
                          } ${
                            i === group.length - 1
                              ? isUserGroup ? 'rounded-br-sm' : 'rounded-bl-sm'
                              : ''
                          }`}
                        >
                          {message.content}
                          <div className={`text-xs opacity-70 ${isUserGroup ? 'text-right' : 'text-left'} mt-1`}>
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                        {isUserGroup && i === 0 && (
                          <div className="avatar self-end ml-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                              <Image 
                                src={currentUser.profilePicture} 
                                alt={currentUser.username} 
                                width={32} 
                                height={32} 
                                className="object-cover" 
                                unoptimized
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input area - fixed at bottom */}
      <div className="border-t border-base-300 p-3 bg-base-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*"
          />
          <button 
            type="button" 
            className="btn btn-ghost btn-circle" 
            onClick={triggerFileInput}
          >
            <Paperclip size={20} className="text-gray-400" />
          </button>
          <button type="button" className="btn btn-ghost btn-circle">
            <Mic size={20} className="text-gray-400" />
          </button>
          <input
            type="text"
            placeholder="Message here...."
            className="input bg-base-300 flex-1 border-0 focus:outline focus:outline-1 focus:outline-gray-500 text-white placeholder-gray-400 rounded-full"
            value={newMessage}
            onChange={handleTyping}
          />
          <button 
            type="submit" 
            className={`btn btn-circle ${(!newMessage.trim() && !selectedFile) ? 'btn-disabled' : 'btn-primary'}`}
            disabled={!newMessage.trim() && !selectedFile}
          >
            <Send size={18} className="text-current" />
          </button>
        </form>
        
        {selectedFile && (
          <div className="mt-2 p-2 bg-base-300 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <ImageIcon size={16} className="mr-2 text-white" />
              <span className="text-sm truncate max-w-[200px] text-white">{selectedFile.name}</span>
            </div>
            <button
              type="button"
              className="btn btn-xs btn-ghost text-white"
              onClick={() => setSelectedFile(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;