import React, { useState } from "react";
import { Compass, ShieldCheck, KeyRound, Mail, User as UserIcon } from "lucide-react";
import { User } from "../types";

interface AuthProps {
  onSuccess: (user: User) => void;
  onBackToLanding: () => void;
  initialMode: "login" | "signup";
}

export default function Auth({ onSuccess, onBackToLanding, initialMode }: AuthProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill out all required fields.");
      return;
    }
    if (!isLogin && !fullName) {
      setError("Please enter your full name.");
      return;
    }

    if (isLogin) {
      // Handle mock login
      const cleanedEmail = email.trim().toLowerCase();
      const savedUser = localStorage.getItem(`user_${cleanedEmail}`);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as User;
          onSuccess(parsed);
          return;
        } catch {
          // ignore
        }
      }
      
      // Fallback/Demo default user for test purposes if no user was saved yet
      const demoUser: User = {
        email: cleanedEmail,
        name: cleanedEmail === "alex@mindcare.org" ? "Alex Henderson" : cleanedEmail.split("@")[0].replace(/^\w/, c => c.toUpperCase()),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
        bio: "Early bird meditator. Believer in peaceful daily check-ins.",
        streak: 14,
        totalMinutes: 1240,
        joinedDate: "June 2026",
        isPro: true
      };
      
      // Save it
      localStorage.setItem(`user_${cleanedEmail}`, JSON.stringify(demoUser));
      localStorage.setItem("activeUserEmail", cleanedEmail);
      onSuccess(demoUser);
    } else {
      // Handle mock Signup
      const cleanedEmail = email.trim().toLowerCase();
      const newUser: User = {
        email: cleanedEmail,
        name: fullName,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
        bio: "Mindfulness and slow walks enthusiast.",
        streak: 1,
        totalMinutes: 0,
        joinedDate: "June 2026",
        isPro: false
      };
      // Save user
      localStorage.setItem(`user_${cleanedEmail}`, JSON.stringify(newUser));
      localStorage.setItem("activeUserEmail", cleanedEmail);
      onSuccess(newUser);
    }
  };

  const handleAppleGoogleMock = () => {
    // Standard quick developer bypass/auth
    const demoUser: User = {
      email: "alex@mindcare.org",
      name: "Alex Henderson",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
      bio: "Pro Member. Committed to mindful self-expansion.",
      streak: 14,
      totalMinutes: 1240,
      joinedDate: "June 2026",
      isPro: true
    };
    localStorage.setItem(`user_${demoUser.email}`, JSON.stringify(demoUser));
    localStorage.setItem("activeUserEmail", demoUser.email);
    onSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2F3330] font-sans flex flex-col justify-between p-6">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center py-2">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onBackToLanding}>
          <div className="w-9 h-9 rounded-xl bg-[#2E5E3D] flex items-center justify-center text-[#FAF8F5]">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold font-display tracking-tight text-[#1E221F]">MindCare</span>
        </div>
        <button 
          onClick={onBackToLanding}
          className="text-xs font-mono text-[#5F635F] hover:text-[#1E221F] hover:underline"
        >
          ← Back to safety
        </button>
      </header>

      {/* Auth Card Layout */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl font-bold font-display text-[#1E221F] tracking-tight">
            {isLogin ? "Welcome back to your space of serenity" : "Step into your sanctuary of serene clarity"}
          </h2>
          <p className="text-xs text-[#7F837E]">
            {isLogin ? "We are glad you are taking a quiet moment to check-in." : "Create your private account to start tracking deep reflection metrics."}
          </p>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E3DFD3] rounded-3xl p-8 shadow-sm space-y-6" id="auth-box">
          <div className="text-center">
            <h3 className="text-lg font-bold font-display text-[#1E221F]">
              {isLogin ? "Sign In" : "Create Account"}
            </h3>
            <p className="text-[11px] text-[#959994] mt-0.5">Secure cognitive-behavioral space</p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl" id="auth-err">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5F635F] tracking-wide block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A9A4]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    required={!isLogin}
                    className="w-full bg-white border border-[#E3DFD3] rounded-xl pl-11 pr-4 py-3 text-xs outline-hidden focus:border-[#2E5E3D] selection:bg-[#E3EFE5]"
                    id="input-fullname"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5F635F] tracking-wide block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A9A4]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mindcare.org"
                  required
                  className="w-full bg-white border border-[#E3DFD3] rounded-xl pl-11 pr-4 py-3 text-xs outline-hidden focus:border-[#2E5E3D] selection:bg-[#E3EFE5]"
                  id="input-email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#5F635F] tracking-wide">Password</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => alert("To safeguard your identity offline, passwords can be self-reset by simply signing up again stream with a fresh credential profile.")}
                    className="text-[10px] text-[#2E5E3D] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A9A4]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-[#E3DFD3] rounded-xl pl-11 pr-4 py-3 text-xs outline-hidden focus:border-[#2E5E3D]"
                  id="input-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2E5E3D] hover:bg-[#20432B] text-white py-3.5 px-4 rounded-xl text-xs font-bold transition-all mt-2 cursor-pointer shadow-xs"
              id="btn-auth-submit"
            >
              {isLogin ? "Sign In" : "Begin Journey"}
            </button>
          </form>

          {/* Social Sign In Block */}
          <div className="space-y-3 pt-2">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#DFDACF]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono text-[#959994] uppercase tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-[#DFDACF]"></div>
            </div>

            <div className="grid grid-cols-2 gap-3" id="oauth-methods">
              <button
                type="button"
                onClick={handleAppleGoogleMock}
                className="flex items-center justify-center space-x-2 border border-[#E3DFD3] bg-white text-[#2F3330] rounded-xl py-2.5 hover:bg-[#FAF8F5] transition-colors text-xs font-medium cursor-pointer"
                id="btn-auth-google"
              >
                {/* Simulated Google Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.138 4.114-3.479 0-6.3-2.82-6.3-6.3s2.82-6.3 6.3-6.3c1.516 0 2.915.541 4.024 1.437l3.14-3.14C19.141 2.222 15.86 1 12.24 1A11.24 11.24 0 001 12.24a11.24 11.24 0 0011.24 11.24c6.182 0 11.24-5.058 11.24-11.24 0-.756-.076-1.49-.22-2.2H12.24z"/></svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleAppleGoogleMock}
                className="flex items-center justify-center space-x-2 border border-[#E3DFD3] bg-white text-[#2F3330] rounded-xl py-2.5 hover:bg-[#FAF8F5] transition-colors text-xs font-medium cursor-pointer"
                id="btn-auth-apple"
              >
                {/* Simulated Apple Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.92.99-3.04-1 .04-2.2.67-2.92 1.5-.63.73-1.18 1.87-1.03 2.97 1.12.09 2.25-.56 2.96-1.43z"/></svg>
                <span>Apple</span>
              </button>
            </div>
          </div>

          {/* Toggle Type */}
          <div className="text-center pt-2">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-[#5F635F] hover:text-[#2E5E3D] hover:underline cursor-pointer"
              id="btn-auth-toggle"
            >
              {isLogin ? "Don't have an account? Create Account" : "Already part of the community? Log in here"}
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Footer */}
      <footer className="w-full text-center py-4 border-t border-[#DFDACF] max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-[10px] text-[#959994] flex items-center space-x-1 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3B7F52] inline mr-1" />
          <span>Compliant and End-to-End Encrypted. Content stored locally.</span>
        </p>
        <p className="text-[10px] text-[#959994]">MindCare Privacy Shield • 2026</p>
      </footer>
    </div>
  );
}
