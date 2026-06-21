import { useState, useEffect, useRef } from "react";
import { Activity, Play, Pause, RefreshCw, Smile, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";
import { Exercise, User } from "../types";

interface MindfulMotionProps {
  user: User;
  onUpdateMeditationMinutes: (mins: number) => void;
}

const MASTER_EXERCISES_CATALOG: Exercise[] = [
  {
    id: "ex_1",
    title: "Morning Flow Renewal",
    duration: "15 min",
    category: "Meditation",
    level: "Intermediate",
    description: "Centering morning pranayama sequence designed to ignite vital oxygen flows through light conscious breathing.",
    instructionSteps: [
      "Sit upright with spine comfortably relaxed.",
      "Inhale slowly through the nose for 5 seconds.",
      "Hold the air with full chest expansion for 2 seconds.",
      "Sigh gently out through the mouth for 6 seconds.",
      "Repeat 10 cycles while noticing muscle relaxation."
    ]
  },
  {
    id: "ex_2",
    title: "Core Box Breathing Rhythm",
    duration: "5 min",
    category: "Breathing",
    level: "Beginner",
    description: "Standard Navy SEAL stress-suppression rhythm. Regulates pulse frequency and intercepts fight-or-flight triggers instantly.",
    instructionSteps: [
      "Empty all air from your lungs gently.",
      "Inhale deeply through your nostrils for 5 seconds.",
      "Hold the breath for 5 seconds without tensing your throat.",
      "Exhale smoothly through your mouth for 5 seconds.",
      "Hold empty for 5 seconds before repeating."
    ]
  },
  {
    id: "ex_3",
    title: "Sunder Ban Forest Sound Bathing",
    duration: "8 min",
    category: "Yoga",
    level: "Beginner",
    description: "Restorative light movement sequence paired with mental forest imagery. Unclogs crowded mind schedules.",
    instructionSteps: [
      "Roll your shoulders backwards while breathing in.",
      "Tilt your head left then right with long exhales.",
      "Inhale while raising hands straight up.",
      "Slowly drift hands downward while blowing out slowly.",
      "Repeat with eyes closed, imagining green leaves."
    ]
  },
  {
    id: "ex_4",
    title: "Sleep Twilight Unwind",
    duration: "12 min",
    category: "Meditation",
    level: "Advanced",
    description: "Vagus nerve stimulant rhythm. Promotes quiet melatonin flows and signals full physical recovery before sleep.",
    instructionSteps: [
      "Lie down comfortably flat on your back.",
      "Close your eyes and breathe slowly.",
      "Count 4 seconds on breath intake.",
      "Count 8 seconds during release. Long exhales stimulate calming vagus synapses.",
      "Feel muscles turning heavy like water."
    ]
  }
];

export default function MindfulMotion({ user, onUpdateMeditationMinutes }: MindfulMotionProps) {
  const [activeExercise, setActiveExercise] = useState<Exercise>(MASTER_EXERCISES_CATALOG[1]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  
  // Interactive box breathing loop states
  const [isBreathingState, setIsBreathingState] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Hold Empty">("Inhale");
  const [breathSeconds, setBreathSeconds] = useState(5);
  const [breathCycleCount, setBreathCycleCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Breathing loop cycle tracker
  useEffect(() => {
    if (isBreathingState) {
      timerRef.current = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            // Transitions phase
            setBreathPhase((currentPhase) => {
              if (currentPhase === "Inhale") return "Hold";
              if (currentPhase === "Hold") return "Exhale";
              if (currentPhase === "Exhale") return "Hold Empty";
              
              // Increment done cycle
              setBreathCycleCount((c) => {
                const updated = c + 1;
                // Add 1 min meditated in local user state for every 3 cycles finished
                if (updated % 3 === 0) {
                  onUpdateMeditationMinutes(1);
                }
                return updated;
              });
              return "Inhale";
            });
            return 5; // Reset step duration
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isBreathingState]);

  const handleToggleBreathing = () => {
    if (isBreathingState) {
      setIsBreathingState(false);
      setBreathPhase("Inhale");
      setBreathSeconds(5);
    } else {
      setIsBreathingState(true);
    }
  };

  const handleResetBreathing = () => {
    setIsBreathingState(false);
    setBreathPhase("Inhale");
    setBreathSeconds(5);
    setBreathCycleCount(0);
  };

  // Rendering matching box breathing visuals with top-tier aesthetic state circles
  let circleScaleClass = "scale-90 bg-gray-50 border-gray-150 text-blue-600";
  let phaseColorText = "text-gray-500";
  let phaseInstruction = "Ready your mind";

  if (isBreathingState) {
    if (breathPhase === "Inhale") {
      circleScaleClass = "scale-110 bg-radial from-blue-100 to-blue-50 border-blue-500 text-blue-900";
      phaseColorText = "text-blue-800";
      phaseInstruction = "Breathe in slowly through nose... Feel chest expand";
    } else if (breathPhase === "Hold") {
      circleScaleClass = "scale-110 bg-radial from-amber-100 to-amber-50 border-amber-400 text-amber-950 font-bold";
      phaseColorText = "text-amber-800";
      phaseInstruction = "Keep lungs still. Do not hold muscular tension";
    } else if (breathPhase === "Exhale") {
      circleScaleClass = "scale-90 bg-indigo-50 border-indigo-200 text-indigo-900";
      phaseColorText = "text-indigo-850";
      phaseInstruction = "Sigh smoothly out through mouth... Release shoulders";
    } else if (breathPhase === "Hold Empty") {
      circleScaleClass = "scale-85 bg-gray-100/80 border-gray-300 text-gray-500";
      phaseColorText = "text-gray-400";
      phaseInstruction = "Rest empty before next inhale... Feel the silence";
    }
  }

  const categoryOptions = ["All", "Breathing", "Meditation", "Yoga"];
  const exercisesFiltered = activeCategory === "All"
    ? MASTER_EXERCISES_CATALOG
    : MASTER_EXERCISES_CATALOG.filter(e => e.category === activeCategory);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-[#F8F9FA] min-h-screen" id="exercises-page">
      {/* Title Bento Box */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs relative overflow-hidden">
        <div>
          <span className="text-xs font-mono font-bold text-blue-600 tracking-wider uppercase">Somatic Grounding</span>
          <h2 className="text-3xl font-extrabold text-gray-900 font-display mt-1">Mindful Motion</h2>
          <p className="text-sm text-gray-500 mt-1.5 max-w-xl leading-relaxed">
            Find your inner peace through gentle box breathing. Slow pulse triggers to intercept fight-or-flight stress responses instantly.
          </p>
        </div>

        {/* Exercises Filters */}
        <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 text-xs font-bold shrink-0 self-start md:self-center">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeCategory === cat 
                  ? "bg-blue-600 text-white shadow-xs" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive circle and catalog */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Interactive Box Breathing Stage (Large Card) */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[2rem] p-8 flex flex-col items-center justify-between min-h-[500px] shadow-xs" id="breathing-stage-box">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono tracking-widest bg-blue-50 border border-blue-200/20 text-blue-600 px-3.5 py-1.5 rounded-full uppercase font-bold">
              Autonomous Box Breathing Rhythm
            </span>
            <h3 className="text-lg font-extrabold text-gray-900 font-display pt-2.5">Sympathetic Nerve Intervention Workspace</h3>
          </div>

          {/* Glowing Animated Breathing Circle */}
          <div className="my-10 flex flex-col items-center justify-center relative">
            
            {/* Visual background ripple rings */}
            {isBreathingState && (
              <div className="absolute inset-[-40px] border border-blue-500/10 rounded-full animate-ping pointer-events-none" />
            )}
            
            <div className={`w-52 h-52 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out shadow-xs text-center p-6 ${circleScaleClass}`}>
              <Smile className="w-8 h-8 text-current mb-2 animate-bounce-slow" />
              <h4 className="text-lg font-black tracking-tight">{isBreathingState ? breathPhase : "Ready"}</h4>
              <p className="text-3xl font-extrabold font-display font-mono mt-0.5">
                {isBreathingState ? `${breathSeconds}s` : "0:00"}
              </p>
              <span className="text-[9px] font-mono font-bold mt-1.5 uppercase text-gray-400">
                Cycle: {breathCycleCount} done
              </span>
            </div>
          </div>

          {/* Visual phase instructions bar */}
          <div className="text-center max-w-sm h-14">
            <p className={`text-xs font-bold leading-relaxed transition-all ${phaseColorText}`}>
              {phaseInstruction}
            </p>
            {isBreathingState && (
              <p className="text-[9px] font-mono text-gray-450 mt-1 uppercase">Observe the expand & contract cues</p>
            )}
          </div>

          {/* Trigger controls */}
          <div className="flex items-center space-x-3.5 pt-4">
            <button
              onClick={handleToggleBreathing}
              className={`px-8 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center space-x-2 cursor-pointer ${
                isBreathingState 
                  ? "bg-amber-500 hover:bg-amber-600 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              id="breathing-trigger-btn"
            >
              {isBreathingState ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause Practice</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                  <span>Start 5s Breathing Rhythm</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetBreathing}
              className="border border-gray-150 hover:bg-gray-50 p-3.5 rounded-2xl text-gray-400 hover:text-gray-90
              hover:text-gray-900 transition-colors cursor-pointer"
              title="Reset Cycles"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Goals progress / tracking side panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Journey Stats Dashboard card */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 space-y-4 shadow-xs" id="mindful-stats-card">
            <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">Your Mindful Journey</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl shadow-xxs">
                <span className="text-[9px] font-mono text-gray-400 uppercase">Total Minutes</span>
                <p className="text-xl font-bold font-display text-gray-900 mt-0.5">{user.totalMinutes}m</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl shadow-xxs">
                <span className="text-[9px] font-mono text-gray-400 uppercase">Day Streak</span>
                <p className="text-xl font-bold font-display text-blue-600 mt-0.5">{user.streak} days</p>
              </div>
            </div>

            {/* Simulated goals bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-semibold text-gray-500 font-sans">Daily Routine Goal</span>
                <span className="font-mono font-bold text-blue-600">{Math.min(Math.round((user.totalMinutes / 1200) * 100), 100)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${Math.min((user.totalMinutes / 1200) * 100, 100)}%` }} />
              </div>
              <span className="text-[9px] text-gray-450 block text-right font-mono">15 min target met today</span>
            </div>

            <div className="flex items-center space-x-2 bg-blue-50 border border-blue-105 text-blue-700 p-3 rounded-xl text-[10px] font-bold">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Streak active. You are in the top 10% of mindful creators!</span>
            </div>
          </div>

          {/* Exercise Details panel showing instructions */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 space-y-4 shadow-xs" id="focused-exercise-details">
            <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">Active Guide Instruction</h3>
            
            <div className="space-y-2 border-b border-gray-100 pb-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold font-display text-gray-950">{activeExercise.title}</h4>
                <span className="text-[9px] font-mono bg-indigo-50 border border-indigo-150 text-indigo-700 px-1.5 py-0.5 rounded-sm font-bold">{activeExercise.duration}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{activeExercise.description}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 block font-bold">Step-by-step Pacing</span>
              <ol className="space-y-2 text-xs text-gray-600 pl-4 list-decimal leading-relaxed">
                {activeExercise.instructionSteps.map((step, idx) => (
                  <li key={idx} className="marker:text-blue-600 marker:font-bold">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

      </div>

      {/* Exercises Library Grid selector */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 space-y-4 shadow-xs" id="exercises-library">
        <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">Full Motion Library</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exercisesFiltered.map((ex) => {
            const isSel = activeExercise.id === ex.id;
            return (
              <div
                key={ex.id}
                onClick={() => setActiveExercise(ex)}
                className={`p-5 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between hover:translate-y-[-2px] ${
                  isSel 
                    ? "border-blue-600 bg-blue-50/15" 
                    : "border-gray-100 bg-gray-50/50 hover:border-blue-300"
                }`}
                id={`catalog-card-${ex.id}`}
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-sm text-gray-500 uppercase font-bold">{ex.level}</span>
                    <span className="text-blue-600 font-bold">{ex.duration}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-gray-900 leading-tight">{ex.title}</h4>
                  <p className="text-[10px] text-gray-450 leading-relaxed line-clamp-2">{ex.description}</p>
                </div>
                <button
                  type="button"
                  className="text-[10px] font-bold text-blue-600 hover:underline mt-4 self-start flex items-center"
                >
                  <span>Select Guide</span>
                  <Activity className="w-3 h-3 ml-1" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
