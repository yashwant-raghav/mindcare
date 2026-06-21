import { useState, useEffect } from "react";
import { User, MoodEntry, JournalEntry } from "./types";
import { Menu } from "lucide-react";
import LandingPage from "./components/LandingPage";
import Auth from "./components/Auth";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import MoodJourney from "./components/MoodJourney";
import MyJournal from "./components/MyJournal";
import SonicSanctuary from "./components/SonicSanctuary";
import MindfulMotion from "./components/MindfulMotion";
import AIAssessment from "./components/AIAssessment";
import Profile from "./components/Profile";

const PREPOPULATED_MOODS: MoodEntry[] = [
  {
    id: "m_1",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    value: 4,
    name: "Peaceful",
    note: "Enjoyed a brief sunset cup of chamomile tea after classes.",
    factors: ["Sleep Quality", "Nature / Weather"],
    timestamp: "06:15 PM",
    analysis: {
      stabilityIndex: 88,
      primaryStressors: ["None detected"],
      sentimentScore: "Positive Alignment",
      advice: "Taking tea breaks is a beautiful anchor pattern. Keep following these low-key rewards."
    }
  },
  {
    id: "m_2",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    value: 2,
    name: "Unsettled",
    note: "Worrying about upcoming projects presentation. Slept poorly.",
    factors: ["Work Stress", "Sleep Quality"],
    timestamp: "10:30 AM",
    analysis: {
      stabilityIndex: 45,
      primaryStressors: ["Work Stress", "Sleep deprivation"],
      sentimentScore: "Unresolved Anticipatory Distress",
      advice: "Try allocating 10 minutes to write down the worry points. Imagine folding and packing them away."
    }
  }
];

const PREPOPULATED_JOURNALS: JournalEntry[] = [
  {
    id: "j_1",
    date: "Jun 20, 2026",
    title: "Morning Gratitude Walks",
    content: "Woke up at 6:30. Walked around the garden and noticed some fresh dew on the leaves. The fresh air smelled faintly of cedar. Felt a deep, comforting sense of being presence to life, rather than running behind schedules.",
    moodValue: 5,
    timestamp: "07:15 AM",
    analysis: {
      emotionalTone: "Serene Mindfulness (Grateful)",
      underlyingThemes: ["Nature appreciation", "Pacing presence"],
      copingStrategies: [
        "Continue early morning walking routines.",
        "Take photos of minor environmental features to share.",
        "Document these moments of connection to anchor future stressful periods."
      ],
      psychologicalInsight: "Your reflection indicates a highly effective anchoring mechanism. Connecting with nature triggers positive delta activity in neural tracks."
    }
  }
];

