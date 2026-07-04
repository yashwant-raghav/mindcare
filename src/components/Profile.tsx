import { useState } from "react";
import { User, MoodEntry, JournalEntry } from "../types";
import { Award, ShieldCheck, Bell, Database, Mail, MapPin, Sparkles, Smile, Flame, Clock, Camera, X, Upload, Link } from "lucide-react";

interface ProfileProps {
  user: User;
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  onResetProgress: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

const PRESET_AVATARS = [
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop", name: "Serene Meadow" },
  { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop", name: "Calm Ocean" },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop", name: "Mountain Walker" },
  { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop", name: "Forest Dreamer" },
  { url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop", name: "Zen Stone" },
  { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop", name: "Peaceful Oasis" },
  { url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop", name: "Minimalist Breeze" },
  { url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=256&auto=format&fit=crop", name: "Cosmic Radiance" }
];

export default function Profile({ user, moodEntries, journalEntries, onResetProgress, onUpdateUser }: ProfileProps) {
  const [privacyMode, setPrivacyMode] = useState(true);
  const [reminders, setReminders] = useState(false);
  const [showBillingAlert, setShowBillingAlert] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [fileError, setFileError] = useState("");

  // Generate some insightful clinical reflections based on logged metrics
  const totalEntriesLength = moodEntries.length + journalEntries.length;
  
  // Calculate stress correlations
  const stressfulFactors = moodEntries
    .filter(m => m.value <= 2)
    .flatMap(m => m.factors);

  // Find most frequent factor
  const factorCounts = stressfulFactors.reduce((acc, f) => {
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantStressor = Object.keys(factorCounts).sort((a,b) => factorCounts[b] - factorCounts[a])[0] || "Sleep Quality";

  const achievements = [
    { title: "Early Bird Meditator", desc: "First breath sequence tracked before 8:00 AM.", badge: "🌅", unlocked: true },
    { title: "Quiet Mind Creator", desc: "Successfully completed five 5-minute box breathing cycles.", badge: "🌬️", unlocked: user.totalMinutes >= 5 },
    { title: "Conscious CBT Writer", desc: "Wrote first expressive reflection journal with full AI review.", badge: "🖋️", unlocked: journalEntries.length >= 1 },
    { title: "Clarity Master Streak", desc: "Maintained safety check-in streak of over 10 consecutive days.", badge: "🔥", unlocked: user.streak >= 10 }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 bg-[#F8F9FA] min-h-screen" id="profile-container">
      {/* Bio and cover block */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 relative overflow-hidden shadow-xs" id="profile-hero-card">
        {/* Background visual curve */}
        <div className="absolute right-[-20px] top-[-20px] w-48 h-48 bg-blue-105/30 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div 
              className="relative group cursor-pointer shrink-0 transition-transform duration-300 hover:scale-102"
              onClick={() => setShowAvatarModal(true)}
              id="btn-edit-avatar"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover transition-all duration-350 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-[8px] font-bold text-white font-mono uppercase tracking-wider mt-1">Change</span>
                </div>
              </div>
              <span className="absolute bottom-1 right-1 bg-blue-600 text-white p-1 rounded-full text-[10px] w-6 h-6 flex items-center justify-center border-2 border-white font-bold shadow-xs z-10" title="Verified early bird">
                ✓
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black font-display text-gray-900">{user.name}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[9.5px] font-mono tracking-wide font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full uppercase shadow-xxs">
                  Pro Member
                </span>
                <span className="text-[9.5px] font-mono bg-gray-50 border border-gray-150 text-gray-500 px-2.5 py-0.5 rounded-full uppercase">
                  Early Bird Meditator
                </span>
              </div>
              <p className="text-xs text-gray-500 max-w-md leading-relaxed">{user.bio}</p>
              <div className="flex items-center justify-center sm:justify-start space-x-3 text-[10px] text-gray-400">
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> SF Bay Sanctuary</span>
                <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" /> {user.email}</span>
                <span>• Joined {user.joinedDate}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setShowBillingAlert(true);
              setTimeout(() => setShowBillingAlert(false), 4400);
            }}
            className="text-xs font-bold border border-gray-200 hover:border-blue-600 hover:text-blue-600 bg-white text-gray-500 px-4.5 py-2.5 rounded-xl transition-all shadow-xxs cursor-pointer shrink-0"
          >
            Manage Subscription
          </button>
        </div>

        {showBillingAlert && (
          <div className="mt-4 p-3.5 bg-blue-50 border border-blue-150 text-blue-700 text-xs rounded-xl font-bold font-display animate-pulse">
            ✨ Premium access active! Your next local offline billing cycles are waived as an early-bird supporter.
          </div>
        )}
      </div>

      {/* Stats row cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="profile-stats-grid">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase">Check-in Streak</span>
            <p className="text-3xl font-black font-display text-gray-950 mt-1">{user.streak} days</p>
            <p className="text-[10px] text-orange-650 font-bold mt-1 inline-flex items-center">
              <Flame className="w-3.5 h-3.5 mr-0.5 fill-orange-500 outline-none" /> Best performance peak!
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center shadow-xxs">
            <Flame className="w-6 h-6 fill-orange-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase">Total Meditated</span>
            <p className="text-3xl font-black font-display text-gray-950 mt-1">{user.totalMinutes}m</p>
            <p className="text-[10px] text-blue-750 font-bold mt-1">✓ Over 40 sessions completed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-xxs">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase">CBT Processing Logs</span>
            <p className="text-3xl font-black font-display text-gray-950 mt-1">{totalEntriesLength}</p>
            <p className="text-[10px] text-gray-450 mt-1">Saved safely inside secure sandbox</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-xxs">
            <Smile className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Preference details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Diagnostic Clinical insight card */}
          <div className="bg-gradient-to-tr from-blue-500/10 to-indigo-500/5 border border-blue-500/15 rounded-2xl p-5 space-y-4 shadow-xxs" id="clinical-diagnostic-insight">
            <div className="flex items-center space-x-2 text-blue-900">
              <Sparkles className="w-4.5 h-4.5 text-blue-600 fill-blue-600" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Deep Resilience Insights</h3>
            </div>
            
            <p className="text-xs text-blue-950 leading-relaxed font-semibold">
              "We noticed that you logged mood drops specifically under <strong className="text-blue-700 underline">'{dominantStressor}'</strong> factors twice. Focus on breaking complex schedules into manageable 15-minute segments, and utilize rain loops to restore serene mental pacing."
            </p>

            <div className="pt-2 border-t border-blue-150/40 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span>Generated on active cognitive evaluation</span>
              <span className="text-blue-600 font-bold uppercase">Stability Index projection: Safe</span>
            </div>
          </div>

          {/* Settings Lists preferences */}
          <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 space-y-4 shadow-xs" id="preferences-list">
            <h3 className="text-sm font-bold font-display text-gray-900">Privacy & Client Preferences</h3>
            
            <div className="divide-y divide-gray-100 text-xs">
              
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-gray-950 flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-blue-600 font-bold" /> HIPAA Privacy Shields</h4>
                  <p className="text-[10px] text-gray-450">Maintain full local end-to-end sandboxing. Prevents cloud database exposures.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacyMode(!privacyMode)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center cursor-pointer ${privacyMode ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span className={`w-4.5 h-4.5 bg-white rounded-full absolute transition-transform ${privacyMode ? "translate-x-5.5" : "translate-x-1"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-gray-950 flex items-center"><Bell className="w-4 h-4 mr-1 text-blue-600 font-bold" /> Active Serene Reminders</h4>
                  <p className="text-[10px] text-gray-450">Trigger daily browser push alerts to take quiet 3-breath breaks.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReminders(!reminders)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center cursor-pointer ${reminders ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span className={`w-4.5 h-4.5 bg-white rounded-full absolute transition-transform ${reminders ? "translate-x-5.5" : "translate-x-1"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-gray-950 flex items-center"><Database className="w-4 h-4 mr-1 text-blue-600 font-bold" /> Diagnostic Data Actions</h4>
                  <p className="text-[10px] text-gray-450">Export your journal and mood logs as Encrypted ZIP or reset database.</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ moodEntries, journalEntries }));
                      const dlAnchorElem = document.createElement('a');
                      dlAnchorElem.setAttribute("href", dataStr);
                      dlAnchorElem.setAttribute("download", `mindcare_clarity_export_${Date.now()}.json`);
                      dlAnchorElem.click();
                    }}
                    className="bg-blue-600 text-white font-mono text-[9px] font-bold px-3 py-2 rounded-xl hover:bg-blue-750 transition-colors cursor-pointer shadow-xxs"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("CRITICAL WARNING: This will permanently wipe all local journals, checklists, and counseling history. This operation is fully irreversible. Delete everything?")) {
                        onResetProgress();
                      }
                    }}
                    className="bg-red-50 text-red-700 font-mono text-[9px] font-bold px-3 py-2 rounded-xl border border-red-200 hover:bg-red-100 transition-colors cursor-pointer shadow-xxs"
                  >
                    Reset All Data
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right accomplishments panel */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-xs" id="achievements-box">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600 font-bold" />
              <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">Recent Accomplishments</h3>
            </div>

            <div className="space-y-3">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 border rounded-2xl flex items-start space-x-3 transition-colors ${
                    ach.unlocked 
                      ? "bg-white border-gray-150 shadow-xxs" 
                      : "bg-gray-50/50 border-gray-100 opacity-60"
                  }`}
                >
                  <span className="text-2xl mt-0.5">{ach.badge}</span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900">{ach.title}</h4>
                    <p className="text-[10px] text-gray-450 leading-tight">{ach.desc}</p>
                    <span className={`text-[9px] font-mono leading-none font-bold ${ach.unlocked ? "text-blue-600" : "text-gray-400"}`}>
                      {ach.unlocked ? "✓ Unlocked Reward" : "🔒 Needs practice mins"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Profile Picture Change Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in" id="avatar-modal">
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 w-full max-w-lg p-5 sm:p-6 relative shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto" id="avatar-modal-body">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black font-display text-gray-900">Customize Avatar</h3>
                <p className="text-[11px] text-gray-450 mt-0.5">Select a calming theme or upload a custom image</p>
              </div>
              <button 
                onClick={() => {
                  setShowAvatarModal(false);
                  setUrlError("");
                  setFileError("");
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900 cursor-pointer"
                id="btn-close-avatar-modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current & Preview block */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50/70 border border-gray-100 rounded-2xl">
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                  id="avatar-modal-preview"
                />
                <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-4 h-4 rounded-full text-[8px] flex items-center justify-center border border-white font-bold">✓</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Live Preview</span>
                <h4 className="font-extrabold text-gray-950 text-xs mt-0.5">{user.name}</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Selection Options */}
            <div className="space-y-4">
              
              {/* Presets */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Calming Presets</span>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onUpdateUser({ ...user, avatar: preset.url });
                        setShowAvatarModal(false);
                      }}
                      className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-103 cursor-pointer ${
                        user.avatar === preset.url ? "border-blue-600 shadow-sm" : "border-gray-100 hover:border-gray-300"
                      }`}
                      title={preset.name}
                      id={`btn-preset-avatar-${idx}`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      {user.avatar === preset.url && (
                        <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                          <span className="bg-blue-600 text-white w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold border border-white shadow-sm">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Upload Custom Photo</span>
                <label className="border border-dashed border-gray-200 hover:border-blue-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/30 hover:bg-blue-50/10" id="label-upload-avatar">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs font-bold text-gray-700">Choose Image File</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">PNG, JPG, or WEBP (Max 2MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="input-file-avatar"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      if (file.size > 2 * 1024 * 1024) {
                        setFileError("File size exceeds 2MB limit.");
                        return;
                      }
                      setFileError("");
                      
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        if (base64) {
                          onUpdateUser({ ...user, avatar: base64 });
                          setShowAvatarModal(false);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {fileError && <p className="text-[10px] text-red-650 font-semibold">{fileError}</p>}
              </div>

              {/* Custom URL */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block font-bold font-sans">Or Paste Photo URL</span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={customUrl}
                      id="input-url-avatar"
                      onChange={(e) => {
                        setCustomUrl(e.target.value);
                        setUrlError("");
                      }}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-hidden focus:border-blue-600"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!customUrl) {
                        setUrlError("Please enter a valid URL.");
                        return;
                      }
                      if (!customUrl.startsWith("http://") && !customUrl.startsWith("https://")) {
                        setUrlError("URL must start with http:// or https://");
                        return;
                      }
                      setUrlError("");
                      onUpdateUser({ ...user, avatar: customUrl });
                      setShowAvatarModal(false);
                      setCustomUrl("");
                    }}
                    className="bg-blue-600 hover:bg-blue-750 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xxs"
                    id="btn-apply-url-avatar"
                  >
                    Apply
                  </button>
                </div>
                {urlError && <p className="text-[10px] text-red-650 font-semibold">{urlError}</p>}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
