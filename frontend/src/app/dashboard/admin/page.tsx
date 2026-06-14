"use client";
import { useEffect, useState } from "react";
import { Users, Clock, FileText, Activity, Search, Trash2, ShieldAlert, ShieldCheck, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminUserStats {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  totalResumesAnalyzed: number;
  averageScore: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  useEffect(() => {
    // Basic decode of JWT payload to get current user's email to prevent self-deletion UI
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub) setCurrentUserEmail(payload.sub);
      } catch (e) {}
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("You do not have permission to view this page.");
        }
        throw new Error("Failed to fetch user data.");
      }
      
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to completely delete this user and all their resume analyses? This action cannot be undone.")) return;
    
    setActionLoadingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      alert("Failed to delete user: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRole = async (user: AdminUserStats) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Are you sure you want to change ${user.firstName}'s role to ${newRole}?`)) return;

    setActionLoadingId(user.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users/${user.id}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert("Failed to update role: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (user.firstName + " " + user.lastName).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-cyan-400" />
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-2 text-lg">System overview and user management.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div 
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-2xl p-6 flex flex-col hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] hover:border-cyan-500/30 transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-xl">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white mb-1">
              {users.length}
            </p>
            <h3 className="text-slate-400 font-medium">Total Users</h3>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-2xl p-6 flex flex-col hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] hover:border-cyan-500/30 transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-xl">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white mb-1">
              {users.reduce((acc, u) => acc + (u.totalResumesAnalyzed || 0), 0)}
            </p>
            <h3 className="text-slate-400 font-medium">Total Analyses</h3>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-2xl p-6 flex flex-col hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] hover:border-cyan-500/30 transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-xl">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white mb-1">
              {users.filter(u => u.totalResumesAnalyzed > 0).length > 0 
                ? Math.round(users.reduce((acc, u) => acc + (u.averageScore || 0), 0) / users.filter(u => u.totalResumesAnalyzed > 0).length) 
                : 0}
            </p>
            <h3 className="text-slate-400 font-medium">Platform Avg Score</h3>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-white">Registered Users</h2>
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-cyan-500/50 text-slate-200 transition-all"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">Loading user data...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/30 text-slate-400 text-sm border-b border-white/5">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Joined</th>
                  <th className="p-4 font-medium">Last Login</th>
                  <th className="p-4 font-medium">Analyses</th>
                  <th className="p-4 font-medium">Score</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredUsers.map((user, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    key={user.id} 
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(176,38,255,0.2)]' 
                          : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-4 font-medium text-cyan-400/80">
                      {user.totalResumesAnalyzed}
                    </td>
                    <td className="p-4">
                      {user.totalResumesAnalyzed > 0 && user.averageScore ? (
                        <div className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-bold shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] ${
                          user.averageScore >= 80 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                          user.averageScore >= 60 ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' :
                          'text-red-400 bg-red-500/10 border border-red-500/20'
                        }`}>
                          {Math.round(user.averageScore)}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.email !== currentUserEmail && (
                          <>
                            <button 
                              onClick={() => handleToggleRole(user)}
                              disabled={actionLoadingId === user.id}
                              title={user.role === 'ADMIN' ? "Revoke Admin" : "Make Admin"}
                              className={`p-2 rounded-lg transition-all ${
                                user.role === 'ADMIN' 
                                  ? 'hover:bg-amber-500/20 text-amber-500 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                                  : 'hover:bg-purple-500/20 text-purple-400 hover:shadow-[0_0_10px_rgba(176,38,255,0.2)]'
                              } disabled:opacity-50`}
                            >
                              {user.role === 'ADMIN' ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={actionLoadingId === user.id}
                              title="Delete User"
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] disabled:opacity-50"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {user.email === currentUserEmail && (
                          <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-800 rounded-md">You</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
