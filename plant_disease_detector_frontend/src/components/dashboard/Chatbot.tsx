import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Leaf } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chatbot.greeting'),
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Mock AI responses - in real app, this would call your LLM API
    const responses = [
      // Disease-related responses
      {
        keywords: ['disease', 'sick', 'infection', 'fungus', 'bacteria', 'virus'],
        response: 'I can help you identify plant diseases! Common signs include yellowing leaves, spots, wilting, or unusual growths. For accurate diagnosis, I recommend uploading a clear photo of the affected plant. In the meantime, ensure good air circulation and avoid watering leaves directly.'
      },
      {
        keywords: ['leaf spot', 'spots', 'brown spots', 'black spots'],
        response: 'Leaf spots are often caused by fungal infections. Treatment: Remove affected leaves, improve air circulation, and apply a copper-based fungicide. Water at soil level to prevent splash-back. Consider using neem oil as a natural alternative.'
      },
      {
        keywords: ['powdery mildew', 'white powder', 'mildew'],
        response: 'Powdery mildew appears as white, powdery growth on leaves. Treatment: Spray with a baking soda solution (1 tsp per quart of water) or neem oil. Increase air circulation and reduce humidity. Remove affected parts and dispose of them properly.'
      },
      {
        keywords: ['yellowing', 'yellow leaves', 'chlorosis'],
        response: 'Yellowing leaves can indicate several issues: overwatering, nutrient deficiency (especially nitrogen), or natural aging. Check soil moisture and drainage. Consider fertilizing with a balanced fertilizer if nutrients are lacking.'
      },
      // Prevention and care
      {
        keywords: ['prevent', 'prevention', 'healthy', 'care'],
        response: 'Prevention is key! Maintain proper spacing for air circulation, water at soil level, rotate crops, choose disease-resistant varieties, and keep your garden clean. Regular inspection helps catch problems early.'
      },
      {
        keywords: ['watering', 'water', 'irrigation'],
        response: 'Proper watering is crucial! Water deeply but less frequently, preferably in the morning. Avoid wetting leaves to prevent fungal diseases. Check soil moisture by inserting your finger 2 inches deep - water when it\'s dry.'
      },
      {
        keywords: ['fertilizer', 'nutrients', 'feeding'],
        response: 'Plants need balanced nutrition! Use a balanced fertilizer (10-10-10 or similar) for general feeding. Organic options include compost, fish emulsion, or worm castings. Over-fertilizing can cause more harm than good.'
      },
      // Organic solutions
      {
        keywords: ['organic', 'natural', 'chemical-free'],
        response: 'Organic solutions are great! Try neem oil for pests and diseases, diatomaceous earth for crawling insects, companion planting for natural pest control, and beneficial insects for biological control. Compost improves soil health naturally.'
      },
      // Seasonal advice
      {
        keywords: ['spring', 'summer', 'fall', 'winter', 'season'],
        response: 'Seasonal care varies! Spring: prepare soil and plant. Summer: maintain watering and pest control. Fall: harvest and prepare for winter. Winter: plan next season and maintain tools. Each season has specific tasks for optimal plant health.'
      }
    ];

    const lowerMessage = userMessage.toLowerCase();
    
    // Find matching response
    for (const response of responses) {
      if (response.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return response.response;
      }
    }

    // Default responses
    const defaultResponses = [
      'That\'s an interesting question! Plant health depends on many factors including soil quality, watering, light, and pest management. Could you provide more specific details about your plant or the issue you\'re facing?',
      'I\'d be happy to help! For the best advice, could you tell me more about your specific plant type and the symptoms you\'re observing? Photos are also very helpful for accurate diagnosis.',
      'Plant care can be complex! Are you dealing with a specific disease, pest issue, or general care question? The more details you provide, the better I can assist you.',
      'Great question! Successful farming involves proper soil preparation, appropriate plant selection, and consistent care. What specific aspect of plant care are you most interested in learning about?'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const response = await generateResponse(inputText);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
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
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-80 h-96 mb-4 flex flex-col">
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
                  className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
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
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                className="flex-1 px-3 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
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