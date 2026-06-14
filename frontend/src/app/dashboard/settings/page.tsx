"use client";
import { User, Lock, Bell, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ firstName: profile.firstName, lastName: profile.lastName })
      });

      if (res.ok) {
        setSaveMessage("Profile updated successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveError("Failed to update profile.");
      }
    } catch (err) {
      setSaveError("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setPwdMessage("");
    setPwdError("");
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters.");
      return;
    }

    setPwdLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (res.ok) {
        setPwdMessage("Password updated successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => {
          setPwdMessage("");
          setIsChangingPassword(false);
        }, 3000);
      } else {
        const text = await res.text();
        setPwdError(text || "Failed to update password.");
      }
    } catch (err) {
      setPwdError("An error occurred.");
    } finally {
      setPwdLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your account preferences and profile.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <User className="text-blue-400 w-5 h-5" />
            <h2 className="text-xl font-bold text-slate-100">Profile Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">First Name</label>
                <input 
                  type="text" 
                  value={profile.firstName}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Last Name</label>
                <input 
                  type="text" 
                  value={profile.lastName}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Email Address (Read-only)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                <input 
                  type="email" 
                  disabled
                  value={profile.email}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 focus:outline-none opacity-70 cursor-not-allowed"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleProfileUpdate}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
              {saveMessage && <span className="flex items-center gap-1 text-sm text-green-400"><CheckCircle className="w-4 h-4"/> {saveMessage}</span>}
              {saveError && <span className="flex items-center gap-1 text-sm text-red-400"><AlertCircle className="w-4 h-4"/> {saveError}</span>}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <Lock className="text-emerald-400 w-5 h-5" />
            <h2 className="text-xl font-bold text-slate-100">Security</h2>
          </div>
          
          {!isChangingPassword ? (
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-slate-200 font-medium">Change Password</p>
                <p className="text-sm text-slate-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
              </div>
              <button 
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Update
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Update Password</h3>
              <div className="space-y-4 max-w-md">
                <input 
                  type="password" 
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="password" 
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="password" 
                  placeholder="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button 
                  onClick={handlePasswordUpdate}
                  disabled={pwdLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  {pwdLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Password
                </button>
                <button 
                  onClick={() => { setIsChangingPassword(false); setPwdError(""); }}
                  className="px-4 py-2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              {pwdMessage && <p className="flex items-center gap-1 text-sm text-green-400 mt-2"><CheckCircle className="w-4 h-4"/> {pwdMessage}</p>}
              {pwdError && <p className="flex items-center gap-1 text-sm text-red-400 mt-2"><AlertCircle className="w-4 h-4"/> {pwdError}</p>}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
