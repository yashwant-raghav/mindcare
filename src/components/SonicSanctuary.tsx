import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, SkipBack, SkipForward, Music, Sparkles, AlertCircle, Compass, Wind, Youtube, Plus, Video, VideoOff, Star, Trash2 } from "lucide-react";
import { MusicTrack, User } from "../types";

interface SonicSanctuaryProps {
  user: User;
  onUpdateStudyMinutes: (mins: number) => void;
}

const SANCTUARY_PLAYLIST: MusicTrack[] = [
  {
    id: "track_1",
    title: "Rainforest Ambient Rainfall",
    artist: "Nature Relaxation",
    audioUrl: "q76bN0Gy6zo",
    duration: "3:00:00",
    category: "Nature",
    coverUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=256&auto=format&fit=crop"
  },
  {
    id: "track_2",
    title: "Midnight Rain in Kyoto",
    artist: "Kyoto Solfeggio Loop",
    audioUrl: "mPZkdNFkNps",
    duration: "3:00:00",
    category: "Nature",
    coverUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=256&auto=format&fit=crop"
  },
  {
    id: "track_3",
    title: "Deep Focus Binaural Flow",
    artist: "Alpha Brain Wave Labs",
    audioUrl: "WPni755-Krg",
    duration: "2:00:00",
    category: "Focus",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=256&auto=format&fit=crop"
  },
  {
    id: "track_4",
    title: "Cosmic Slate Quietude",
    artist: "Space Ambient Journeys",
    audioUrl: "H14bBuluwB8",
    duration: "4:00:00",
    category: "Sleep",
    coverUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=256&auto=format&fit=crop"
  },
  {
    id: "track_5",
    title: "Ocean Tide Detachment",
    artist: "Pacific Wave Soother",
    audioUrl: "vPhg6sc1Mk4",
    duration: "3:00:00",
    category: "Relax",
    coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=256&auto=format&fit=crop"
  },
  {
    id: "track_6",
    title: "Lofi Study & Relax Beats",
    artist: "Lofi Girl",
    audioUrl: "jfKfPfyJRdk",
    duration: "Live Stream",
    category: "Focus",
    coverUrl: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg"
  },
  {
    id: "track_7",
    title: "Calm Soothing Piano Music",
    artist: "Piano Sanctuary",
    audioUrl: "77ZozI0rw7w",
    duration: "3:11:54",
    category: "Relax",
    coverUrl: "https://img.youtube.com/vi/77ZozI0rw7w/hqdefault.jpg"
  }
];

