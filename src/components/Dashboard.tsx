import { useState, useEffect } from "react";
import { 
  Smile, CloudRain, Sun, Calendar, Plus, 
  ArrowRight, Sparkles, BookOpen, Music, Activity, 
  HeartHandshake, Compass
} from "lucide-react";
import { User, MoodEntry, Quote } from "../types";

interface DashboardProps {
  user: User;
  moodEntries: MoodEntry[];
  onAddMood: (moodValue: number) => void;
  setActiveTab: (tab: string) => void;
}

const INSIGHTS_QUOTES: Quote[] = [
  { text: "Deep breaths are like little love notes to your body.", author: "Anonymous" },
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "Sometimes the most important thing in a whole day is the rest we take between two deep breaths.", author: "Etty Hillesum" },
  { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
];

export default function Dashboard({ user, moodEntries, onAddMood, setActiveTab }: DashboardProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [selectedQuickMood, setSelectedQuickMood] = useState<number | null>(null);

  useEffect(() => {
    // Generate static but rotating quote index based on the day of the month
    const day = new Date().getDate();
    setQuoteIndex(day % INSIGHTS_QUOTES.length);
  }, []);

  const currentQuote = INSIGHTS_QUOTES[quoteIndex];

  // Get date summary
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const moodLevels = [
    { value: 1, label: "Overwhelmed", emoji: "⛈️", color: "bg-red-50 hover:bg-red-100 border-red-200 text-red-800" },
    { value: 2, label: "Unsettled", emoji: "🍃", color: "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800" },
    { value: 3, label: "Balanced", emoji: "⚖️", color: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800" },
    { value: 4, label: "Peaceful", emoji: "🌸", color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800" },
    { value: 5, label: "Radiant", emoji: "✨", color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-800" },
  ];

  const lastMood = moodEntries[0];

  // Calculate weekly charts data mock
  // Let's draw heights for Mon-Sun bars. They should represent active check-ins, mindfulness activities
  const weeklyActivities = [
    { day: "Mon", journal: 20, breath: 15, sound: 30 },
    { day: "Tue", journal: 0, breath: 10, sound: 45 },
    { day: "Wed", journal: 30, breath: 5, sound: 20 },
    { day: "Thu", journal: 15, breath: 20, sound: 30 },
    { day: "Fri", journal: 10, breath: 15, sound: 50 },
    { day: "Sat", journal: 40, breath: 30, sound: 15 },
    { day: "Sun", journal: 25, breath: 25, sound: 40 },
  ];

  const maxTotalUnit = 90; // for chart normalization

  const handleQuickCheckin = (val: number) => {
    setSelectedQuickMood(val);
    onAddMood(val);
    setTimeout(() => {
      setSelectedQuickMood(null);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-[#F8F9FA] min-h-screen" id="dashboard-container">
      {/* Welcome Block as a Bento Card */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-xs gap-6 relative overflow-hidden" id="dashboard-welcome">
        <div className="relative z-10">
          <span className="text-xs font-mono font-bold text-blue-600 tracking-wider uppercase">{formattedDate}</span>
          <h2 className="text-3xl font-extrabold text-gray-900 font-display mt-2">
            Good morning, {user.name}.
          </h2>
          <p className="text-sm text-gray-500 mt-2 pr-6 max-w-2xl leading-relaxed">
            How are you feeling today? Taking a gentle moment to check in with your emotional catalysts is a wonderful start to your self-care journey.
          </p>
        </div>

        {/* Small weather module Bento Styled */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center space-x-3 text-xs font-semibold text-blue-700 relative z-10 self-stretch md:self-auto justify-center">
          <Sun className="w-5 h-5 text-amber-600 animate-spin-slow" />
          <div>
            <p className="font-bold">Sunny 72°F</p>
            <p className="text-[10px] text-blue-500">Perfect weather for a quiet mindful walk</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Bento box */}
      <div className="grid lg:grid-cols-3 gap-6" id="dashboard-grid">
        
        {/* Left main columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Daily Mood Widget */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 space-y-5 shadow-xs" id="dw-mood-logger">
            <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">Quick Check-in</h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h4 className="text-base font-bold text-gray-900 font-display">How is your energy right now?</h4>
              {lastMood && (
                <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-mono font-semibold">
                  Last check-in: {moodLevels.find(m => m.value === lastMood.value)?.label} {moodLevels.find(m => m.value === lastMood.value)?.emoji}
                </span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2.5 pt-1">
              {moodLevels.map((ml) => {
                const isSavedThisTick = selectedQuickMood === ml.value;
                return (
                  <button
                    key={ml.value}
                    onClick={() => handleQuickCheckin(ml.value)}
                    disabled={selectedQuickMood !== null}
                    className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all ${ml.color} ${
                      isSavedThisTick ? "ring-2 ring-offset-2 ring-blue-600 scale-95" : "border-gray-100"
                    }`}
                    id={`quick-check-${ml.value}`}
                  >
                    <span className="text-2xl mb-1">{ml.emoji}</span>
                    <span className="text-[10px] font-semibold text-center hidden sm:block">{ml.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedQuickMood && (
              <p className="text-xs text-center text-blue-600 font-mono animate-pulse">
                ✨ Quick check-in saved dynamically! Journey updated.
              </p>
            )}
          </div>

          {/* 2. SVG Analytics Bar Chart */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 space-y-5 shadow-xs" id="dw-chart">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">Weekly Progress</h3>
                <h4 className="text-base font-bold text-gray-900 mt-1 font-display">Mindfulness & Coherency</h4>
              </div>
              <div className="flex items-center space-x-4 text-[10px] font-mono text-gray-500">
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span>
                  <span>Journal</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500"></span>
                  <span>Coherent Breath</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-orange-400"></span>
                  <span>Sonic Sanctuary</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Bar Grid */}
            <div className="h-56 flex items-end justify-between px-2 pt-6 pb-2 relative" id="weekly-bars">
              {/* Stack background lines */}
              <div className="absolute inset-x-0 top-6 border-b border-dashed border-gray-100 text-[9px] font-mono text-gray-400 pt-0.5 pointer-events-none">60 min</div>
              <div className="absolute inset-x-0 top-24 border-b border-dashed border-gray-100 text-[9px] font-mono text-gray-400 pt-0.5 pointer-events-none">40 min</div>
              <div className="absolute inset-x-0 top-40 border-b border-dashed border-gray-100 text-[9px] font-mono text-gray-400 pt-0.5 pointer-events-none">20 min</div>

              {weeklyActivities.map((act) => {
                const journalHeight = (act.journal / maxTotalUnit) * 100;
                const breathHeight = (act.breath / maxTotalUnit) * 100;
                const soundHeight = (act.sound / maxTotalUnit) * 100;
                const totalMins = act.journal + act.breath + act.sound;

                return (
                  <div key={act.day} className="flex flex-col items-center flex-1 group relative z-10">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono z-50 text-center shadow-lg">
                      <p className="font-bold border-b border-gray-800 pb-1 mb-1">{act.day}</p>
                      <p>Journal: {act.journal}m</p>
                      <p>Breath: {act.breath}m</p>
                      <p>Sonic: {act.sound}m</p>
                      <p className="border-t border-gray-800 mt-1 pt-1 text-emerald-400 font-bold">Total: {totalMins}m</p>
                    </div>

                    {/* Stacked bar */}
                    <div className="w-8 hover:w-9 transition-all flex flex-col justify-end bg-gray-50 rounded-t-lg overflow-hidden h-40 border border-gray-100/60 shadow-xxs">
                      {/* Sonic */}
                      <div className="bg-orange-400" style={{ height: `${soundHeight}%` }} />
                      {/* Coherent Breath */}
                      <div className="bg-indigo-500" style={{ height: `${breathHeight}%` }} />
                      {/* Journal */}
                      <div className="bg-blue-600" style={{ height: `${journalHeight}%` }} />
                    </div>

                    <span className="text-[10px] font-bold text-gray-400 mt-3">{act.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>You completed <strong>3 mindfulness cycles</strong> this week! Excellent consistency.</span>
              </div>
              <button 
                onClick={() => setActiveTab("profile")}
                className="text-blue-600 hover:text-blue-700 hover:underline font-bold flex items-center self-end sm:self-auto"
              >
                <span>Full Diagnostics</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Bento column */}
        <div className="space-y-6">
          
          {/* Quote Card */}
          <div className="bg-indigo-600 text-white rounded-[2rem] p-8 flex flex-col justify-between aspect-square relative overflow-hidden shadow-xs" id="dw-quote">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <Compass className="w-40 h-40 text-white" />
            </div>

            <h3 className="text-xs font-mono font-bold tracking-wider text-indigo-200 uppercase">Mental Anchoring</h3>
            <div className="space-y-3 my-auto">
              <p className="text-lg font-serif italic text-white leading-relaxed">
                "{currentQuote.text}"
              </p>
              <p className="text-xs text-indigo-200">
                — {currentQuote.author}
              </p>
            </div>

            <div className="flex space-x-1.5 self-start">
              {INSIGHTS_QUOTES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuoteIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${quoteIndex === idx ? "w-5 bg-white" : "bg-indigo-400"}`}
                />
              ))}
            </div>
          </div>

          {/* Quick Access Actions Links */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 space-y-5 shadow-xs" id="dw-quicklinks">
            <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">Quick Journeys</h3>
            
            <div className="divide-y divide-gray-100">
              <button
                onClick={() => setActiveTab("journal")}
                className="w-full flex items-center justify-between py-4 hover:bg-gray-50 rounded-xl transition-all px-2 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Daily Reflection Journal</h4>
                    <p className="text-[10px] text-gray-400">CBT text processing endpoint active</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </button>

              <button
                onClick={() => setActiveTab("exercises")}
                className="w-full flex items-center justify-between py-4 hover:bg-gray-50 rounded-xl transition-all px-2 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Box Breathing Guide</h4>
                    <p className="text-[10px] text-gray-400">5 minutes to reset central pulse</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </button>

              <button
                onClick={() => setActiveTab("music")}
                className="w-full flex items-center justify-between py-4 hover:bg-gray-50 rounded-xl transition-all px-2 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Sonic Sanctuary Sounds</h4>
                    <p className="text-[10px] text-gray-400">Play Rain Forest & Lo-fi beat waves</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Floating triggers or SOS rapid rescue panel in footer style */}
      <div className="bg-orange-50/60 border border-orange-100 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xxs" id="dw-emergency">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 shrink-0">
            <HeartHandshake className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 font-display">Experiencing a mental distress spike?</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">Click now to trigger box breathing guidance, read soothing cards, or start a calm session instantly.</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("exercises")}
          className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          SOS: Rapid Relief
        </button>
      </div>
    </div>
  );
}
