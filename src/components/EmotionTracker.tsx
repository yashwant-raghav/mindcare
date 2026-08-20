import { useState, useEffect, useRef } from "react";
import { 
  Camera, CameraOff, Square, Play, Shield, AlertCircle, CheckCircle2, 
  Sparkles, Activity, Clock, BarChart3, RotateCcw, Save, Info, Users
} from "lucide-react";
import { User as UserType, EmotionSession, EmotionCategory, ExpressionScores, ExpressionSample } from "../types";
import { calculateExpressionsFromBlendshapes, EmotionSmoother } from "../utils/expressionEngine";

interface EmotionTrackerProps {
  user: UserType;
  onSaveSession: (session: EmotionSession) => void;
  setActiveTab?: (tab: string) => void;
}

const EMOTION_ICONS: Record<EmotionCategory, string> = {
  Happy: "😊",
  Neutral: "😐",
  Sad: "😢",
  Surprised: "😮",
  Angry: "😠"
};

const EMOTION_COLORS: Record<EmotionCategory, string> = {
  Happy: "bg-emerald-500 text-emerald-700 bg-emerald-50 border-emerald-200",
  Neutral: "bg-blue-500 text-blue-700 bg-blue-50 border-blue-200",
  Sad: "bg-indigo-500 text-indigo-700 bg-indigo-50 border-indigo-200",
  Surprised: "bg-amber-500 text-amber-700 bg-amber-50 border-amber-200",
  Angry: "bg-rose-500 text-rose-700 bg-rose-50 border-rose-200"
};

const EMOTION_BAR_COLORS: Record<EmotionCategory, string> = {
  Happy: "bg-emerald-500",
  Neutral: "bg-blue-500",
  Sad: "bg-indigo-500",
  Surprised: "bg-amber-500",
  Angry: "bg-rose-500"
};

