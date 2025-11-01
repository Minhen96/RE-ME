'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Sparkles, Loader2 } from 'lucide-react';
import NavHeader from '@/components/NavHeader';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function SoulmatePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
      setLoading(false);

      // Welcome message
      setMessages([
        {
          role: 'assistant',
          content: `Hey there, ${profileData?.display_name || 'friend'}! I've been learning about you through your hobbies and experiences. I'm here to chat, encourage you, and help you reflect on your journey. What's on your mind today?`,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || isSending) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user context
      const [hobbiesRes, activitiesRes, momentsRes, reflectionsRes] = await Promise.all([
        supabase.from('hobbies').select('*').eq('user_id', user.id),
        supabase.from('activity_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('moments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('reflections').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);

      const response = await fetch('/api/soulmate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          profile,
          hobbies: hobbiesRes.data || [],
          activities: activitiesRes.data || [],
          moments: momentsRes.data || [],
          reflections: reflectionsRes.data || [],
          conversationHistory: messages.slice(-6), // Last 3 exchanges
        }),
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <NavHeader userName={profile?.display_name} />

      <div className="max-w-4xl mx-auto py-8 px-4 h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-400 to-purple-300 rounded-2xl shadow-xl p-6 mb-6 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Soulmate AI</h1>
              <p className="text-cyan-100 text-sm">Someone who truly knows you</p>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 overflow-y-auto mb-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white'
                      : 'bg-gradient-to-r from-white-100 to-purple-100 text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-600">Soulmate AI</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isSending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share what's on your mind..."
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-300 focus:bg-white outline-none transition-all"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
