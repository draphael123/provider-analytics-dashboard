import { useState } from 'react';
import { MessageSquare, Send, Clock, User } from 'lucide-react';

interface Message {
  id: string;
  provider: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ProviderCommunicationProps {
  provider: string;
  onClose: () => void;
}

const MESSAGES_STORAGE_KEY = 'provider-communication-messages';

export function ProviderCommunication({ provider, onClose }: ProviderCommunicationProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
      const allMessages = stored ? JSON.parse(stored) : [];
      return allMessages.filter((m: Message) => m.provider === provider);
    } catch {
      return [];
    }
  });

  const saveMessages = (newMessages: Message[]) => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
      const allMessages = stored ? JSON.parse(stored) : [];
      const otherMessages = allMessages.filter((m: Message) => m.provider !== provider);
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([...otherMessages, ...newMessages]));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      provider,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setMessage('');
  };

  const templateMessages = [
    "Great job this week! Your performance is improving.",
    "Let's schedule a brief check-in to discuss your visit duration.",
    "I noticed some improvement. Keep up the good work!",
    "Would you like additional training on time management?",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Send Message</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{provider}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ×
            </button>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No messages yet. Send your first message below.
            </p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm text-gray-900 dark:text-white">{msg.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Templates */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Templates:</p>
          <div className="flex flex-wrap gap-2">
            {templateMessages.map((template, index) => (
              <button
                key={index}
                onClick={() => setMessage(template)}
                className="px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Ctrl+Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}

