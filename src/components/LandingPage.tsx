import { motion } from "motion/react";
import { Smile, BookOpen, Music, Activity, Compass, ChevronRight, BarChart2 } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
  onNavigateLogin: () => void;
}

export default function LandingPage({ onStart, onNavigateLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2F3330] font-sans overflow-x-hidden selection:bg-[#E3EFE5] selection:text-[#2A4D33]">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-[#EAE6DD]" id="landing-header">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onStart}>
          <div className="w-10 h-10 rounded-xl bg-[#2E5E3D] flex items-center justify-center text-[#FAF8F5] shadow-xs" id="brand-logo">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-[#1E221F]">MindCare</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#5F635F]">
          <a href="#features" className="hover:text-[#2E5E3D] transition-colors">Features</a>
          <a href="#science" className="hover:text-[#2E5E3D] transition-colors">Approach</a>
          <a href="#about" className="hover:text-[#2E5E3D] transition-colors">Safety</a>
        </nav>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onNavigateLogin}
            className="text-sm font-medium text-[#5F635F] hover:text-[#1E221F] px-4 py-2 rounded-lg transition-colors"
            id="btn-landing-login"
          >
            Log In
          </button>
          <button 
            onClick={onStart}
            className="text-sm font-medium bg-[#2E5E3D] hover:bg-[#20432B] text-[#FAF8F5] px-5 py-2.5 rounded-xl transition-all shadow-xs"
            id="btn-landing-start"
          >
            Start Journey
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center" id="hero-layout">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center space-x-2 bg-[#E4ECD5] text-[#2F5233] px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <span>✨ Introducing Serene Clarity AI</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#1E221F] font-display leading-[1.1]">
            Find Your Inner Calm with <span className="text-[#2E5E3D]">Serene Clarity</span>
          </h1>
          <p className="text-lg text-[#555955] leading-relaxed max-w-lg">
            MindCare is your daily companion for mental resilience. Track patterns, analyze cognitive journals with sensitive AI evaluation, and immerse yourself in gentle, therapeutic breathing exercises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={onStart}
              className="bg-[#2E5E3D] hover:bg-[#23482F] text-[#FAF8F5] px-8 py-4 rounded-2xl font-semibold shadow-md flex items-center justify-center space-x-2 transition-all group scale-102"
              id="hero-start-btn"
            >
              <span>Begin Your Journey</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="border border-[#D4CFC4] hover:bg-[#EAE6DD] text-[#3E423E] px-8 py-4 rounded-2xl font-semibold text-center transition-colors"
              id="hero-explore-btn"
            >
              Explore Features
            </a>
          </div>
          <div className="flex items-center space-x-6 text-xs text-[#7F837E] pt-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7F52]"></span>
              <span>HIPAA Compliant Standard</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7F52]"></span>
              <span>Secure Offline Encrypted</span>
            </div>
          </div>
        </motion.div>

        {/* Illustration & Interactive widget mock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative flex justify-center"
          id="hero-visual"
        >
          {/* Back accent glow */}
          <div className="absolute -inset-4 bg-radial from-[#E6EFE6] to-transparent opacity-60 rounded-full blur-3xl -z-10" />

          <div className="w-full max-w-md relative bg-[#F4F1EA] border border-[#E3DFD3] rounded-3xl p-6 shadow-xl overflow-hidden aspect-[4/3] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#E3DFD3]/60 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-[#E08D79]" />
                <div className="w-3 h-3 rounded-full bg-[#E2C799]" />
                <div className="w-3 h-3 rounded-full bg-[#8EAC50]" />
              </div>
              <span className="text-xs font-mono text-[#818580]">mindcare_agent.sh</span>
            </div>

            {/* Simulated Illustration Vector */}
            <div className="my-auto flex flex-col items-center justify-center space-y-4">
              <div className="relative w-44 h-44 rounded-full bg-gradient-to-tr from-[#2E5E3D]/10 to-[#8EAC50]/20 flex items-center justify-center animate-pulse">
                <Smile className="w-16 h-16 text-[#2E5E3D]" />
                <div className="absolute -top-2 -right-2 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  Peaceful State
                </div>
                <div className="absolute -bottom-1 -left-4 bg-[#2E5E3D]/10 border border-[#2E5E3D]/20 text-[#2E5E3D] text-[10px] px-2 py-0.5 rounded-full font-mono">
                  Resilience +20%
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#1E221F]">Feeling Better</p>
                <p className="text-xs text-[#7F837E]">Your emotional stability has improved by 20% this week</p>
              </div>
            </div>

            {/* Tiny progress bars */}
            <div className="grid grid-cols-4 gap-2 pt-4">
              <div className="h-1.5 rounded-full bg-[#EAE6DD] overflow-hidden">
                <div className="h-full w-2/3 bg-[#2E5E3D]" />
              </div>
              <div className="h-1.5 rounded-full bg-[#EAE6DD] overflow-hidden">
                <div className="h-full w-full bg-[#2E5E3D]" />
              </div>
              <div className="h-1.5 rounded-full bg-[#EAE6DD] overflow-hidden">
                <div className="h-full w-1/2 bg-[#2E5E3D]" />
              </div>
              <div className="h-1.5 rounded-full bg-[#EAE6DD] overflow-hidden">
                <div className="h-full w-3/4 bg-[#2E5E3D]" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="bg-[#EFEDE6] py-20 border-t border-[#E3DFD3]" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl mx-auto text-center mb-16 space-y-3">
            <h2 className="text-3xl font-bold font-display text-[#1E221F]">A Comprehensive Toolset for Mental Peace</h2>
            <p className="text-sm text-[#5F635F] leading-relaxed">
              Every detail in MindCare is crafted to provide a safe, soothing environment for identifying anxiety timely and cultivating long-term mindfulness.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#FAF8F5] border border-[#E3DFD3] rounded-2xl p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 shadow-xs" id="feature-card-mood">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAF1EC] text-[#2E5E3D] flex items-center justify-center">
                  <Smile className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#1E221F]">Mood Journey Tracking</h3>
                <p className="text-xs text-[#5F635F] leading-relaxed">
                  Reflect on physical stressors, record daily feelings, and unlock personal emotional stability metrics through beautiful data calendars.
                </p>
              </div>
              <span className="text-[10px] font-mono tracking-wider text-[#A5A9A4] group-hover:text-[#2E5E3D] transition-colors mt-6 uppercase inline-flex items-center">
                Daily Check-ins <ChevronRight className="w-3 h-3 ml-1" />
              </span>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FAF8F5] border border-[#E3DFD3] rounded-2xl p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 shadow-xs" id="feature-card-journal">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAF1EC] text-[#2E5E3D] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#1E221F]">CBT Safe Journaling</h3>
                <p className="text-xs text-[#5F635F] leading-relaxed">
                  Our guided journal uses cognitive-behavioral insights to evaluate emotional tones, identify sub-surface stress loops, and give coping plans.
                </p>
              </div>
              <span className="text-[10px] font-mono tracking-wider text-[#A5A9A4] mt-6 uppercase inline-flex items-center">
                AI Cognitive Analysis <ChevronRight className="w-3 h-3 ml-1" />
              </span>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FAF8F5] border border-[#E3DFD3] rounded-2xl p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 shadow-xs" id="feature-card-music">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAF1EC] text-[#2E5E3D] flex items-center justify-center">
                  <Music className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#1E221F]">Sonic Sanctuary</h3>
                <p className="text-xs text-[#5F635F] leading-relaxed">
                  Immerse yourself in nature loops, heavy forest rainfall, and lo-fi focus waves configured directly inside our responsive player.
                </p>
              </div>
              <span className="text-[10px] font-mono tracking-wider text-[#A5A9A4] mt-6 uppercase inline-flex items-center">
                Curated Soundscapes <ChevronRight className="w-3 h-3 ml-1" />
              </span>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FAF8F5] border border-[#E3DFD3] rounded-2xl p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 shadow-xs" id="feature-card-breathing">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#EAF1EC] text-[#2E5E3D] flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#1E221F]">Guided Motion & SOS</h3>
                <p className="text-xs text-[#5F635F] leading-relaxed">
                  Calm the central nervous system in high-stress moments with visual box breathing timers and quick grounding meditations.
                </p>
              </div>
              <span className="text-[10px] font-mono tracking-wider text-[#A5A9A4] mt-6 uppercase inline-flex items-center">
                Interactive Breathwork <ChevronRight className="w-3 h-3 ml-1" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Mental health check solutions CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6" id="about">
        <h2 className="text-3xl font-bold font-display text-[#1E221F]">Ready to prioritize your peace?</h2>
        <p className="text-sm text-[#5F635F] max-w-xl mx-auto leading-relaxed">
          MindCare is designed with clinical ethics in mind. Your data is kept locally on your browser. Create your account in minutes to experience full mental care guidance.
        </p>
        <div>
          <button
            onClick={onStart}
            className="bg-[#2E5E3D] hover:bg-[#20432B] text-[#FAF8F5] px-10 py-4 rounded-2xl font-semibold shadow-md transition-all scale-102"
            id="landing-cta-btn"
          >
            Create Your Free Account
          </button>
        </div>
        <p className="text-xs text-[#959994] pt-2">
          HIPAA & GDPR Standards • Secure AES Storage • Free Forever
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E221F] text-[#A2A6A2] py-12 border-t border-[#2F3330]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[#FAF8F5]">
              <Compass className="w-6 h-6 text-[#8EAC50]" />
              <span className="text-lg font-bold tracking-tight">MindCare</span>
            </div>
            <p className="text-xs text-[#828682] leading-relaxed">
              Analyzing psychological mental health conditions & empowering people to lead peaceful, mindful lives.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#FAF8F5] mb-3">Core Solution</h4>
            <ul className="space-y-2 text-xs">
              <li>Mood Analysis Metrics</li>
              <li>Therapeutic Cognitive Writing</li>
              <li>Guided Sympathy Chats</li>
              <li>Sound Therapies</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#FAF8F5] mb-3">Disclaimer</h4>
            <p className="text-xs text-[#828682] leading-relaxed">
              MindCare is an emotional support tool. It does not provide clinical diagnoses. If you are experiencing serious complications or self-harm issues, please contact professional emergency medical services instantly.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-[#2D312E] text-center text-xs text-[#6F736F]">
          © 2026 MindCare App Inc. All rights reserved. Made in harmony.
        </div>
      </footer>
    </div>
  );
}