export default function App() {
   const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"landing" | "login" | "signup">("landing");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Recover active credentials on mount
  useEffect(() => {
    const activeEmail = localStorage.getItem("activeUserEmail");
    if (activeEmail) {
      const savedUser = localStorage.getItem(`user_${activeEmail}`);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as User;
          setUser(parsed);
          setAuthMode("landing");
          
          // Seed database metrics specifically for this recovered user profile
          recoverUserDatabase(activeEmail);
        } catch {
          // ignore
        }
      }
    } else {
      // Seed fallback mock database for guest preview
      setMoodEntries(PREPOPULATED_MOODS);
      setJournalEntries(PREPOPULATED_JOURNALS);
    }
  }, []);

  const recoverUserDatabase = (email: string) => {
    const moodsKey = `moods_${email}`;
    const journalsKey = `journals_${email}`;

    const savedMoods = localStorage.getItem(moodsKey);
    const savedJournals = localStorage.getItem(journalsKey);

    if (savedMoods) {
      try { setMoodEntries(JSON.parse(savedMoods)); } catch { setMoodEntries(PREPOPULATED_MOODS); }
    } else {
      setMoodEntries(PREPOPULATED_MOODS);
      localStorage.setItem(moodsKey, JSON.stringify(PREPOPULATED_MOODS));
    }

    if (savedJournals) {
      try { setJournalEntries(JSON.parse(savedJournals)); } catch { setJournalEntries(PREPOPULATED_JOURNALS); }
    } else {
      setJournalEntries(PREPOPULATED_JOURNALS);
      localStorage.setItem(journalsKey, JSON.stringify(PREPOPULATED_JOURNALS));
    }
  };

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setAuthMode("landing");
    recoverUserDatabase(loggedInUser.email);
  };

  const handleLogout = () => {
    localStorage.removeItem("activeUserEmail");
    setUser(null);
    setAuthMode("landing");
    setActiveTab("dashboard");
  };

  // Add general mood log entry
  const handleAddNewMoodEntry = (moodVal: number) => {
    if (!user) return;
    
    const newEntry: MoodEntry = {
      id: `mood_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      value: moodVal,
      name: moodVal === 5 ? "Radiant" : moodVal === 4 ? "Peaceful" : moodVal === 3 ? "Balanced" : moodVal === 2 ? "Unsettled" : "Overwhelmed",
      note: "Quick check-in directly logged in primary Serene Dashboard.",
      factors: ["General vibe"],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      analysis: {
        stabilityIndex: moodVal * 19,
        primaryStressors: ["Environmental fatigue"],
        sentimentScore: "Positive state",
        advice: "Consistency in tracking your daily vibe builds deep cognitive resilience. Excellent start."
      }
    };

    const updated = [newEntry, ...moodEntries];
    setMoodEntries(updated);
    localStorage.setItem(`moods_${user.email}`, JSON.stringify(updated));

    // Update user stats
    const updatedUser: User = {
      ...user,
      streak: user.streak + 1,
      totalMinutes: user.totalMinutes + 5
    };
    setUser(updatedUser);
    localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser));
  };

  const handleAddNewMoodExtended = (extendedEntry: MoodEntry) => {
    if (!user) return;
    const updated = [extendedEntry, ...moodEntries];
    setMoodEntries(updated);
    localStorage.setItem(`moods_${user.email}`, JSON.stringify(updated));

    // Update user stats
    const updatedUser: User = {
      ...user,
      totalMinutes: user.totalMinutes + 10,
      streak: user.streak + 1
    };
    setUser(updatedUser);
    localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser));
  };

  // Add Journal Entry
  const handleAddNewJournalEntry = (newJournal: JournalEntry) => {
    if (!user) return;
    const updated = [newJournal, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem(`journals_${user.email}`, JSON.stringify(updated));

    // Grant 15 min for writing a CBT journal
    const updatedUser: User = {
      ...user,
      totalMinutes: user.totalMinutes + 15
    };
    setUser(updatedUser);
    localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser));
  };

  const handleDeleteJournalEntry = (id: string) => {
    if (!user) return;
    const updated = journalEntries.filter((e) => e.id !== id);
    setJournalEntries(updated);
    localStorage.setItem(`journals_${user.email}`, JSON.stringify(updated));
  };

  // Update meditation minute counts
  const handleUpdateMindfulMinutes = (mins: number) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      totalMinutes: user.totalMinutes + mins
    };
    setUser(updatedUser);
    localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser));
  };

  // Hard wipe database
  const handleHardResetDatabase = () => {
    if (!user) return;
    localStorage.removeItem(`moods_${user.email}`);
    localStorage.removeItem(`journals_${user.email}`);
    
    setMoodEntries([]);
    setJournalEntries([]);

    const updatedUser: User = {
      ...user,
      streak: 1,
      totalMinutes: 0
    };
    setUser(updatedUser);
    localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser));
    alert("MindCare Local Database completely purged.");
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(`user_${updatedUser.email}`, JSON.stringify(updatedUser));
  };

  // Main Router View selector
  const renderActiveMainContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            user={user} 
            moodEntries={moodEntries} 
            onAddMood={handleAddNewMoodEntry} 
            setActiveTab={setActiveTab}
          />
        );
      case "mood":
        return (
          <MoodJourney 
            user={user} 
            moodEntries={moodEntries} 
            onAddMoodExtended={handleAddNewMoodExtended}
          />
        );
      case "journal":
        return (
          <MyJournal 
            user={user} 
            journalEntries={journalEntries} 
            onAddJournalEntry={handleAddNewJournalEntry}
            onDeleteJournalEntry={handleDeleteJournalEntry}
          />
        );
      case "music":
        return (
          <SonicSanctuary 
            user={user} 
            onUpdateStudyMinutes={handleUpdateMindfulMinutes}
          />
        );
      case "exercises":
        return (
          <MindfulMotion 
            user={user} 
            onUpdateMeditationMinutes={handleUpdateMindfulMinutes}
          />
        );
      case "chat":
        return <AIAssessment user={user} />;
      case "profile":
        return (
          <Profile 
            user={user} 
            moodEntries={moodEntries} 
            journalEntries={journalEntries} 
            onResetProgress={handleHardResetDatabase}
            onUpdateUser={handleUpdateUser}
          />
        );
      default:
        return (
          <Dashboard 
            user={user} 
            moodEntries={moodEntries} 
            onAddMood={handleAddNewMoodEntry} 
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  // 1. Landing Page state routing
  if (!user && authMode === "landing") {
    return (
      <LandingPage 
        onStart={() => setAuthMode("signup")} 
        onNavigateLogin={() => setAuthMode("login")} 
      />
    );
  }

  // 2. Auth flow
  if (!user && (authMode === "login" || authMode === "signup")) {
    return (
      <Auth 
        onSuccess={handleAuthSuccess} 
        onBackToLanding={() => setAuthMode("landing")} 
        initialMode={authMode === "login" ? "login" : "signup"}
      />
    );
  }

   // 3. Authenticated dashboard layout with permanent side rails
  const activeTabLabels: Record<string, string> = {
    dashboard: "Dashboard",
    mood: "Mood Journey",
    journal: "My Journal",
    music: "Sonic Sanctuary",
    exercises: "Mindful Motion",
    chat: "AI CBT Companion",
    profile: "Profile"
  };
  const activeTabLabel = activeTabLabels[activeTab] || "MindCare";

  return (
    <div className="flex flex-col lg:flex-row bg-[#F8F9FA] min-h-screen text-gray-950 selection:bg-blue-100 selection:text-blue-900 font-sans" id="app-workbench-layout">
      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40" id="mobile-header">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
            id="btn-mobile-menu"
            title="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-wider block">MindCare</span>
            <h1 className="text-xs font-bold text-gray-900 tracking-tight leading-none mt-0.5">{activeTabLabel}</h1>
          </div>
        </div>
        
        {/* Right action user avatar shortcut */}
        <button 
          onClick={() => setActiveTab("profile")}
          className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 cursor-pointer"
          title="Go to Profile"
        >
          <img 
            src={user?.avatar} 
            alt={user?.name} 
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";
            }}
            className="w-full h-full object-cover"
          />
        </button>
      </header>

      {/* Sidebar Backdrop Overlay on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-45 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Rail */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false); // Close mobile drawer on tab click
        }} 
        user={user} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Screen Content Viewport */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-57px)] lg:h-screen relative" id="app-main-viewport">
        {renderActiveMainContent()}
      </main>
    </div>
  );
}
