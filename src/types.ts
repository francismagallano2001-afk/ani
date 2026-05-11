export interface User {
  id: string;
  username: string;
  role: 'student' | 'teacher';
  points: number;
  level: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  environment: string;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  category: string;
  hint?: string;
}

export interface ScoreEntry {
  username: string;
  points: number;
  level: number;
}
