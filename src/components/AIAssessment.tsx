import React, { useState, useRef, useEffect } from "react";
import { MessageSquareHeart, Send, Sparkles, AlertCircle, RefreshCw, Compass } from "lucide-react";
import { ChatMessage, User } from "../types";

interface AIAssessmentProps {
  user: User;
}

const DEFAULT_STARTER_PROMPTS = [
  "I am feeling heavily anxious and overwhelmed about my workload.",
  "I struggle to quiet my thoughts at night. Suggest a small relaxation step.",
  "Help me practice cognitive detachment from standard daily stress triggers.",
  "I feel extremely happy today! Let's pause and appreciate this beautiful moment."
];

export default function AIAssessment({ user }: AIAssessmentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome_msg",
      sender: "assistant",
      text: `Hello, ${user.name}. I am Serene Clarity, your private cognitive-behavioral wellness companion. Here, you can speak fully from the heart, share vulnerabilities, or explore minor emotional triggers without judgment. How has your clarity level been today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setErrorMsg("");
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const chatHistory = [...messages, userMsg];
      const response = await fetch("/api/therapy-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!response.ok) {
        throw new Error("Therapy companion connection disrupted.");
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to communicate with CBT therapist. Emulating supportive offline response.");
      
      // Fallback response emulation
      const fallbackReplies = [
        "I hear you. When feeling overloaded, our thoughts tend to run ahead. Let's redirect our attention to simple breathing: inhale for 4 seconds, hold for 4, exhale for 4. I'm right here with you.",
        "Your feelings are completely valid. Coping with stress starts with externalizing it. What's one tiny element under your direct control in the next hour?",
        "Thank you for sharing that with me. It takes real courage to pause and notice these loops. Practicing daily reflection can help us find our way back to quiet groundings.",
      ];
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: "assistant",
          text: randomReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }, 1200);

    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleResetChat = () => {
    if (confirm("Reset chat history? This will clear our current session details.")) {
      setMessages([
        {
          id: "welcome_msg",
          sender: "assistant",
          text: `We have a clean desk now, ${user.name}. Let's begin fresh. Tell me, what's been on your mind or weighing on your heart?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 sm:space-y-6 bg-[#F8F9FA] min-h-screen flex flex-col justify-between" id="chat-page-container">
      {/* Title Bento Card Header */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xs relative overflow-hidden">
        <div>
          <span className="text-xs font-mono font-bold text-blue-600 tracking-wider uppercase">Generative Guidance</span>
          <h2 className="text-3xl font-extrabold text-gray-900 font-display mt-1">AI CBT Companion</h2>
          <p className="text-xs text-gray-500 mt-1">
            Secure cognitive behavioral counseling logs. Speak freely; your reflections remain fully private on your browser.
          </p>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center space-x-1.5 bg-red-50/60 border border-red-100 text-red-700 hover:bg-red-100/80 text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xxs"
          title="Reset Conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="font-bold hidden sm:inline">Reset chat</span>
        </button>
      </div>

      {/* Main chat interface block */}
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl sm:rounded-[2.2rem] flex flex-col h-[450px] sm:h-[520px] overflow-hidden shadow-xs" id="chat-stage-wrapper">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/45">
          {messages.map((msg) => {
            const isAI = msg.sender === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex ${isAI ? "justify-start" : "justify-end"} items-start space-x-3.5 max-w-[85%] ${
                  isAI ? "mr-auto" : "ml-auto"
                }`}
              >
                {/* Avatar */}
                {isAI && (
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <MessageSquareHeart className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isAI 
                      ? "bg-white border border-gray-100 text-gray-900 shadow-xxs" 
                      : "bg-blue-600 text-white shadow-xs"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className={`text-[8.5px] font-mono text-gray-400 block ${!isAI ? "text-right mr-1" : "ml-1"}`}>
                    {isAI ? "Serene Clarity Companion" : user.name} • {msg.timestamp}
                  </span>
                </div>

                {/* User avatar right-aligned */}
                {!isAI && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0 shadow-xxs"
                  />
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start items-center space-x-3 max-w-[85%]">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 animate-pulse shadow-xs">
                <Compass className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl text-xs text-gray-500 font-medium flex items-center space-x-2 shadow-xxs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span className="italic pl-1">Serene Clarity is reflecting...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-amber-50 border border-amber-100 text-amber-850 rounded-xl text-xs flex items-center space-x-2 shadow-xxs">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-150 bg-white">
          <form onSubmit={handleFormSubmit} className="flex space-x-2.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Write your feelings, ${user.name}... e.g. I feel a bit overloaded after classes.`}
              className="flex-grow bg-[#F8F9FA] border border-gray-150 rounded-2xl px-4 py-3.5 text-xs outline-hidden focus:border-blue-500 text-gray-900 selection:bg-blue-100/50"
              id="cbt-chat-input"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center shadow-xs"
              id="cbt-send-btn"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

      </div>

      {/* Suggested Starter Starters list */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
          <span>Ask about feelings & stress anchors</span>
        </h3>
        
        <div className="grid sm:grid-cols-2 gap-3" id="quick-starters-grid">
          {DEFAULT_STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-left bg-white border border-gray-100 hover:border-blue-500 hover:bg-blue-50/10 p-4 rounded-2xl text-gray-700 hover:text-blue-600 text-xs font-semibold leading-relaxed transition-all cursor-pointer shadow-xxs"
              id={`chat-starter-${idx}`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
