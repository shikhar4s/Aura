import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Leaf } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

// --- API Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000';
const CHAT_API_ENDPOINT = '/api/plant_doctor_ai/chat/';

// --- Type Definitions ---

// Type for messages displayed in the UI
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Type for the history payload sent to the API
interface GeminiHistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}


// --- API Client (replace with your app's existing client if you have one) ---
const apiClient = {
  post: async (url: string, data: any, language: string) => {
    // IMPORTANT: Implement your logic to retrieve the user's auth token.
    // This is just an example using localStorage.
    const getAuthToken = () => localStorage.getItem('access_token');
    const token = getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Language'] = language;
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON error responses
        const errorMessage = errorData.detail || errorData.error || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
    }
    return response.json();
  }
};

// --- Helper Function ---

const formatHistoryForApi = (messages: Message[]): GeminiHistoryItem[] => {
  return messages.slice(1).map(message => ({
    role: message.isUser ? 'user' : 'model',
    parts: [{ text: message.text }],
  }));
};


const Chatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chatbot.greeting', 'Hello! I am PlantDoc Assistant. How can I help you with your plant health today?'),
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string, currentHistory: Message[]): Promise<string> => {
    const historyForApi = formatHistoryForApi(currentHistory);

    try {
      const data = await apiClient.post(CHAT_API_ENDPOINT, {
        history: historyForApi,
        newMessage: userMessage,
      }, language);
      
      return data.response || t('chatbot.error.noResponse', 'I received a response, but it was empty.');

    } catch (error) {
      console.error("Error communicating with chatbot API:", error);
      return t('chatbot.error.apiUnavailable', 'Sorry, I am having trouble connecting right now. Please try again later.');
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessageText = inputText;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsTyping(true);

    const responseText = await generateResponse(userMessageText, updatedMessages);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-80 h-[28rem] mb-4 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">{t('chatbot.title')}</h3>
                <p className="text-xs text-green-100">{t('chatbot.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 rounded-full transition-colors duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm break-words ${
                    message.isUser
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs px-3 py-2 rounded-2xl text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chatbot.placeholder')}
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className="bg-green-500 text-white p-2.5 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Chatbot;