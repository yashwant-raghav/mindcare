import React, { useState } from "react";
import { BookOpen, Sparkles, Feather, Calendar, Search, ArrowRight, Save, Trash2 } from "lucide-react";
import { JournalEntry, User } from "../types";

interface MyJournalProps {
  user: User;
  journalEntries: JournalEntry[];
  onAddJournalEntry: (entry: JournalEntry) => void;
  onDeleteJournalEntry: (id: string) => void;
}

const INSIGHTS_PROMPTS = [
  { text: "What is a minor event that brought a quiet smile to your face today?", tag: "Gratitude" },
  { text: "Describe a feeling of stress or fatigue. Imagine placing it outside your physical body.", tag: "Cognitive Detachment" },
  { text: "Reflect on a boundary you set recently. How did it feel to protect your clarity?", tag: "Self-Care" },
  { text: "Write about three simple elements in nature you noticed on your path today.", tag: "Enrichment" },
];

export default function MyJournal({ user, journalEntries, onAddJournalEntry, onDeleteJournalEntry }: MyJournalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [moodVal, setMoodVal] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<JournalEntry["analysis"] | null>(null);
  const [activeEntryView, setActiveEntryView] = useState<JournalEntry | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const handleApplyPrompt = (promptText: string) => {
    setContent(promptText);
    setTitle("Reflections: " + promptText.substring(0, 24) + "...");
  };

  const handleSaveAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Please fill in both the Title and Journal Reflections content.");
      return;
    }

    setIsAnalyzing(true);
    setStatusMsg("");
    setCurrentAnalysis(null);

    try {
      const response = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          moodValue: moodVal
        })
      });

      if (!response.ok) {
        throw new Error("Journal analysis server error.");
      }

      const analysis = await response.json();
      setCurrentAnalysis(analysis);

      const newEntry: JournalEntry = {
        id: `journal_${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        title,
        content,
        moodValue: moodVal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysis: analysis
      };

      onAddJournalEntry(newEntry);
      setActiveEntryView(newEntry);
      
      // Clear form
      setTitle("");
      setContent("");
      setStatusMsg("Reflection Saved with deep AI therapeutic insights!");
    } catch (err) {
      console.error(err);
      setStatusMsg("Saved locally. Therapist advice emulated due to connection.");
      
      // Offline fallback evaluation
      const localMockAnalysis = {
        emotionalTone: "Reflective Internalizing (Mock Care)",
        underlyingThemes: ["Personal growth", "Mindful pacing", "Mental exploration"],
        copingStrategies: [
          "Take three slow deep breaths when feeling unsettled.",
          "Write down three external factors you cannot change, then tear up the paper.",
          "Close your eyes and listen to Rainforest audio loops for 4 minutes."
        ],
        psychologicalInsight: "Writing reflections regularly empowers you to externalize heavy moods. This allows clinical CBT mechanisms to naturally quiet mind loops."
      };
      
      setCurrentAnalysis(localMockAnalysis);

      const newEntry: JournalEntry = {
        id: `journal_${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        title,
        content,
        moodValue: moodVal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysis: localMockAnalysis
      };
      
      onAddJournalEntry(newEntry);
      setActiveEntryView(newEntry);
      setTitle("");
      setContent("");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredEntries = journalEntries.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-[#F8F9FA] min-h-screen" id="journal-page-container">
      {/* Title as a Bento Card Header */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xs relative overflow-hidden">
        <span className="text-xs font-mono font-bold text-blue-600 tracking-wider uppercase">Expressive Catharsis</span>
        <h2 className="text-3xl font-extrabold text-gray-900 font-display mt-2 font-display">My Journal</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-xl leading-relaxed">
          A peaceful, private space for your wandering thoughts, quiet confessions, and therapeutic reflections.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Entries Search and Inspiration */}
        <div className="lg:col-span-4 space-y-6">
          {/* Search */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 space-y-3 shadow-xs">
            <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">Search Reflections</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search past logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50/60 text-xs border border-gray-100 rounded-xl pl-9 pr-3 py-3 outline-hidden focus:border-blue-500 focus:bg-white text-gray-900"
                id="journal-search"
              />
            </div>
          </div>

          {/* Prompt Inspiration Card */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 space-y-4 shadow-xs" id="inspiration-card">
            <div>
              <h3 className="text-xs font-mono font-bold tracking-wider text-blue-600 uppercase">Inspiration Prompts</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Stuck in a mental loop? Click to select a gentle prompt.</p>
            </div>

            <div className="space-y-2.5">
              {INSIGHTS_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPrompt(prompt.text)}
                  className="w-full text-left bg-gray-50/50 border border-gray-100 p-3.5 rounded-xl hover:border-blue-400 hover:bg-blue-50/5 transition-all group cursor-pointer"
                  id={`prompt-${idx}`}
                >
                  <p className="text-xs font-bold text-gray-900 leading-snug mb-1 group-hover:text-blue-600">"{prompt.text}"</p>
                  <span className="text-[9px] font-mono font-semibold uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-sm">
                    {prompt.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent reflections list */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 space-y-4 shadow-xs" id="recent-reflections">
            <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">Recent Reflections</h3>
            
            {filteredEntries.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No reflection logs found.</p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
                {filteredEntries.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      setActiveEntryView(e);
                      setCurrentAnalysis(e.analysis || null);
                    }}
                    className={`w-full text-left p-3.5 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                      activeEntryView?.id === e.id
                        ? "bg-blue-50/45 border-blue-500 shadow-xxs"
                        : "bg-gray-50/50 border-gray-100 hover:border-blue-400"
                    }`}
                  >
                    <div className="overflow-hidden space-y-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate leading-tight">{e.title}</h4>
                      <p className="text-[9px] font-mono text-gray-400">{e.date} • {e.timestamp} ({e.moodValue}/5 Energy)</p>
                    </div>
                    
                    <button 
                      onClick={(event) => {
                        event.stopPropagation();
                        if (confirm("Are you sure you want to delete this journal reflection? This cannot be undone.")) {
                          onDeleteJournalEntry(e.id);
                          if (activeEntryView?.id === e.id) {
                            setActiveEntryView(null);
                            setCurrentAnalysis(null);
                          }
                        }
                      }}
                      className="text-gray-400 hover:text-red-700 p-1"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Write & AI review */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Write New Reflection Form */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 space-y-5 shadow-xs" id="editor-box">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Feather className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold font-display text-gray-900">Reflect & Express</h3>
              </div>
              <span className="text-xs text-gray-400 font-mono font-bold uppercase">Writing desk</span>
            </div>

            <form onSubmit={handleSaveAndAnalyze} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Title of Feeling</label>
                <input
                  type="text"
                  placeholder="e.g. Navigating work anxiety logs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50/50 text-xs border border-gray-100 rounded-xl px-4 py-3 outline-hidden focus:border-blue-500 focus:bg-white text-gray-900"
                  id="journal-title-field"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Self-Assessment Mood Energy (1-5)</label>
                <div className="flex items-center space-x-3 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setMoodVal(v)}
                      className={`w-8 h-8 rounded-full font-bold text-xs transition-colors flex items-center justify-center cursor-pointer ${
                        moodVal === v 
                          ? "bg-blue-600 text-white" 
                          : "bg-white border border-gray-200 text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                  <span className="text-[10px] text-gray-500 italic ml-2">
                    {moodVal === 5 ? "✨ Radiant Energy" : moodVal === 4 ? "🌸 Calm & Peaceful" : moodVal === 3 ? "⚖️ Neutral Balanced" : moodVal === 2 ? "🍃 Minor Anxiety" : "⛈️ Deep Distress"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Reflections & Thoughts</label>
                <textarea
                  placeholder="Start writing from the heart... Pour out anxieties, stress points, relationships, or micro-victories. Cognitive therapy starts with externalizing."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full bg-gray-50/40 text-xs border border-gray-100 rounded-2xl p-4 outline-hidden focus:border-blue-500 focus:bg-white text-gray-900 leading-relaxed"
                  id="journal-content-field"
                />
              </div>

              {statusMsg && (
                <div className="p-3.5 bg-blue-50 border border-blue-100 text-xs text-blue-700 rounded-xl font-bold font-display animate-pulse" id="journal-status">
                  {statusMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
                id="btn-journal-analyze"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cognitive Server Analyzing Entry...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Reflection & Apply AI Therapy Insight</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Selected View Card displaying both full text and AI Therapy Report */}
          {activeEntryView && (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 space-y-6 shadow-xs animate-fade-in" id="entry-viewer">
              <div className="space-y-2 border-b border-gray-100 pb-4">
                <span className="text-[10px] font-mono uppercase bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-md">
                  Active Entry View
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 font-display mt-2">{activeEntryView.title}</h3>
                <p className="text-[10px] font-mono text-gray-400">{activeEntryView.date} at {activeEntryView.timestamp} • Mood Rating: {activeEntryView.moodValue}/5</p>
              </div>

              <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                {activeEntryView.content}
              </div>

              {activeEntryView.analysis ? (
                <div className="bg-white border border-blue-200/50 bg-gradient-to-tr from-blue-50/20 to-white rounded-2xl p-6 space-y-4" id="ai-journal-report">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h4 className="text-xs font-extrabold uppercase tracking-widest font-mono">Therapeutic Diagnosis Review</h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 border-b border-gray-150 pb-3.5 text-xs">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono text-gray-400">Emotional Tone Signature</span>
                      <p className="font-bold text-gray-900">{activeEntryView.analysis.emotionalTone}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono text-gray-400">Identified Themes</span>
                      <p className="font-bold text-blue-700">{activeEntryView.analysis.underlyingThemes?.join(", ")}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-mono text-gray-400 block">Psychology Clinical CBT Analysis</span>
                    <p className="text-xs text-gray-700 italic leading-relaxed">
                      "{activeEntryView.analysis.psychologicalInsight}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-mono text-gray-400 block">Cognitive Action Plans & Coping</span>
                    <ul className="space-y-1.5 list-disc pl-4 text-xs text-gray-500">
                      {activeEntryView.analysis.copingStrategies?.map((st: string, idx: number) => (
                        <li key={idx}><strong>Exercise {idx + 1}:</strong> {st}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/60 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center space-x-2">
                  <Feather className="w-4 h-4" />
                  <span>No therapeutic report was saved for this entry yet. Make another reflection above to generate a report.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
