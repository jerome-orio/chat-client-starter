'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, UserCircle2, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
  type?: 'message' | 'system';
}

interface User {
  username: string;
  isTyping: boolean;
}

let socket: Socket | null = null;

const generateMessageId = (): string => uuidv4();

const ChatRoom: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string>('');
  const [isUsernameSet, setIsUsernameSet] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isUsernameSet) {
      socketInitializer();
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isUsernameSet]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const socketInitializer = async () => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || '', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket?.emit('user-joined', { username });
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    // Handle all incoming messages, including system messages
    socket.on('receive-message', (msg: Message) => {
      setMessages(prev => [...prev, {
        ...msg,
        timestamp: new Date(msg.timestamp),
      }]);
    });

    socket.on('typing-start', (data: { username: string }) => {
      setOnlineUsers(prev =>
        prev.map(user =>
          user.username === data.username
            ? { ...user, isTyping: true }
            : user
        )
      );
    });

    socket.on('typing-stop', (data: { username: string }) => {
      setOnlineUsers(prev =>
        prev.map(user =>
          user.username === data.username
            ? { ...user, isTyping: false }
            : user
        )
      );
    });

    socket.on('online-users', (users: User[]) => {
      setOnlineUsers(users);
    });
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing-start', { username });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing-stop', { username });
    }, 1000);
  };

  const handleUsernameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() && username) {
      const newMessage: Message = {
        id: generateMessageId(),
        username,
        text: message,
        timestamp: new Date(),
        type: 'message'
      };
      socket?.emit('send-message', newMessage);
      setMessage('');
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket?.emit('typing-stop', { username });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isUsernameSet) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Join Chat</h2>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Choose a username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-800">Chat Room</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {onlineUsers.length} online
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.username === username ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-xl ${msg.username === username ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
              >
                {msg.type !== 'system' && (
                  <UserCircle2
                    className={`w-8 h-8 ${msg.username === username ? 'text-blue-500' : 'text-gray-500'
                      }`}
                  />
                )}
                <div
                  className={`flex flex-col ${msg.username === username ? 'items-end' : 'items-start'
                    }`}
                >
                  {msg.type !== 'system' && (
                    <span className="text-xs text-gray-500 mb-1">
                      {msg.username}
                    </span>
                  )}
                  <div
                    className={`rounded-lg p-3 ${msg.type === 'system'
                      ? 'bg-gray-100 text-gray-600 text-center w-full'
                      : msg.username === username
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 shadow-sm'
                      }`}
                  >
                    {msg.text}
                    <div className={`flex items-center text-xs mt-1 ${msg.username === username ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {onlineUsers.some(user => user.isTyping && user.username !== username) && (
            <div className="text-sm text-gray-500 italic">
              Someone is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;