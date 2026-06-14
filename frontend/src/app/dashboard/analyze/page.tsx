"use client";
import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/resumes/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">Analyze Resume</h1>
        <p className="text-slate-400 mt-2 text-lg">Upload your resume and our AI will provide a comprehensive analysis.</p>
      </motion.div>

      {!result ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 relative overflow-hidden group"
        >
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <div className="relative w-64 h-32 border-2 border-cyan-500/30 rounded-xl overflow-hidden bg-slate-900/50">
                <div className="scanning-bar"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-50">
                  <FileText className="w-16 h-16 text-cyan-500" />
                </div>
              </div>
              <p className="mt-6 text-cyan-400 font-medium animate-pulse drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">AI is analyzing your resume...</p>
            </div>
          )}
          <div 
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 relative ${
              isDragging ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(0,240,255,0.2)]" : "border-slate-600 hover:border-cyan-500/50 hover:bg-white/5"
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
                    className="text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={analyzeResume}
                    disabled={isAnalyzing}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing AI...
                      </>
                    ) : "Start Analysis"}
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
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all font-medium border border-cyan-400/50"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <AlertCircle size={20} />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score & Summary Card */}
            <div className="glass-card p-8 flex flex-col md:flex-row gap-8 items-center border-t-4 border-t-cyan-500 shadow-[0_0_40px_rgba(0,240,255,0.1)]">
              <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                  <motion.circle 
                    cx="50" cy="50" r="40" fill="transparent" 
                    stroke={result.score >= 80 ? "#22c55e" : result.score >= 60 ? "#eab308" : "#ef4444"} 
                    strokeWidth="8" 
                    strokeDasharray={251.2} 
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * result.score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center flex flex-col items-center">
                  <div>
                    <span className="text-4xl font-bold text-white">{result.score}</span>
                    <span className="text-slate-400 text-sm">/ 100</span>
                  </div>
                  <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mt-1">ATS Score</span>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold text-slate-100">AI Summary</h3>
                  {result.resumeIq !== undefined && (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                      <span className="text-indigo-400 font-medium text-xs uppercase tracking-wider">Resume IQ</span>
                      <span className="text-indigo-300 font-bold text-lg">{result.resumeIq} <span className="text-sm font-normal opacity-70">/ 10</span></span>
                    </div>
                  )}
                </div>
                <p className="text-slate-300 leading-relaxed">{result.summary}</p>
              </div>
            </div>
            <button 
              onClick={removeFile}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all"
            >
              Analyze Another Resume
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                  <CheckCircle className="text-green-500 w-6 h-6" />
                  Analysis Complete
                </h2>
                <p className="text-slate-400 mt-1">Review your detailed ATS and AI feedback below.</p>
              </div>
              <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
                <span className="text-slate-400 font-medium">ATS Score</span>
                <div className={`text-3xl font-black ${
                  (result.atsScore || result.score) >= 80 ? "text-green-500" :
                  (result.atsScore || result.score) >= 60 ? "text-amber-500" : "text-red-500"
                }`}>
                  {result.atsScore || result.score}/100
                </div>
              </div>
            </div>

            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-2xl p-6 mb-8 text-left shadow-[0_0_30px_rgba(0,240,255,0.05)] backdrop-blur-md">
              <h3 className="text-xl font-bold text-cyan-400 mb-2 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">Professional Summary</h3>
              <p className="text-slate-300 leading-relaxed text-lg">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Strengths */}
              <motion.div whileHover={{ y: -5 }} className="glass-card p-6 border-t-4 border-t-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 drop-shadow-md">
                  <CheckCircle className="text-emerald-500 w-6 h-6 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  Key Strengths
                </h3>
                <ul className="space-y-3">
                  {result.strengths?.map((strength: string, i: number) => (
                    <li key={i} className="flex gap-3 text-slate-300">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Improvements */}
              <motion.div whileHover={{ y: -5 }} className="glass-card p-6 border-t-4 border-t-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 drop-shadow-md">
                  <AlertCircle className="text-amber-500 w-6 h-6 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                  Areas to Improve
                </h3>
                <ul className="space-y-3">
                  {(result.improvements || result.weaknesses)?.map((weak: string, i: number) => (
                    <li key={i} className="flex gap-3 text-slate-300">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Detailed Analysis Sections (Only if present) */}
            {(result.skills || result.extractedSkills) && (result.skills || result.extractedSkills).length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-left">
                  {/* Extracted Skills */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <CheckCircle className="text-blue-500 w-5 h-5" />
                      Extracted Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(result.skills || result.extractedSkills).map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <AlertCircle className="text-red-500 w-5 h-5" />
                      Missing Skills (Industry Standard)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills?.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended Roles */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-6 text-left">
                  <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <CheckCircle className="text-purple-500 w-5 h-5" />
                    Recommended Job Roles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.recommendedRoles?.map((role: string, i: number) => (
                      <div key={i} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-slate-200 font-medium">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Analysis Breakdown */}
                {result.sectionAnalysis && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-6 text-left">
                    <h3 className="text-2xl font-bold text-slate-100 mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                      <FileText className="text-pink-500 w-6 h-6" />
                      Section Breakdown
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                        <h4 className="text-pink-400 font-bold mb-2">Contact Info</h4>
                        <p className="text-slate-300 text-sm">{result.sectionAnalysis.contactInfo}</p>
                      </div>
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                        <h4 className="text-pink-400 font-bold mb-2">Education</h4>
                        <p className="text-slate-300 text-sm">{result.sectionAnalysis.education}</p>
                      </div>
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                        <h4 className="text-pink-400 font-bold mb-2">Skills Formatting</h4>
                        <p className="text-slate-300 text-sm">{result.sectionAnalysis.skillsSection || result.sectionAnalysis.skills}</p>
                      </div>
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                        <h4 className="text-pink-400 font-bold mb-2">Projects</h4>
                        <p className="text-slate-300 text-sm">{result.sectionAnalysis.projects}</p>
                      </div>
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                        <h4 className="text-pink-400 font-bold mb-2">Experience</h4>
                        <p className="text-slate-300 text-sm">{result.sectionAnalysis.experience}</p>
                      </div>
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                        <h4 className="text-pink-400 font-bold mb-2">Certifications</h4>
                        <p className="text-slate-300 text-sm">{result.sectionAnalysis.certifications}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interview Preparation */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-6 text-left">
                  <h3 className="text-2xl font-bold text-slate-100 mb-6 border-b border-slate-800 pb-4">Interview Preparation</h3>
                  
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-bold text-blue-400 mb-4">Technical Questions</h4>
                      <ul className="space-y-3">
                        {(result.interviewQuestions?.technical || result.techQuestions)?.map((q: string, i: number) => (
                          <li key={i} className="flex gap-3 text-slate-300 p-3 bg-slate-800/30 rounded-lg border border-slate-800/50">
                            <span className="text-blue-500 font-bold">Q{i+1}.</span> {q}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-amber-400 mb-4">HR & Behavioral Questions</h4>
                      <ul className="space-y-3">
                        {(result.interviewQuestions?.hr || result.hrQuestions)?.map((q: string, i: number) => (
                          <li key={i} className="flex gap-3 text-slate-300 p-3 bg-slate-800/30 rounded-lg border border-slate-800/50">
                            <span className="text-amber-500 font-bold">Q{i+1}.</span> {q}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-green-400 mb-4">Project-Based Questions</h4>
                      <ul className="space-y-3">
                        {(result.interviewQuestions?.project || result.projectQuestions)?.map((q: string, i: number) => (
                          <li key={i} className="flex gap-3 text-slate-300 p-3 bg-slate-800/30 rounded-lg border border-slate-800/50">
                            <span className="text-green-500 font-bold">Q{i+1}.</span> {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