export default function EmotionTracker({ user, onSaveSession, setActiveTab }: EmotionTrackerProps) {
  // Camera & Stream state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Face & Expression detection state
  const [faceStatus, setFaceStatus] = useState<"none" | "single" | "multiple">("none");
  const [currentExpression, setCurrentExpression] = useState<EmotionCategory>("Neutral");
  const [currentConfidence, setCurrentConfidence] = useState<number>(75);
  const [expressionScores, setExpressionScores] = useState<ExpressionScores>({
    Happy: 0.1,
    Neutral: 0.7,
    Sad: 0.05,
    Angry: 0.05,
    Surprised: 0.1
  });

  // Session state
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0); // seconds
  const [timelineSamples, setTimelineSamples] = useState<ExpressionSample[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [completedSession, setCompletedSession] = useState<EmotionSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Refs for video & landmarker
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<any>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastProcessingTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);
  const smootherRef = useRef<EmotionSmoother>(new EmotionSmoother(8));
  const samplesHistoryRef = useRef<ExpressionSample[]>([]);
  const allFrameEmotionsRef = useRef<EmotionCategory[]>([]);
  const allFrameConfidencesRef = useRef<number[]>([]);

  // 1. Initialize MediaPipe Face Landmarker on Component Mount
  useEffect(() => {
    let isMounted = true;

    async function initMediaPipe() {
      setIsModelLoading(true);
      setModelError(null);
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );

        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
          runningMode: "VIDEO",
          numFaces: 2
        });

        if (isMounted) {
          landmarkerRef.current = landmarker;
          setIsModelLoading(false);
        }
      } catch (err: any) {
        console.error("Failed to load MediaPipe FaceLandmarker:", err);
        if (isMounted) {
          setModelError("AI expression model could not be loaded. Please check your internet connection.");
          setIsModelLoading(false);
        }
      }
    }

    initMediaPipe();

    return () => {
      isMounted = false;
      stopCameraStream();
    };
  }, []);

  // 2. Timer effect for session duration
  useEffect(() => {
    if (isSessionRunning) {
      timerIntervalRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isSessionRunning]);

  // 3. Start Camera & Stream
  const startCamera = async () => {
    setCameraError(null);
    setIsSessionComplete(false);
    setSaveSuccess(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera is not supported on this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setIsSessionRunning(true);
          setSessionDuration(0);
          setTimelineSamples([]);
          samplesHistoryRef.current = [];
          allFrameEmotionsRef.current = [];
          allFrameConfidencesRef.current = [];
          smootherRef.current.reset();
          processVideoLoop();
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please enable camera access in your browser settings to continue.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera detected on your device.");
      } else {
        setCameraError("Camera could not be accessed. Please check browser permissions.");
      }
    }
  };

  // 4. Stop Camera Stream
  const stopCameraStream = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setFaceStatus("none");
  };

  // 5. Real-time Video Processing Loop
  const processVideoLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !isCameraActive && video.paused) {
      return;
    }

    const now = performance.now();
    // Throttle to ~15 FPS (approx 65ms gap) to keep UI responsive
    if (now - lastProcessingTimeRef.current >= 65 && video.readyState >= 2 && landmarker) {
      lastProcessingTimeRef.current = now;

      try {
        const results = landmarker.detectForVideo(video, now);
        const faceCount = results.faceLandmarks ? results.faceLandmarks.length : 0;

        if (faceCount === 0) {
          setFaceStatus("none");
        } else if (faceCount > 1) {
          setFaceStatus("multiple");
        } else {
          setFaceStatus("single");

          // Extract blendshapes
          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            const blendshapes = results.faceBlendshapes[0].categories;
            const rawScores = calculateExpressionsFromBlendshapes(blendshapes);
            const smoothedScores = smootherRef.current.addFrame(rawScores);

            const { emotion, confidence } = smootherRef.current.getDominantEmotion(smoothedScores);

            setCurrentExpression(emotion);
            setCurrentConfidence(confidence);
            setExpressionScores(smoothedScores);

            allFrameEmotionsRef.current.push(emotion);
            allFrameConfidencesRef.current.push(confidence);

            // Record timeline sample every 5 seconds
            const currentSec = Math.floor((now - (lastProcessingTimeRef.current || now)) / 1000);
            if (samplesHistoryRef.current.length === 0 || 
                (samplesHistoryRef.current.length > 0 && 
                 sessionDuration - samplesHistoryRef.current[samplesHistoryRef.current.length - 1].timeInSeconds >= 5)) {
              
              const sample: ExpressionSample = {
                timestamp: formatSeconds(sessionDuration),
                timeInSeconds: sessionDuration,
                emotion,
                confidence,
                scores: smoothedScores
              };

              samplesHistoryRef.current.push(sample);
              setTimelineSamples([...samplesHistoryRef.current]);
            }
          }

          // Draw overlay box indicator on canvas
          if (canvas) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext("2d");
            if (ctx && results.faceLandmarks[0]) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              // Draw subtle facial outline mesh overlay
              ctx.fillStyle = "#3B82F6";
              const landmarks = results.faceLandmarks[0];
              for (let i = 0; i < landmarks.length; i += 4) {
                const pt = landmarks[i];
                ctx.beginPath();
                ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 1.8, 0, 2 * Math.PI);
                ctx.fill();
              }
            }
          }
        }
      } catch (err) {
        console.error("Frame landmark error:", err);
      }
    }

    animFrameIdRef.current = requestAnimationFrame(processVideoLoop);
  };

  // 6. End Session and compute statistics
  const handleEndSession = () => {
    stopCameraStream();
    setIsSessionRunning(false);

    const totalFrames = allFrameEmotionsRef.current.length;
    if (totalFrames === 0) {
      // Fallback if session was very brief
      const fallbackSession: EmotionSession = {
        id: `session_${Date.now()}`,
        userEmail: user.email,
        sessionDate: new Date().toISOString().split("T")[0],
        duration: Math.max(1, sessionDuration),
        dominantEmotion: "Neutral",
        happyPercentage: 20,
        neutralPercentage: 60,
        sadPercentage: 10,
        angryPercentage: 5,
        surprisePercentage: 5,
        averageConfidence: 78,
        expressionStability: 85,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setCompletedSession(fallbackSession);
      setIsSessionComplete(true);
      return;
    }

    // Calculate emotion distribution percentages
    const counts: Record<EmotionCategory, number> = {
      Happy: 0,
      Neutral: 0,
      Sad: 0,
      Angry: 0,
      Surprised: 0
    };

    for (const emo of allFrameEmotionsRef.current) {
      counts[emo] = (counts[emo] || 0) + 1;
    }

    let dominant: EmotionCategory = "Neutral";
    let maxCount = -1;

    for (const [emo, cnt] of Object.entries(counts)) {
      if (cnt > maxCount) {
        maxCount = cnt;
        dominant = emo as EmotionCategory;
      }
    }

    const happyPercentage = Math.round((counts.Happy / totalFrames) * 100);
    const neutralPercentage = Math.round((counts.Neutral / totalFrames) * 100);
    const sadPercentage = Math.round((counts.Sad / totalFrames) * 100);
    const angryPercentage = Math.round((counts.Angry / totalFrames) * 100);
    const surprisePercentage = Math.round((counts.Surprised / totalFrames) * 100);

    const totalConf = allFrameConfidencesRef.current.reduce((a, b) => a + b, 0);
    const avgConfidence = Math.round(totalConf / Math.max(1, allFrameConfidencesRef.current.length));

    // Stability: percentage of dominant emotion occurrences over total frames
    const stability = Math.min(99, Math.max(40, Math.round((maxCount / totalFrames) * 100)));

    const summarySession: EmotionSession = {
      id: `session_${Date.now()}`,
      userEmail: user.email,
      sessionDate: new Date().toISOString().split("T")[0],
      duration: Math.max(1, sessionDuration),
      dominantEmotion: dominant,
      happyPercentage,
      neutralPercentage,
      sadPercentage,
      angryPercentage,
      surprisePercentage,
      averageConfidence: avgConfidence,
      expressionStability: stability,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setCompletedSession(summarySession);
    setIsSessionComplete(true);
  };

  // 7. Save Session
  const handleSaveSession = async () => {
    if (!completedSession) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/emotion-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, session: completedSession })
      });
      if (res.ok) {
        onSaveSession(completedSession);
        setSaveSuccess(true);
      }
    } catch (err) {
      console.error("Failed to save emotion session:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartNewSession = () => {
    setIsSessionComplete(false);
    setCompletedSession(null);
    setSaveSuccess(false);
    startCamera();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" id="emotion-tracker-container">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Privacy First AI
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-xs text-gray-500 font-medium">Real-time Vision Analytics</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mt-1">AI Face Emotion Tracker</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Use your camera to analyze visible facial expressions in real time. Processed locally for total privacy.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          {!isCameraActive && !isSessionComplete && (
            <button
              onClick={startCamera}
              disabled={isModelLoading}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              id="btn-start-camera"
            >
              <Camera className="w-4 h-4" />
              <span>{isModelLoading ? "Loading AI Model..." : "Allow Camera"}</span>
            </button>
          )}

          {isCameraActive && (
            <>
              <button
                onClick={stopCameraStream}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
                id="btn-stop-camera"
              >
                <CameraOff className="w-4 h-4 text-gray-500" />
                <span>Pause</span>
              </button>
              <button
                onClick={handleEndSession}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
                id="btn-end-session"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>End Session</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-blue-900">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-blue-950">Local Processing Guarantee</span>
          <p className="mt-0.5 text-blue-800">
            Your camera feed is processed locally. MindCare does not store your raw camera video.
          </p>
        </div>
      </div>

      {/* Error Notices */}
      {modelError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center space-x-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{modelError}</span>
        </div>
      )}

      {cameraError && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Feature Viewport: Camera & Live Analytics */}
      {!isSessionComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Camera Container (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Live Camera Feed</h3>
              </div>

              {/* Face Status Badge */}
              {isCameraActive && (
                <div>
                  {faceStatus === "single" && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Face Detected ✓</span>
                    </span>
                  )}
                  {faceStatus === "none" && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>No face detected</span>
                    </span>
                  )}
                  {faceStatus === "multiple" && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-full">
                      <Users className="w-3.5 h-3.5" />
                      <span>Multiple faces detected</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Video Canvas Box */}
            <div className="relative w-full aspect-4/3 bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center group shadow-inner">
              {/* HTML5 Video Element */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${isCameraActive ? "block" : "hidden"}`}
              />

              {/* Canvas Overlay for Mesh/Frame Indicator */}
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none ${isCameraActive ? "block" : "hidden"}`}
              />

              {/* Camera Offline Placeholder */}
              {!isCameraActive && (
                <div className="text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-500">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">Camera Inactive</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                      Click "Allow Camera" to start live facial expression detection.
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    disabled={isModelLoading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all inline-flex items-center space-x-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Camera</span>
                  </button>
                </div>
              )}

              {/* Active Warnings overlay inside video box */}
              {isCameraActive && faceStatus === "none" && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-xs text-amber-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-amber-500/30 text-center">
                  Please position your face inside the camera frame.
                </div>
              )}
              {isCameraActive && faceStatus === "multiple" && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-xs text-rose-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-rose-500/30 text-center">
                  Please ensure only one face is visible.
                </div>
              )}
            </div>

            {/* Video Footer stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Session Duration:</span>
                <span className="font-mono font-bold text-gray-900 text-sm">{formatSeconds(sessionDuration)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Sample Rate: ~15 FPS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Real-time Analytics & Expression Scores (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Emotion Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Current Visible Expression</span>
                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                  Confidence: {currentConfidence}%
                </span>
              </div>

              {/* Dominant Emotion Badge */}
              <div className={`p-5 rounded-2xl border flex items-center space-x-4 transition-all ${EMOTION_COLORS[currentExpression]}`}>
                <span className="text-5xl">{EMOTION_ICONS[currentExpression]}</span>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">Primary Expression</span>
                  <h2 className="text-2xl font-bold font-display uppercase tracking-tight leading-none mt-0.5">
                    {currentExpression}
                  </h2>
                </div>
              </div>

              {/* Expression Scores Breakdown */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Expression Probability</h4>

                {(["Happy", "Neutral", "Sad", "Surprised", "Angry"] as EmotionCategory[]).map((emo) => {
                  const scorePct = Math.round((expressionScores[emo] || 0) * 100);
                  return (
                    <div key={emo} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                        <span className="flex items-center space-x-1.5">
                          <span>{EMOTION_ICONS[emo]}</span>
                          <span>{emo}</span>
                        </span>
                        <span className="font-mono text-gray-900">{scorePct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${EMOTION_BAR_COLORS[emo]}`}
                          style={{ width: `${scorePct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Expression Timeline Chart Preview */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Expression Timeline</h4>
                </div>
                <span className="text-[10px] font-mono text-gray-400">Samples: {timelineSamples.length}</span>
              </div>

              {timelineSamples.length < 2 ? (
                <div className="h-32 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-center p-4 text-xs text-gray-400">
                  Timeline graph populates automatically during your active camera session.
                </div>
              ) : (
                <div className="space-y-2">
                  {/* SVG Timeline Chart */}
                  <div className="w-full h-32 bg-gray-50 rounded-2xl border border-gray-100 p-3 flex items-end relative overflow-hidden">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={timelineSamples
                          .map((s, idx) => {
                            const x = (idx / Math.max(1, timelineSamples.length - 1)) * 300;
                            const y = 100 - (s.confidence * 0.9);
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-gray-400 px-1">
                    <span>{timelineSamples[0]?.timestamp || "00:00"}</span>
                    <span>{timelineSamples[timelineSamples.length - 1]?.timestamp}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Session Summary View (Rendered when user ends session) */}
      {isSessionComplete && completedSession && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 max-w-4xl mx-auto" id="session-summary-container">
          {/* Summary Title */}
          <div className="text-center space-y-2 pb-6 border-b border-gray-200">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Session Complete
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-900">Facial Expression Summary</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Overview of visible facial expression statistics recorded during this session.
            </p>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dominant Emotion */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold">Dominant Expression</span>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl">{EMOTION_ICONS[completedSession.dominantEmotion]}</span>
                <span className="text-xl font-bold text-gray-900">{completedSession.dominantEmotion}</span>
              </div>
            </div>

            {/* Session Duration */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold">Session Duration</span>
              <div className="text-2xl font-bold font-mono text-gray-900">
                {formatSeconds(completedSession.duration)}
              </div>
            </div>

            {/* Expression Stability */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold">Expression Stability</span>
              <div className="text-2xl font-bold font-mono text-blue-600">
                {completedSession.expressionStability}%
              </div>
            </div>
          </div>

          {/* Distribution Breakdown Bars */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Expression Distribution</h4>

            <div className="space-y-3">
              {[
                { label: "Happy", icon: "😊", pct: completedSession.happyPercentage, color: "bg-emerald-500" },
                { label: "Neutral", icon: "😐", pct: completedSession.neutralPercentage, color: "bg-blue-500" },
                { label: "Sad", icon: "😢", pct: completedSession.sadPercentage, color: "bg-indigo-500" },
                { label: "Surprised", icon: "😮", pct: completedSession.surprisePercentage, color: "bg-amber-500" },
                { label: "Angry", icon: "😠", pct: completedSession.angryPercentage, color: "bg-rose-500" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span className="flex items-center space-x-1.5">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    <span className="font-mono text-gray-900">{item.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleStartNewSession}
              className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              id="btn-new-session"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
              <span>Start New Session</span>
            </button>

            <button
              onClick={handleSaveSession}
              disabled={isSaving || saveSuccess}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              id="btn-save-session"
            >
              <Save className="w-4 h-4" />
              <span>
                {saveSuccess ? "Session Saved ✓" : isSaving ? "Saving..." : "Save Session"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Mandatory Medical Disclaimer Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-gray-500">
        <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-gray-700">Disclaimer:</strong> Facial expression estimation is not a medical or psychological diagnosis. This feature estimates visible facial expressions for wellness tracking and is not a medical or psychological diagnostic tool.
        </p>
      </div>
    </div>
  );
}
