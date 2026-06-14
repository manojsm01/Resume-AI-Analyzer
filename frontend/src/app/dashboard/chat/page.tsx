"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, FileText, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const [messages, setMessages] = useState<{role: "user" | "ai", content: string}[]>([
    { role: "ai", content: "Hello! I am your AI Career Coach. I can analyze your resume, suggest improvements, or help you prepare for your next interview. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resumeContext, setResumeContext] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLatestResume();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchLatestResume = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/resumes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const history = await res.json();
        if (history && history.length > 0) {
          const latest = history[0];
          const contextStr = `
            ATS Score: ${latest.score}
            Resume IQ: ${latest.resumeIq}
            Summary: ${latest.summary}
            Skills: ${latest.skills_section}
            Experience: ${latest.experience}
            Education: ${latest.education}
          `;
          setResumeContext(contextStr);
        }
      }
    } catch (err) {
      console.error("Failed to load resume context", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          context: resumeContext
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "ai", content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: "ai", content: "Sorry, I am having trouble connecting to the server right now." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, an error occurred while processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md flex items-center gap-3">
          <Bot className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
          AI Career Coach
        </h1>
        <p className="text-slate-400 mt-2 flex items-center gap-2 text-lg">
          {resumeContext ? (
            <span className="flex items-center gap-2 text-emerald-400 font-medium">
              <FileText className="w-5 h-5" /> Context loaded from your latest resume
            </span>
          ) : (
            <span className="text-slate-400">Ask me anything about your career or interviews.</span>
          )}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 glass-card overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                  msg.role === "user" 
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-400/30" 
                    : "bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-cyan-400/30 drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                }`}>
                  {msg.role === "user" ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
                </div>
                <div className={`max-w-[80%] rounded-3xl p-5 shadow-lg backdrop-blur-md border ${
                  msg.role === "user" 
                    ? "bg-indigo-600/80 text-white rounded-tr-none border-indigo-500/50" 
                    : "bg-slate-800/80 text-slate-200 rounded-tl-none border-slate-700/50 leading-relaxed"
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i !== 0 ? "mt-2" : ""}>{line}</p>
                  ))}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-cyan-400/30 drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="max-w-[80%] rounded-3xl p-5 bg-slate-800/80 border border-cyan-500/30 text-cyan-100 rounded-tl-none flex items-center gap-3 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                  <Sparkles className="w-5 h-5 animate-pulse text-cyan-400" /> 
                  <span className="font-medium tracking-wide flex items-center">
                    Analyzing
                    <span className="flex space-x-1 ml-2">
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>.</motion.span>
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>.</motion.span>
                    </span>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-5 bg-slate-950/50 border-t border-white/10 backdrop-blur-xl">
          <div className="relative flex items-center group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask for interview advice, resume improvements, etc..."
              className="w-full pl-6 pr-16 py-4 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all placeholder:text-slate-500 font-medium"
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md group-focus-within:shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
