import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { createRecruiterChat } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'model', content: 'Hi there! I am your Recruiter Assistant. How can I help you refine your job description or prepare for interviews?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = createRecruiterChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', content: '', isStreaming: true }]);

    try {
      const streamResponse = await chatRef.current.sendMessageStream({ message: userMsg.content });
      
      for await (const chunk of streamResponse) {
        setMessages(prev => prev.map(msg => {
          if (msg.id === modelMsgId) {
            return { ...msg, content: msg.content + (chunk.text || '') };
          }
          return msg;
        }));
      }
      
      setMessages(prev => prev.map(msg => msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg));
    } catch (err: any) {
      console.error(err);
      setMessages(prev => prev.map(msg => msg.id === modelMsgId ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false } : msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50 text-gray-800">
        <Bot className="w-5 h-5 text-blue-600" />
        <h2 className="font-medium">Recruiter Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-xl p-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              <div className={msg.role === 'user' ? 'text-white' : 'markdown-body text-sm'}>
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  <Markdown>{msg.content}</Markdown>
                )}
                {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-gray-400 animate-pulse" />}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && !messages.find(m => m.isStreaming) && (
          <div className="flex items-center gap-2 text-gray-500 text-sm p-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Ask about recruiting, JDs, or interviews..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
