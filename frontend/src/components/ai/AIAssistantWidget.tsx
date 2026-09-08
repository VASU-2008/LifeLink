import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User as UserIcon, ShieldAlert, ArrowRight } from 'lucide-react';
import { aiService } from '../../services/aiService';

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        "Hello! I am your **LifeLink AI Emergency Assistant**.\n\nI can help you check donor eligibility, understand blood compatibility, find donation centers, or guide you through creating an emergency request.\n\n*Note: LifeLink AI provides decision-support only and does not provide medical diagnosis.*",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    'Am I eligible to donate?',
    'Who can receive O- blood?',
    'How do emergency broadcasts work?',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await aiService.chat(newMessages);
      if (res.success && res.reply) {
        setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
        if (res.suggestedActions) {
          setSuggestedActions(res.suggestedActions);
        }
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            "I'm sorry, I encountered a temporary connection issue. Please check your emergency request directly or try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-crimson-600 to-rose-600 text-white font-bold text-xs shadow-2xl shadow-crimson-900/60 hover:scale-105 transition-all duration-300"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
          <span>LifeLink AI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-slate-900 border border-slate-700 rounded-3xl w-[360px] sm:w-[400px] h-[520px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-crimson-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-crimson-900/50">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  LifeLink AI Assistant
                  <span className="text-[9px] bg-crimson-950 border border-crimson-700/60 text-crimson-300 px-1.5 rounded-full font-semibold">
                    Decision Support
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">Emergency Blood Intelligence</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-crimson-950 border border-crimson-700/60 flex items-center justify-center text-crimson-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-crimson-600 text-white font-medium rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-lg bg-crimson-950 border border-crimson-700/60 flex items-center justify-center text-crimson-400">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="flex gap-1 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-crimson-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-crimson-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-crimson-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {suggestedActions.length > 0 && (
            <div className="px-3 py-2 bg-slate-950/40 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
              {suggestedActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(action)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-[10px] text-slate-300 transition shrink-0"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-2xl px-3 py-1.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about eligibility, blood groups..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="w-7 h-7 rounded-xl bg-crimson-600 hover:bg-crimson-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