export default function SonicSanctuary({ user, onUpdateStudyMinutes }: SonicSanctuaryProps) {
  // Load playlist from localStorage if available
  const [playlist, setPlaylist] = useState<MusicTrack[]>(() => {
    const saved = localStorage.getItem("mindcare_custom_playlist");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return SANCTUARY_PLAYLIST;
  });

  // Load default/last selected track from localStorage
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(() => {
    const savedPlaylist = localStorage.getItem("mindcare_custom_playlist");
    let loadedPlaylist = SANCTUARY_PLAYLIST;
    if (savedPlaylist) {
      try {
        loadedPlaylist = JSON.parse(savedPlaylist);
      } catch (e) {}
    }
    const defaultId = localStorage.getItem("mindcare_default_track_id");
    if (defaultId) {
      const found = loadedPlaylist.find(t => t.id === defaultId);
      if (found) return found;
    }
    return loadedPlaylist[0] || SANCTUARY_PLAYLIST[0];
  });

  const [defaultTrackId, setDefaultTrackId] = useState<string | null>(() => {
    return localStorage.getItem("mindcare_default_track_id");
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0); 
  const [volume, setVolume] = useState(80);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // YouTube states
  const [playerMode, setPlayerMode] = useState<"youtube" | "synth">("youtube");
  const [showVideo, setShowVideo] = useState(false);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState(0);
  const [durationDisplay, setDurationDisplay] = useState(0);
  const [ytInput, setYtInput] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualArtist, setManualArtist] = useState("");

  // Web Audio Synth setup for real therapeutic ambient sound loops!
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  
  // Timer for tracking minutes meditated
  const meditationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // YouTube Player refs
  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef<boolean>(false);

  // Save playlist to localStorage automatically on change
  useEffect(() => {
    localStorage.setItem("mindcare_custom_playlist", JSON.stringify(playlist));
  }, [playlist]);

  // Load YouTube script on mount
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  // Initialize or update YouTube Player when track or mode changes
  useEffect(() => {
    if (playerMode === "youtube") {
      initPlayer(currentTrack.audioUrl);
    } else {
      // Pause YouTube player if switching to synth mode
      if (playerRef.current && playerReadyRef.current) {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {
          console.error("Failed to pause YouTube", e);
        }
      }
    }
  }, [currentTrack.id, playerMode]);

  // Synchronize playback state with browser timers
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      if (playerMode === "youtube") {
        // Poll YouTube player for progress
        timer = setInterval(() => {
          if (playerRef.current && playerReadyRef.current) {
            try {
              const current = playerRef.current.getCurrentTime();
              const duration = playerRef.current.getDuration();
              if (duration > 0) {
                setPlayProgress((current / duration) * 100);
                setCurrentTimeDisplay(current);
                setDurationDisplay(duration);
              }
            } catch (e) {
              // Ignore player calls before ready
            }
          }
        }, 1000);
      } else {
        // Simulated progress for synth mode
        timer = setInterval(() => {
          setPlayProgress((prev) => {
            if (prev >= 100) {
              setIsPlaying(false);
              return 0;
            }
            return prev + 0.4;
          });
        }, 1000);
      }

      // Track active therapy minutes meditated in state
      meditationIntervalRef.current = setInterval(() => {
        onUpdateStudyMinutes(1);
      }, 60000); // add 1 minute every 60 seconds
    } else {
      if (meditationIntervalRef.current) {
        clearInterval(meditationIntervalRef.current);
      }
    }

    return () => {
      clearInterval(timer);
      if (meditationIntervalRef.current) {
        clearInterval(meditationIntervalRef.current);
      }
    };
  }, [isPlaying, playerMode]);

  const initPlayer = (videoId: string) => {
    if (!(window as any).YT || !(window as any).YT.Player) {
      // Try again shortly
      setTimeout(() => initPlayer(videoId), 200);
      return;
    }

    if (playerRef.current) {
      try {
        playerRef.current.loadVideoById({
          videoId: videoId
        });
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
        return;
      } catch (e) {
        console.warn("Retrying player init due to context mismatch", e);
      }
    }

    playerReadyRef.current = false;
    playerRef.current = new (window as any).YT.Player("youtube-player-iframe", {
      height: "100%",
      width: "100%",
      videoId: videoId,
      playerVars: {
        autoplay: isPlaying ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (event: any) => {
          playerReadyRef.current = true;
          event.target.setVolume(volume);
          if (isPlaying) {
            event.target.playVideo();
          }
        },
        onStateChange: (event: any) => {
          // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
          if (event.data === (window as any).YT.PlayerState.ENDED) {
            handleSkipNext();
          } else if (event.data === (window as any).YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          }
        }
      }
    });
  };

  // Audio Synth triggers
  const startSynth = () => {
    try {
      // Pause YouTube player if playing
      if (playerRef.current && playerReadyRef.current) {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {}
      }

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Chain: Osc1/Osc2 -> Filter (Lowpass) -> Gain -> Destination
      filterRef.current = ctx.createBiquadFilter();
      filterRef.current.type = "lowpass";
      filterRef.current.frequency.setValueAtTime(320, ctx.currentTime);

      gainNodeRef.current = ctx.createGain();
      // Map base volume
      gainNodeRef.current.gain.setValueAtTime((volume / 100) * 0.12, ctx.currentTime);

      // Set up gentle therapeutic base frequency (e.g. 110Hz or 136Hz solfeggio tone)
      osc1Ref.current = ctx.createOscillator();
      osc1Ref.current.type = "sine";
      
      // Determine frequency depending on category
      let f1 = 110; // base tone
      let f2 = 110.5; // slight alpha difference for binaural effect

      if (currentTrack.category === "Focus") {
        f1 = 144; f2 = 154; // Focus flow state alpha difference
      } else if (currentTrack.category === "Sleep") {
        f1 = 85; f2 = 88.5; // Deep delta wave generator
      } else if (currentTrack.category === "Relax") {
        f1 = 120; f2 = 125; // soothing theta waves
      }

      osc1Ref.current.frequency.setValueAtTime(f1, ctx.currentTime);

      osc2Ref.current = ctx.createOscillator();
      osc2Ref.current.type = "triangle"; // softer shape
      osc2Ref.current.frequency.setValueAtTime(f2, ctx.currentTime);

      // Connect everything
      osc1Ref.current.connect(filterRef.current);
      osc2Ref.current.connect(filterRef.current);
      filterRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(ctx.destination);

      // Start oscillators
      osc1Ref.current.start();
      osc2Ref.current.start();

      // Gentle modulation over time to mimic sea waves/wind breath oscillations
      let step = 0;
      const waveInterval = setInterval(() => {
        if (!osc1Ref.current || !gainNodeRef.current) {
          clearInterval(waveInterval);
          return;
        }
        step += 0.05;
        // Modulate gain gently
        const noiseGainValue = (volume / 100) * (0.08 + Math.sin(step) * 0.04);
        gainNodeRef.current.gain.setValueAtTime(noiseGainValue, ctx.currentTime);
        // Modulate filter cutoff for breeze effect
        const filterCutoff = 220 + Math.sin(step * 0.7) * 90;
        if (filterRef.current) {
          filterRef.current.frequency.setValueAtTime(filterCutoff, ctx.currentTime);
        }
      }, 100);

    } catch (e) {
      console.error("Web Audio API not fully initialized or blocked by browser user constraints.", e);
    }
  };

  const stopSynth = () => {
    try {
      if (osc1Ref.current) {
         osc1Ref.current.stop();
         osc1Ref.current.disconnect();
         osc1Ref.current = null;
      }
      if (osc2Ref.current) {
        osc2Ref.current.stop();
        osc2Ref.current.disconnect();
        osc2Ref.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch {
      // safe bypass
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      if (playerMode === "youtube") {
        if (playerRef.current && playerReadyRef.current) {
          try {
            playerRef.current.pauseVideo();
          } catch (e) {}
        }
      } else {
        stopSynth();
      }
      setIsPlaying(false);
    } else {
      if (playerMode === "youtube") {
        if (playerRef.current && playerReadyRef.current) {
          try {
            playerRef.current.playVideo();
          } catch (e) {}
        } else {
          initPlayer(currentTrack.audioUrl);
        }
      } else {
        startSynth();
      }
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (track: MusicTrack) => {
    stopSynth();
    setCurrentTrack(track);
    setPlayProgress(0);
    setIsPlaying(true);
    
    if (playerMode === "youtube") {
      setTimeout(() => {
        initPlayer(track.audioUrl);
      }, 50);
    } else {
      setTimeout(() => {
        startSynth();
      }, 100);
    }
  };

  const handleSkipNext = () => {
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % playlist.length;
    handleSelectTrack(playlist[nextIdx]);
  };

  const handleSkipPrev = () => {
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    let prevIdx = idx - 1;
    if (prevIdx < 0) prevIdx = playlist.length - 1;
    handleSelectTrack(playlist[prevIdx]);
  };

  const handleSeek = (percent: number) => {
    setPlayProgress(percent);
    if (playerMode === "youtube" && playerRef.current && playerReadyRef.current) {
      try {
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          const seekTo = (percent / 100) * duration;
          playerRef.current.seekTo(seekTo, true);
          setCurrentTimeDisplay(seekTo);
        }
      } catch (e) {}
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const secStr = secs < 10 ? `0${secs}` : secs;
    if (hrs > 0) {
      const minStr = mins < 10 ? `0${mins}` : mins;
      return `${hrs}:${minStr}:${secStr}`;
    }
    return `${mins}:${secStr}`;
  };

  // Set the default song loaded when components render first time
  const handleSetDefaultTrack = (trackId: string) => {
    localStorage.setItem("mindcare_default_track_id", trackId);
    setDefaultTrackId(trackId);
  };

  // Remove a song completely from custom playlist
  const handleDeleteTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent playing when clicking delete
    
    const updated = playlist.filter(t => t.id !== trackId);
    if (updated.length === 0) {
      alert("Sanctuary playlist cannot be empty. Please keep at least one song.");
      return;
    }
    
    setPlaylist(updated);
    
    if (currentTrack.id === trackId) {
      handleSelectTrack(updated[0]);
    }
    
    if (defaultTrackId === trackId) {
      localStorage.removeItem("mindcare_default_track_id");
      setDefaultTrackId(null);
    }
  };

  // Extract YouTube Video ID from any standard link
  const parseYoutubeId = (url: string): string | null => {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = match && match[1] ? match[1].trim() : null;
    return (id && id.length === 11) ? id : null;
  };

  // Add custom track fetched from noembed API for titles
  const handleAddCustomTrack = async () => {
    const videoId = parseYoutubeId(ytInput);
    if (!videoId) {
      alert("Invalid YouTube or YouTube Music URL. Please verify the link format.");
      return;
    }

    const exists = playlist.find(t => t.audioUrl === videoId);
    if (exists) {
      handleSelectTrack(exists);
      setYtInput("");
      setManualTitle("");
      setManualArtist("");
      return;
    }

    let title = manualTitle.trim() || "Custom YouTube Stream";
    let artist = manualArtist.trim() || "User-Added Calm Song";

    if (!manualTitle.trim() || !manualArtist.trim()) {
      try {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        if (res.ok) {
          const data = await res.json();
          if (!manualTitle.trim() && data.title) title = data.title;
          if (!manualArtist.trim() && data.author_name) artist = data.author_name;
        }
      } catch (e) {
        console.log("Noembed fetching failed, using fallback names", e);
      }
    }

    const newTrack: MusicTrack = {
      id: `custom_${Date.now()}`,
      title: title,
      artist: artist,
      audioUrl: videoId,
      duration: "0:00",
      category: "Relax",
      coverUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };

    const updatedPlaylist = [newTrack, ...playlist];
    setPlaylist(updatedPlaylist);
    handleSelectTrack(newTrack);
    setYtInput("");
    setManualTitle("");
    setManualArtist("");
  };

  // Adjust volume dynamically for both Synth and YouTube
  useEffect(() => {
    if (playerMode === "youtube" && playerRef.current && playerReadyRef.current) {
      try {
        playerRef.current.setVolume(volume);
      } catch (e) {}
    } else if (playerMode === "synth" && gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime((volume / 100) * 0.12, audioCtxRef.current.currentTime);
    }
  }, [volume, playerMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSynth();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, []);

  const categories = ["All", "Nature", "Focus", "Relax", "Sleep"];

  const filteredPlaylist = activeCategory === "All" 
    ? playlist
    : playlist.filter(t => t.category === activeCategory);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 bg-[#F8F9FA] min-h-screen pb-32" id="sonic-container">
      {/* Title Bento Card Header */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs relative overflow-hidden">
        <div>
          <span className="text-xs font-mono font-bold text-blue-600 tracking-wider uppercase">Sound Therapy</span>
          <h2 className="text-3xl font-extrabold text-gray-900 font-display mt-1">Sonic Sanctuary</h2>
          <p className="text-sm text-gray-500 mt-1.5 max-w-xl leading-relaxed">
            Immerse yourself in gentle therapeutic waveforms, simulated rain layers, and lo-fi alphas. Connect headphones for genuine binaural benefits.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0 self-start md:self-center">
          {/* Mode Selector */}
          <div className="flex bg-gray-100 border border-gray-200 rounded-2xl p-1 text-xs">
            <button
              onClick={() => {
                setPlayerMode("youtube");
                stopSynth();
              }}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                playerMode === "youtube"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube Music</span>
            </button>
            <button
              onClick={() => {
                setPlayerMode("synth");
                if (playerRef.current && playerReadyRef.current) {
                  try { playerRef.current.pauseVideo(); } catch (e) {}
                }
              }}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                playerMode === "synth"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sound Synth</span>
            </button>
          </div>

          {/* Categories toggling */}
          <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
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
      </div>

      {/* YouTube Music URL Loader */}
      {playerMode === "youtube" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 pb-4">
            <div className="flex items-center space-x-3.5 z-10">
              <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl shrink-0">
                <Youtube className="w-6 h-6 fill-red-600/10" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Stream from YouTube Music</h3>
                <p className="text-xs text-gray-400">Paste any YouTube or YouTube Music song URL to stream it directly inside your sanctuary.</p>
              </div>
            </div>
            
            <div className="flex w-full md:w-auto md:flex-1 max-w-lg gap-2 z-10">
              <input
                type="text"
                placeholder="Paste YouTube or YouTube Music URL..."
                value={ytInput}
                onChange={(e) => setYtInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomTrack(); }}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
              <button
                onClick={handleAddCustomTrack}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Load Song</span>
              </button>
            </div>
          </div>

          {/* Optional manual detail inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl pt-1">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Custom Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Kyoto Midnight Rain"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Custom Artist (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Calm Nature Beats"
                value={manualArtist}
                onChange={(e) => setManualArtist(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden YouTube Player container for persistent audio playback when not viewing video */}
      <div 
        className={`fixed pointer-events-none transition-all duration-300 z-50 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 ${
          playerMode === "youtube" && showVideo 
            ? "bottom-24 right-8 w-80 h-48 opacity-100 pointer-events-auto" 
            : "w-1 h-1 opacity-0 -bottom-96"
        }`}
      >
        <div id="youtube-player-iframe" className="w-full h-full" />
      </div>

      {/* Main recommended player screen */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Recommended Hero showcase */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden bg-gray-950 text-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 min-h-[260px] lg:aspect-video lg:min-h-0 flex flex-col justify-between shadow-xs" id="recommended-hero-showcase">
            {/* Background image overlay */}
            <div className="absolute inset-0 z-0">
              <img 
                src={currentTrack.coverUrl || "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=640&auto=format&fit=crop"} 
                alt={currentTrack.title} 
                className="w-full h-full object-cover opacity-35 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent" />
            </div>

            <div className="relative z-10 flex justify-between items-start">
              <div className="bg-white/10 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-450 fill-amber-450" />
                <span className="font-bold text-amber-300">
                  {playerMode === "youtube" ? "YouTube Stream Active" : "Therapist Recommended"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                {currentTrack.category} therapy • {currentTrack.duration}
              </span>
            </div>

            <div className="relative z-10 space-y-4">
              <div>
                <h3 className="text-xs font-mono text-blue-400 uppercase font-bold tracking-widest">Now Playing</h3>
                <h4 className="text-3xl font-extrabold font-display text-white mt-1">{currentTrack.title}</h4>
                <p className="text-xs text-gray-300 mt-1.5 max-w-md leading-relaxed">
                  {currentTrack.artist} • Soothing wave loops tuned to {currentTrack.category === 'Focus' ? 'alpha' : currentTrack.category === 'Sleep' ? 'delta' : 'theta'} frequencies.
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-white text-white" />
                      <span>Pause Sanctuary</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white text-white" />
                      <span>Immerse Now</span>
                    </>
                  )}
                </button>
                {playerMode === "youtube" && (
                  <button
                    onClick={() => setShowVideo(!showVideo)}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    {showVideo ? (
                      <>
                        <VideoOff className="w-4 h-4" />
                        <span>Hide Ambient Video</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        <span>Show Ambient Video</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Rapid grounding helper */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xxs">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-blue-900 font-display">SOS Extreme Distress Block</h4>
                <p className="text-xs text-blue-700 leading-relaxed max-w-md">Immediate high-cut 90Hz delta wave drone. Blocks out aggressive background echoes and quiets cognitive spirals inside 30 seconds.</p>
              </div>
            </div>
            <button
              onClick={() => handleSelectTrack(playlist[2] || SANCTUARY_PLAYLIST[2])}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all font-mono shrink-0 cursor-pointer shadow-xs"
            >
              Start SOS Loop
            </button>
          </div>
        </div>

        {/* Browse Soundscapes list */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs" id="all-soundscapes">
            <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">Browse Soundscapes</h3>
            
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {filteredPlaylist.map((track) => {
                const isActive = currentTrack.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer border transition-all ${
                      isActive 
                        ? "bg-blue-50/45 border-blue-600" 
                        : "bg-gray-50/60 border-gray-100 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 overflow-hidden flex-1">
                      <div className="relative shrink-0">
                        <img 
                          src={track.coverUrl} 
                          alt={track.title} 
                          className="w-11 h-11 rounded-xl object-cover border border-gray-100"
                        />
                        {isActive && isPlaying && (
                          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                            <div className="flex space-x-0.5 items-end h-3">
                              <span className="w-0.5 bg-white animate-eq-bar-1 h-3" />
                              <span className="w-0.5 bg-white animate-eq-bar-2 h-2" />
                              <span className="w-0.5 bg-white animate-eq-bar-3 h-2.5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{track.title}</h4>
                        <p className="text-[10px] text-gray-450 font-medium truncate">{track.artist}</p>
                        <span className="text-[8.5px] font-mono bg-gray-100 border border-gray-150 px-1.5 py-0.5 rounded-md font-bold text-gray-500">
                          {track.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      {/* Star Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefaultTrack(track.id);
                        }}
                        title={defaultTrackId === track.id ? "Default Track (Starred)" : "Set as Default Track"}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          defaultTrackId === track.id 
                            ? "text-amber-500 hover:scale-105" 
                            : "text-gray-300 hover:text-amber-500 hover:bg-gray-100"
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${defaultTrackId === track.id ? "fill-amber-500" : ""}`} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteTrack(track.id, e)}
                        title="Remove Track"
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-650 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Persistent global audio player bar fixed at bottom */}
      <div className="fixed bottom-4 left-4 right-4 lg:left-72 lg:right-8 bg-gray-900 text-gray-50 border border-gray-800 rounded-[1.5rem] py-4 px-6 flex flex-col md:flex-row justify-between items-center gap-4 z-40 shadow-2xl" id="global-player-bar">
        
        {/* Track Details */}
        <div className="flex items-center space-x-3.5 w-full md:w-1/4">
          <img 
            src={currentTrack.coverUrl} 
            alt={currentTrack.title} 
            className="w-12 h-12 rounded-xl object-cover border border-white/10 hidden sm:block"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-extrabold text-white truncate leading-snug">{currentTrack.title}</h4>
            <p className="text-[10px] text-gray-450 truncate">{currentTrack.artist}</p>
            <span className="text-[8px] font-mono font-bold tracking-wider text-blue-400 bg-white/5 border border-white/5 rounded-md px-1.5 py-0.2 mt-0.5 inline-block uppercase">
              {playerMode === "youtube" ? "YouTube Music Stream" : `${currentTrack.category} Synth Tone`}
            </span>
          </div>
        </div>

        {/* Player controls */}
        <div className="flex flex-col items-center gap-2 w-full md:w-2/5">
          <div className="flex items-center space-x-6">
            <button onClick={handleSkipPrev} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4.5 h-4.5 fill-gray-900" />
              ) : (
                <Play className="w-4.5 h-4.5 fill-gray-900 ml-0.5" />
              )}
            </button>
            <button onClick={handleSkipNext} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Slider */}
          <div className="flex items-center space-x-2.5 w-full text-[9px] font-mono text-gray-400">
            <span>{playerMode === "youtube" ? formatTime(currentTimeDisplay) : formatTime((playProgress / 100) * 600)}</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = ((e.clientX - rect.left) / rect.width) * 100;
              handleSeek(percent);
            }}>
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${playProgress}%` }} />
            </div>
            <span>{playerMode === "youtube" && durationDisplay > 0 ? formatTime(durationDisplay) : currentTrack.duration}</span>
          </div>
        </div>

        {/* Volume & notification status */}
        <div className="flex items-center space-x-4 w-full md:w-1/4 justify-end">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 sm:w-20 accent-blue-500 cursor-pointer"
            />
          </div>
          <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-sm text-blue-400 font-bold uppercase animate-pulse">
            ● {playerMode === "youtube" ? "YouTube Active" : "Synthesizer active"}
          </span>
        </div>

      </div>
    </div>
  );
}
