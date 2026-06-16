"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, ArrowLeft, FileText, Download } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function ResumeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [optimizing, setOptimizing] = useState(false);

  const handleOptimize = async () => {
    try {
      setOptimizing(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/resumes/${params.id}/optimize`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to optimize");
      }
      const data = await res.json();
      setResult((prev: any) => ({ ...prev, optimizedResume: data.optimizedResume }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setOptimizing(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleDownloadDOCX = () => {
    if (!result.optimizedResume) return;
    const element = document.getElementById("print-resume-content");
    if (!element) return;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Resume</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + element.innerHTML + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-resume-${result.filename || 'download'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/resumes/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch analysis details");
        }
        
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchDetails();
    }
  }, [params.id, router]);

  if (loading) {
    return <div className="text-slate-400 mt-8 text-center">Loading analysis details...</div>;
  }

  if (error || !result) {
    return (
      <div className="text-center mt-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-400 mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Analysis Not Found</h2>
        <p className="text-slate-400 mt-2">{error || "This resume analysis could not be found."}</p>
        <Link href="/dashboard/resumes" className="inline-block mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          Back to Resumes
        </Link>
      </div>
    );
  }

  return (
    <>
    <div className="no-print max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/resumes" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">{result.filename || "Resume Analysis"}</h1>
          <p className="text-slate-400 mt-1">Analyzed on {new Date(result.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Score & Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col md:flex-row gap-8 items-center">
          <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
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
                  <span className="text-4xl font-bold text-white">{result.score || result.atsScore}</span>
                  <span className="text-slate-400 text-sm">/ 100</span>
                </div>
                <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mt-1">ATS Score</span>
              </div>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-slate-100">Professional Summary</h3>
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

        {/* Optimized Resume Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FileText className="text-teal-500 w-6 h-6" />
              ATS-Optimized Resume
            </h3>
            {result.optimizedResume && (
              <div className="flex gap-2">
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
                  <Download size={16} />
                  Download PDF
                </button>
                <button onClick={handleDownloadDOCX} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                  <Download size={16} />
                  Download DOC
                </button>
              </div>
            )}
          </div>
          
          {!result.optimizedResume ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-6">Generate an AI-rewritten, highly optimized version of this resume tailored for Applicant Tracking Systems.</p>
              <button 
                onClick={handleOptimize} 
                disabled={optimizing}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium rounded-xl transition-colors inline-flex items-center gap-2"
              >
                {optimizing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Generate Optimized Resume
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none bg-slate-950 p-6 rounded-xl border border-slate-800">
              <ReactMarkdown>{result.optimizedResume}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
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
          </div>

          {/* Improvements */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              <AlertCircle className="text-amber-500 w-5 h-5" />
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
          </div>
        </div>

        {/* Detailed Analysis Sections (Only if present) */}
        {(result.skills || result.extractedSkills) && (result.skills || result.extractedSkills).length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-6">
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
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-6">
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-6">
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
    </div>
    
    {/* Hidden element strictly for PDF and DOC printing */}
    <div id="print-resume-content" className="print-only hidden prose prose-black max-w-none p-8 bg-white text-black">
      {result?.optimizedResume && <ReactMarkdown>{result.optimizedResume}</ReactMarkdown>}
    </div>
    </>
  );
}
