"use client";
import { FileText, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumesPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/resumes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">My Resumes</h1>
          <p className="text-slate-400 mt-2 text-lg">View all your past resume analyses.</p>
        </div>
        <Link 
          href="/dashboard/analyze" 
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-400 hover:to-blue-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all font-medium flex items-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Analyze New Resume
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-white/10 bg-white/5 rounded-2xl">
              <p className="text-slate-400 text-lg">You haven't analyzed any resumes yet.</p>
            </div>
          ) : (
            <AnimatePresence>
              {history.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.05)] gap-4 group"
                >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] ${
                    item.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                    item.score >= 60 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                    'bg-red-500/10 text-red-400 border-red-500/30 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  }`}>
                    {item.score}
                  </div>
                  <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{item.filename || "Resume.pdf"}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Analyzed on <span className="text-slate-300 font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 md:ml-8">
                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{item.summary}</p>
                </div>

                <div className="flex-shrink-0 mt-4 md:mt-0 flex gap-3">
                  <Link href={`/dashboard/resumes/${item.id}`} className="text-white font-medium flex items-center gap-1 transition-all px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl shadow-sm">
                    View Details
                  </Link>
                  <Link href="/dashboard/analyze" className="text-cyan-400 hover:text-white font-medium flex items-center gap-1 transition-all px-5 py-2.5 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                    Re-analyze
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
