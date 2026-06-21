export interface User {
  email: string;
  name: string;
  avatar: string;
  bio: string;
  streak: number;
  totalMinutes: number;
  joinedDate: string;
  isPro: boolean;
}

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  value: number; // 1 to 5 (1: Overwhelmed, 2: Unsettled, 3: Balanced, 4: Peaceful, 5: Radiant)
  name: string; // Text summary
  note: string;
  factors: string[]; // ['Sleep', 'Work', 'Social', 'Exercise', 'Diet']
  timestamp: string;
  analysis?: {
    stabilityIndex: number; // 0-100
    primaryStressors: string[];
    sentimentScore: string;
    advice: string;
  };
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  moodValue: number;
  timestamp: string;
  analysis?: {
    emotionalTone: string;
    underlyingThemes: string[];
    copingStrategies: string[];
    psychologicalInsight: string;
  };
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  duration: string;
  category: 'Focus' | 'Relax' | 'Sleep' | 'Nature';
  coverUrl: string;
}

export interface Exercise {
  id: string;
  title: string;
  duration: string;
  category: 'Breathing' | 'Meditation' | 'Yoga' | 'SOS';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  instructionSteps: string[];
}

export interface Quote {
  text: string;
  author: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
