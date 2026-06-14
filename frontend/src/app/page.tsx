"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { ArrowRight, LogIn, UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGuestAnalyzer, setShowGuestAnalyzer] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  const analyzeResume = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Using public endpoint, no token required
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/public/analyze`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later or create a free account.");
        }
        throw new Error("Failed to analyze resume");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred connecting to the AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
      
      <div className="glass-card p-8 sm:p-12 text-center w-full max-w-4xl z-10 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-y-auto max-h-screen">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">ResumeIQ AI</h1>
        
        {!showGuestAnalyzer ? (
          <div className="max-w-lg mx-auto py-8">
            <p className="text-lg text-slate-400 mb-10">
              Futuristic AI-powered Resume Analyzer. Get instant feedback on your resume.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setShowGuestAnalyzer(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl font-medium hover:bg-blue-600/30 transition-all w-full sm:w-auto justify-center"
              >
                <FileText className="w-4 h-4" />
                Analyze as Guest
              </button>
              
              <Link 
                href="/login"
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-medium hover:bg-slate-700 hover:text-white transition-all w-full sm:w-auto justify-center"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>

              <Link 
                href="/register"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all w-full sm:w-auto justify-center shadow-lg shadow-blue-900/20"
              >
                Register
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : !result ? (
          <div className="max-w-2xl mx-auto space-y-8 mt-4">
            <p className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto">
              Upload your resume for a free instant AI analysis. Limited to 3 analyses per hour for guests.
            </p>
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all ${
                isDragging ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-600 bg-slate-950/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                    <FileText size={32} />
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium">{file.name}</p>
                    <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <button 
                      onClick={removeFile}
                      className="text-slate-400 hover:text-slate-300 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={analyzeResume}
                      disabled={isAnalyzing}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : "Analyze Now"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium text-lg">Drag & Drop your resume</p>
                    <p className="text-slate-500 text-sm mt-1">Supports PDF, DOCX, TXT</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept=".pdf,.txt,.doc,.docx"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-medium border border-slate-700"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center justify-center gap-2">
                <AlertCircle size={18} />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-800">
              <span className="text-slate-500 text-sm">Already have an account?</span>
              <Link 
                href="/login"
                className="flex items-center gap-2 px-5 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg font-medium hover:bg-slate-700 transition-all text-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-left"
            >
              {/* Score & Summary Card */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
                <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                    <motion.circle 
                      cx="50" cy="50" r="40" fill="transparent" 
                      stroke={(result.atsScore || result.score) >= 80 ? "#22c55e" : (result.atsScore || result.score) >= 60 ? "#eab308" : "#ef4444"} 
                      strokeWidth="8" 
                      strokeDasharray={251.2} 
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * (result.atsScore || result.score)) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center flex flex-col items-center">
                    <div>
                      <span className="text-3xl md:text-4xl font-bold text-white">{result.atsScore || result.score}</span>
                      <span className="text-slate-400 text-xs md:text-sm">/ 100</span>
                    </div>
                    <span className="text-slate-400 text-[10px] md:text-xs font-medium uppercase tracking-wider mt-1">ATS Score</span>
                  </div>
                </div>
                <div className="space-y-4 text-center md:text-left flex-1">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-100">AI Summary</h3>
                    {result.resumeIq !== undefined && (
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <span className="text-indigo-400 font-medium text-xs uppercase tracking-wider">Resume IQ</span>
                        <span className="text-indigo-300 font-bold text-lg">{result.resumeIq} <span className="text-sm font-normal opacity-70">/ 10</span></span>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm md:text-base">{result.summary}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-500 w-5 h-5" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-3">
                    {result.strengths?.map((str: string, i: number) => (
                      <li key={i} className="flex gap-3 text-slate-300 text-sm">
                        <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <AlertCircle className="text-amber-500 w-5 h-5" />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-3">
                    {(result.improvements || result.weaknesses || []).map((weak: string, i: number) => (
                      <li key={i} className="flex gap-3 text-slate-300 text-sm">
                        <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-8 pt-8 border-t border-slate-800 text-center space-y-4">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-blue-500/20 max-w-2xl mx-auto shadow-lg shadow-blue-900/10">
                  <h4 className="text-xl font-bold text-slate-100 mb-2">Want to save this analysis and get deeper improvements?</h4>
                  <p className="text-slate-400 mb-6">Please log in to explore more features, unlock the AI Career Coach, and track your resume progress over time.</p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={removeFile}
                      className="px-6 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all font-medium w-full sm:w-auto"
                    >
                      Test Another Resume
                    </button>
                    <Link 
                      href="/login"
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl font-medium hover:bg-slate-700 transition-all w-full sm:w-auto"
                    >
                      Log In
                    </Link>
                    <Link 
                      href="/register"
                      className="flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 w-full sm:w-auto"
                    >
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
