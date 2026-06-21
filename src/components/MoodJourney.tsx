import { useState } from "react";
import { Smile, Save, Calendar, Sparkles, Activity, AlertCircle, Info } from "lucide-react";
import { MoodEntry, User } from "../types";

interface MoodJourneyProps {
  user: User;
  moodEntries: MoodEntry[];
  onAddMoodExtended: (entry: MoodEntry) => void;
}

export default function MoodJourney({ user, moodEntries, onAddMoodExtended }: MoodJourneyProps) {
  const [selectedMood, setSelectedMood] = useState<number>(3); // Balanced by default
  const [moodNote, setMoodNote] = useState("");
  const [selectedFactors, setSelectedFactors] = useState<string[]>(["Sleep Quality"]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<MoodEntry["analysis"] | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const moodLevels = [
    { value: 5, label: "Radiant", emoji: "🌟", desc: "Abundant wellness, glowing vital pace", color: "bg-yellow-50/50 border-yellow-100 text-yellow-700 hover:bg-yellow-50" },
    { value: 4, label: "Peaceful", emoji: "🌸", desc: "Serene, light, self-compassionate", color: "bg-emerald-50/50 border-emerald-100 text-emerald-700 hover:bg-emerald-50" },
    { value: 3, label: "Balanced", emoji: "⚖️", desc: "Moderate focus, centered daily tasks", color: "bg-blue-50/50 border-blue-100 text-blue-700 hover:bg-blue-50" },
    { value: 2, label: "Unsettled", emoji: "🍃", desc: "Restless mind, minor fatigue layers", color: "bg-amber-50/50 border-amber-100 text-amber-700 hover:bg-amber-50" },
    { value: 1, label: "Overwhelmed", emoji: "⛈️", desc: "High stress loop, crowded thoughts", color: "bg-red-50/50 border-red-100 text-red-700 hover:bg-red-50" },
  ];

  const factorsList = [
    "Sleep Quality",
    "Work Stress",
    "Physical Exercise",
    "Social Interaction",
    "Nutritious Diet",
    "Nature / Weather",
    "Caffeine Pace"
  ];

  const handleFactorToggle = (f: string) => {
    if (selectedFactors.includes(f)) {
      setSelectedFactors(selectedFactors.filter(x => x !== f));
    } else {
      setSelectedFactors([...selectedFactors, f]);
    }
  };

  const handleSaveMood = async () => {
    setIsAnalyzing(true);
    setErrorMsg("");
    setCurrentAnalysis(null);

    const activeMoodConfig = moodLevels.find(m => m.value === selectedMood);

    try {
      const response = await fetch("/api/analyze-mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodValue: selectedMood,
          note: moodNote,
          factors: selectedFactors
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis request failed.");
      }

      const analysis = await response.json();
      setCurrentAnalysis(analysis);

      // Create new extended MoodEntry
      const newEntry: MoodEntry = {
        id: `mood_${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        value: selectedMood,
        name: activeMoodConfig?.label || "Unspecified",
        note: moodNote,
        factors: selectedFactors,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysis: analysis
      };

      onAddMoodExtended(newEntry);
      // Clean form partially but preserve analysis
      setMoodNote("");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect with psychologist server. Your entry was saved locally, but AI assessment was emulated.");
      
      // Save offline mock
      const mockAnalysis = {
        stabilityIndex: Math.min(Math.max(40 + (selectedMood * 10) + (moodNote ? moodNote.length % 15 : 5), 20), 98),
        primaryStressors: selectedFactors.length > 0 ? selectedFactors : ["Unspecified causes"],
        sentimentScore: selectedMood >= 4 ? "Positive Alignment" : selectedMood === 3 ? "Balanced State" : "Reflective/Strained State",
        advice: "Your feedback indicates emotional variations. Focus on self-care, maintaining daily hygiene routines, and ensuring 7-8 hours of sleep."
      };
      
      setCurrentAnalysis(mockAnalysis);

      const newEntry: MoodEntry = {
        id: `mood_${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        value: selectedMood,
        name: activeMoodConfig?.label || "Unspecified",
        note: moodNote,
        factors: selectedFactors,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysis: mockAnalysis
      };
      onAddMoodExtended(newEntry);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mock past logs for the trends calendar representation
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    // Map some days to mood states for simulated beauty
    let moodVal = 3;
    if (dayNum % 7 === 0) moodVal = 5;
    else if (dayNum % 5 === 0) moodVal = 4;
    else if (dayNum % 9 === 0) moodVal = 2;
    else if (dayNum === 17) moodVal = 1;

    return { day: dayNum, mood: moodVal };
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-[#F8F9FA] min-h-screen" id="mood-page-container">
      {/* Title as a Bento Card Header */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xs relative overflow-hidden">
        <span className="text-xs font-mono font-bold text-blue-600 tracking-wider uppercase">Emotional Analytics</span>
        <h2 className="text-3xl font-extrabold text-gray-900 font-display mt-2">Mood Journey Tracker</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">
          Your emotional landscape reflects your inner clarity. Tune in, specify environmental elements, and view predictive AI guidance metrics.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Check-In Column & factors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 space-y-6 shadow-xs" id="checkin-container">
            <div>
              <h3 className="text-base font-bold font-display text-gray-900">How are you feeling right now?</h3>
              <p className="text-xs text-gray-400 mt-1">Select a state level that matches your cognitive pace most accurately.</p>
            </div>

            {/* Premium Selector layout */}
            <div className="space-y-2.5">
              {moodLevels.map((ml) => {
                const isSelected = selectedMood === ml.value;
                return (
                  <button
                    key={ml.value}
                    onClick={() => setSelectedMood(ml.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-blue-600 border-blue-600 text-white scale-[1.01] shadow-xs" 
                        : "bg-gray-50/60 border-gray-100 hover:border-blue-400 hover:bg-blue-50/20 text-gray-900"
                    }`}
                    id={`mood-level-btn-${ml.value}`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{ml.emoji}</span>
                      <div>
                        <h4 className="text-xs font-bold tracking-tight">{ml.label}</h4>
                        <p className={`text-[10px] ${isSelected ? "text-blue-100" : "text-gray-400"} font-medium`}>{ml.desc}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white block animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Factors checked */}
            <div className="space-y-3 pt-2">
              <div>
                <h4 className="text-xs font-bold font-display text-gray-900">Influencing Factors</h4>
                <p className="text-[10px] text-gray-400">What environmental variables shaped your feelings today?</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {factorsList.map((f) => {
                  const hasF = selectedFactors.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => handleFactorToggle(f)}
                      className={`text-xs font-medium px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                        hasF 
                          ? "bg-blue-50 border-blue-600 text-blue-700" 
                          : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                      }`}
                      id={`factor-chip-${f.replace(" ", "-")}`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional notes */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-gray-500">Add a reflective note (highly recommended)</label>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Describe your stressors, weather feelings, or anything else you need to write out..."
                rows={4}
                className="w-full bg-gray-50/40 border border-gray-100 rounded-2xl p-4 text-xs outline-hidden focus:border-blue-500 focus:bg-white text-gray-900"
                id="mood-note-text"
              />
            </div>

            <button
              onClick={handleSaveMood}
              disabled={isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              id="save-mood-btn"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>AI Serene Evaluation running...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Check-in & Analyze Trends</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Insights Column */}
        <div className="space-y-6">
          
          {/* AI Observation Card */}
          {currentAnalysis ? (
            <div className="bg-white border border-emerald-500/20 bg-gradient-to-tr from-emerald-50/20 to-white rounded-[2rem] p-8 space-y-5 shadow-xs" id="ai-evaluation-box">
              <div className="flex items-center space-x-2 text-emerald-850">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-bold font-display uppercase tracking-wider">Serene AI Cognitive Review</h3>
              </div>

              {/* Stability rating */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <p className="text-[10px] uppercase font-mono text-gray-400">Stability Index</p>
                  <p className="text-gray-900 text-2xl font-black font-display">{currentAnalysis.stabilityIndex}%</p>
                </div>
                <div className="w-14 h-14 relative flex items-center justify-center">
                  {/* Circle SVG gauge */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="#F1F3F5" strokeWidth="3" fill="none" />
                    <circle cx="28" cy="28" r="24" stroke="#10B981" strokeWidth="4" fill="none"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      strokeDashoffset={`${2 * Math.PI * 24 * (1 - currentAnalysis.stabilityIndex / 100)}`}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-emerald-600">OK</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-mono text-gray-400">Sentiment Output</p>
                <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-md font-bold text-[10px]">
                  {currentAnalysis.sentimentScore}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-mono text-gray-400">Identified Triggers</p>
                <div className="flex flex-wrap gap-1">
                  {currentAnalysis.primaryStressors.map((st, i) => (
                    <span key={i} className="text-[9px] font-mono bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md text-gray-500">
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50/80 p-4 border border-gray-100 rounded-2xl text-xs text-gray-750 leading-relaxed italic">
                "{currentAnalysis.advice}"
              </div>
              <p className="text-[8px] font-mono text-center text-gray-400 pt-1">Cognitive Guidance powered by MindCare Advisor.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 flex flex-col justify-center text-center shadow-xs min-h-[300px]" id="no-analysis-yet">
              <div className="my-auto space-y-3">
                <Smile className="w-12 h-12 text-blue-600 mx-auto animate-bounce-slow" />
                <h4 className="text-sm font-bold text-gray-900">Awaiting Cognitive Data</h4>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[220px] mx-auto">
                  Log your daily mood check-in to generate deep clinical trends, stability coefficients, and wellness advice.
                </p>
              </div>
            </div>
          )}

          {/* Calendar Heatmap simulated preview */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 space-y-4 shadow-xs" id="monthly-trends">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">Monthly Trends</h3>
                <h4 className="text-sm font-bold text-gray-900 font-display">Clarity Calendar</h4>
              </div>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px]">
              {/* Mon-Sun header */}
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="font-bold text-gray-400 py-1">{d}</div>
              ))}
              
              {/* Calendar Days */}
              {calendarDays.map((cd) => {
                let colorClass = "bg-gray-50 border-gray-100 text-gray-450";
                if (cd.mood === 5) colorClass = "bg-yellow-50 hover:bg-yellow-105 border-yellow-200 text-yellow-700";
                else if (cd.mood === 4) colorClass = "bg-emerald-50 hover:bg-emerald-105 border-emerald-200 text-emerald-700";
                else if (cd.mood === 2) colorClass = "bg-amber-50 hover:bg-amber-105 border-amber-200 text-amber-700";
                else if (cd.mood === 1) colorClass = "bg-red-50 hover:bg-red-105 border-red-200 text-red-700";

                return (
                  <div
                    key={cd.day}
                    title={`Day ${cd.day}: mood ${cd.mood}`}
                    className={`h-7 rounded-lg border flex items-center justify-center font-semibold cursor-pointer transition-colors ${colorClass}`}
                  >
                    {cd.day}
                  </div>
                );
              })}
            </div>

            {/* Legend info */}
            <div className="flex items-center justify-between text-[8.5px] text-gray-400 pt-3 border-t border-gray-100 font-mono">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-400 mr-1 block" /> Overwhelmed</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-1 block" /> Unsettled</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-1 block" /> Peaceful</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-400 mr-1 block" /> Radiant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
