"use client";
import { FileText, TrendingUp, Users, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const stats = [
    { label: "Resumes Analyzed", value: loading ? "..." : history.length.toString(), icon: FileText, trend: "+1 this week" },
    { label: "Average Score", value: loading ? "..." : history.length > 0 ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length).toString() : "0", icon: TrendingUp, trend: "Overall Performance" }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">Welcome Back</h1>
        <p className="text-slate-400 mt-2 text-lg">Here's what's happening with your resumes today.</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
      >
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-card p-6 flex flex-col transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:border-cyan-500/30 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-xl group-hover:bg-cyan-500/10 transition-colors duration-300">
                <stat.icon className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </p>
              <h3 className="text-cyan-100/70 font-medium mb-2">{stat.label}</h3>
              <p className="text-sm text-cyan-400/50">{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Analysis Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white drop-shadow-sm">Recent Analyses</h2>
          <Link href="/dashboard/analyze" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
            Analyze New Resume
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-2 bg-white/10 rounded w-3/4"></div>
                <div className="h-2 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
              <p className="text-slate-400">No resumes analyzed yet.</p>
              <Link href="/dashboard/analyze" className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all font-medium">
                Upload Your First Resume
              </Link>
            </div>
          ) : (
            history.map((item, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.01, x: 5 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] ${
                    item.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    item.score >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {item.score}
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium group-hover:text-cyan-300 transition-colors">{item.filename || "Resume.pdf"}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Link href={`/dashboard/resumes/${item.id}`} className="text-cyan-400 hover:text-cyan-300 px-4 py-2 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 transition-colors text-sm font-medium border border-cyan-500/20 opacity-0 group-hover:opacity-100">
                  View Details
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
