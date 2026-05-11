import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Gamepad2, 
  Trophy, 
  User as UserIcon, 
  ChevronRight, 
  Home, 
  Settings,
  Star,
  Award,
  LogOut,
  LayoutDashboard,
  HelpCircle
} from 'lucide-react';
import { User, Lesson, Quiz, ScoreEntry } from './types';

// --- Constants & Helpers ---

const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'
};

const playSound = (type: 'correct' | 'wrong') => {
  const audio = new Audio(SOUNDS[type]);
  audio.volume = 0.5;
  audio.play().catch(e => console.warn('Audio play blocked by browser policy:', e));
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- Components ---

const Navbar = ({ user, onLogout, onNavigate }: { user: User | null, onLogout: () => void, onNavigate: (page: string) => void }) => (
  <nav className="bg-white/80 backdrop-blur-md border-b border-zinc-200/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
      <div className="bg-emerald-500 p-2 rounded-lg">
        <Gamepad2 className="text-white w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-zinc-900">AniClass</h1>
    </div>
    
    {user && (
      <div className="flex items-center gap-6">
        <button onClick={() => onNavigate('home')} className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-2 font-medium">
          <Home size={18} />
          <span className="hidden sm:inline">Home</span>
        </button>
        <button onClick={() => onNavigate('leaderboard')} className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-2 font-medium">
          <Trophy size={18} />
          <span className="hidden sm:inline">Leaderboard</span>
        </button>
        {user.role === 'teacher' && (
          <button onClick={() => onNavigate('admin')} className="text-zinc-600 hover:text-emerald-600 transition-colors flex items-center gap-2 font-medium">
            <LayoutDashboard size={18} />
            <span className="hidden sm:inline">Teacher Panel</span>
          </button>
        )}
        <div className="flex items-center gap-3 pl-6 border-l border-zinc-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-zinc-900">{user.username}</p>
            <p className="text-xs text-zinc-500">Level {user.level} Explorer</p>
          </div>
          <button onClick={onLogout} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    )}
  </nav>
);

const Login = ({ onLogin, externalError }: { onLogin: (username: string) => void, externalError?: string | null }) => {
  const [name, setName] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const displayError = loginError || externalError;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 w-full max-w-md text-center"
      >
        <div className="bg-emerald-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <UserIcon className="text-emerald-600 w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">Welcome Explorer!</h2>
        <p className="text-zinc-500 mb-8">Enter your name to start your animal classification adventure.</p>
        
        {displayError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium">
            {displayError}
          </div>
        )}

        <input 
          type="text" 
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setLoginError(null);
          }}
          placeholder="Your Name"
          className="w-full px-6 py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4 text-lg"
        />
        <button 
          onClick={() => {
            if (name.trim()) {
              onLogin(name.trim());
            } else {
              setLoginError("Please enter your name first!");
            }
          }}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 mb-8"
        >
          Start Adventure
        </button>
      </motion.div>
    </div>
  );
};

const HomeView = ({ user, onNavigate }: { user: User, onNavigate: (page: string) => void }) => {
  const environments = [
    { id: 'forest', name: 'Forest World', icon: '🌲', color: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', hover: 'hover:border-emerald-300', desc: 'Mammals & Reptiles' },
    { id: 'ocean', name: 'Ocean World', icon: '🌊', color: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', hover: 'hover:border-blue-300', desc: 'Fish & Marine Life' },
    { id: 'sky', name: 'Sky World', icon: '☁️', color: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100', hover: 'hover:border-sky-300', desc: 'Birds & Flying Animals' },
    { id: 'farm', name: 'Farm World', icon: '🚜', color: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', hover: 'hover:border-amber-300', desc: 'Domestic Animals' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-12">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-zinc-900 mb-4"
        >
          Hello, {user.username}! 👋
        </motion.h2>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-6 py-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Star className="text-amber-600 fill-amber-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Points</p>
              <p className="text-xl font-black text-zinc-900">{user.points}</p>
            </div>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Award className="text-emerald-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Current Level</p>
              <p className="text-xl font-black text-zinc-900">{user.level}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mb-12">
        <h3 className="text-2xl font-bold text-zinc-900 mb-6">Your Badges</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[
            { name: 'Explorer', icon: '🧭', earned: true },
            { name: 'Quiz Master', icon: '🧠', earned: user.points >= 100 },
            { name: 'Puzzle Solver', icon: '🧩', earned: user.points >= 200 },
            { name: 'Animal Master', icon: '👑', earned: user.level >= 4 },
          ].map((badge, i) => (
            <div 
              key={i} 
              className={`flex-shrink-0 w-32 h-40 rounded-3xl border-2 flex flex-col items-center justify-center p-4 transition-all ${badge.earned ? 'bg-white border-emerald-100 shadow-sm' : 'bg-zinc-100 border-zinc-200 opacity-40 grayscale'}`}
            >
              <div className="text-4xl mb-3">{badge.icon}</div>
              <p className="text-xs font-bold text-center text-zinc-900">{badge.name}</p>
              {badge.earned && <div className="mt-2 bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Earned</div>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-zinc-900 mb-6">Choose Your Environment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {environments.map((env, idx) => (
            <motion.div
              key={env.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => onNavigate(`env-${env.id}`)}
              className={`bg-white p-8 rounded-[2rem] border-2 ${env.border} ${env.hover} shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden`}
            >
              <div className={`absolute -right-4 -top-4 w-24 h-24 ${env.color} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`} />
              
              <div className={`${env.color} w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-8 group-hover:rotate-12 transition-transform shadow-inner`}>
                {env.icon}
              </div>
              <h4 className="text-2xl font-black text-zinc-900 mb-2">{env.name}</h4>
              <p className="text-zinc-500 font-medium mb-8 leading-relaxed">{env.desc}</p>
              
              <div className={`flex items-center ${env.text} font-black text-sm uppercase tracking-wider`}>
                Explore Now <ChevronRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const LessonView = ({ envId, onComplete }: { envId: string, onComplete: () => void }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const getTheme = () => {
    switch(envId.toLowerCase()) {
      case 'forest': return { primary: 'bg-emerald-600', secondary: 'text-emerald-200', btn: 'bg-emerald-600 hover:bg-emerald-700' };
      case 'ocean': return { primary: 'bg-blue-600', secondary: 'text-blue-200', btn: 'bg-blue-600 hover:bg-blue-700' };
      case 'sky': return { primary: 'bg-sky-500', secondary: 'text-sky-100', btn: 'bg-sky-500 hover:bg-sky-600' };
      case 'farm': return { primary: 'bg-amber-600', secondary: 'text-amber-100', btn: 'bg-amber-600 hover:bg-amber-700' };
      default: return { primary: 'bg-emerald-600', secondary: 'text-emerald-200', btn: 'bg-emerald-600 hover:bg-emerald-700' };
    }
  };

  const theme = getTheme();

  useEffect(() => {
    fetch('/api/lessons')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch lessons');
        return res.json();
      })
      .then(data => {
        const filtered = data.filter((l: Lesson) => l.environment.toLowerCase() === envId.toLowerCase());
        setLessons(filtered);
      })
      .catch(err => console.error('Failed to fetch lessons:', err));
  }, [envId]);

  if (lessons.length === 0) return <div className="p-12 text-center">Loading lesson...</div>;

  const lesson = lessons[currentStep];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100"
      >
        <div className={`${theme.primary} p-8 text-white`}>
          <p className={`${theme.secondary} font-bold uppercase tracking-widest text-xs mb-2`}>Interactive Lesson</p>
          <h2 className="text-3xl font-black">{lesson.title}</h2>
        </div>
        <div className="p-10">
          <div className="prose prose-lg max-w-none text-zinc-700 leading-relaxed mb-10">
            {lesson.content}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {lessons.map((_, i) => (
                <div key={i} className={`h-2 w-8 rounded-full ${i === currentStep ? theme.primary : 'bg-zinc-200'}`} />
              ))}
            </div>
            {currentStep < lessons.length - 1 ? (
              <button 
                onClick={() => setCurrentStep(s => s + 1)}
                className={`${theme.btn} text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2`}
              >
                Next Step <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={onComplete}
                className={`${theme.btn} text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2`}
              >
                Start Activity <Gamepad2 size={20} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const QuizGame = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setShowHint(false);
  }, [currentIdx]);

  useEffect(() => {
    fetch('/api/quizzes')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch quizzes');
        return res.json();
      })
      .then((data: Quiz[]) => {
        const shuffledQuizzes = shuffleArray(data).map(q => ({
          ...q,
          options: shuffleArray(q.options)
        }));
        setQuizzes(shuffledQuizzes);
      })
      .catch(err => console.error('Failed to fetch quizzes:', err));
  }, []);

  useEffect(() => {
    if (quizzes.length === 0 || finished || isRevealing) return;

    if (timeLeft === 0) {
      handleAnswer(null);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizzes.length, finished, isRevealing]);

  const handleAnswer = (option: string | null) => {
    if (isRevealing) return;
    
    setIsRevealing(true);
    setSelectedOption(option);

    const isCorrect = option === quizzes[currentIdx].correct_answer;
    
    if (isCorrect) {
      setScore(s => s + 20);
      playSound('correct');
    } else {
      playSound('wrong');
    }

    setTimeout(() => {
      if (currentIdx < quizzes.length - 1) {
        setCurrentIdx(i => i + 1);
        setTimeLeft(30);
        setIsRevealing(false);
        setSelectedOption(null);
      } else {
        setFinished(true);
      }
    }, 2000);
  };

  if (quizzes.length === 0) return <div className="p-12 text-center">Loading quiz...</div>;

  if (finished) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-3xl shadow-xl border border-zinc-100">
          <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="text-amber-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-zinc-900 mb-2">Quiz Complete!</h2>
          <p className="text-zinc-500 mb-8 text-lg">You earned <span className="text-emerald-600 font-bold">{score} points</span></p>
          <button 
            onClick={() => onComplete(score)}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all"
          >
            Claim Rewards
          </button>
        </motion.div>
      </div>
    );
  }

  const quiz = quizzes[currentIdx];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <p className="text-zinc-500 font-bold">Question {currentIdx + 1} of {quizzes.length}</p>
          <div className="w-48 h-2 bg-zinc-200 rounded-full mt-2 overflow-hidden">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 30) * 100}%` }}
              className={`h-full ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
            />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full font-bold text-sm">
            Score: {score}
          </div>
          <div className={`text-xl font-black ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-zinc-400'}`}>
            {timeLeft}s
          </div>
        </div>
      </div>
      <motion.div 
        key={currentIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-10 rounded-3xl shadow-xl border border-zinc-100"
      >
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-bold text-zinc-900">{quiz.question}</h3>
          {quiz.hint && (
            <button 
              onClick={() => setShowHint(!showHint)}
              className={`p-2 rounded-xl transition-all ${showHint ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-400 hover:bg-amber-50 hover:text-amber-500'}`}
              title="Need a hint?"
            >
              <HelpCircle size={24} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showHint && quiz.hint && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                <Star className="text-amber-500 shrink-0 mt-1" size={16} />
                <p className="text-amber-800 text-sm italic font-medium">
                  Hint: {quiz.hint}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-4">
          {quiz.options.map((opt, i) => {
            const isCorrect = opt === quiz.correct_answer;
            const isSelected = opt === selectedOption;
            
            let btnClass = "border-zinc-100 hover:border-emerald-500 hover:bg-emerald-50";
            if (isRevealing) {
              if (isCorrect) btnClass = "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500";
              else if (isSelected) btnClass = "border-rose-500 bg-rose-50 text-rose-700";
              else btnClass = "border-zinc-100 opacity-50";
            }

            return (
              <button
                key={i}
                disabled={isRevealing}
                onClick={() => handleAnswer(opt)}
                className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all font-bold text-zinc-700 flex items-center justify-between group ${btnClass}`}
              >
                {opt}
                {isRevealing && isCorrect ? (
                  <Star size={20} className="text-emerald-500 fill-emerald-500" />
                ) : (
                  <ChevronRight size={20} className="text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
        {isRevealing && timeLeft === 0 && !selectedOption && (
          <p className="mt-6 text-center text-rose-500 font-bold animate-bounce">
            Time's up! The correct answer is highlighted.
          </p>
        )}
      </motion.div>
    </div>
  );
};

const Leaderboard = () => {
  const [data, setData] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return res.json();
      })
      .then(setData)
      .catch(err => console.error('Failed to fetch leaderboard:', err));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-black text-zinc-900 mb-8 flex items-center gap-3">
        <Trophy className="text-amber-500" /> Top Explorers
      </h2>
      <div className="bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden">
        {data.map((entry, i) => (
          <div key={i} className={`flex items-center justify-between p-6 ${i !== data.length - 1 ? 'border-b border-zinc-100' : ''} ${i < 3 ? 'bg-amber-50/30' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-zinc-300 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                {i + 1}
              </div>
              <div>
                <p className="font-bold text-zinc-900">{entry.username}</p>
                <p className="text-xs text-zinc-500">Level {entry.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-emerald-600">{entry.points}</p>
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DragDropGame = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const animals = [
    { name: 'Lion', category: 'Mammal', icon: '🦁' },
    { name: 'Eagle', category: 'Bird', icon: '🦅' },
    { name: 'Shark', category: 'Fish', icon: '🦈' },
    { name: 'Elephant', category: 'Mammal', icon: '🐘' },
    { name: 'Penguin', category: 'Bird', icon: '🐧' },
    { name: 'Goldfish', category: 'Fish', icon: '🐠' },
    { name: 'Tiger', category: 'Mammal', icon: '🐯' },
    { name: 'Owl', category: 'Bird', icon: '🦉' },
    { name: 'Dolphin', category: 'Mammal', icon: '🐬' },
    { name: 'Tuna', category: 'Fish', icon: '🐟' },
    { name: 'Parrot', category: 'Bird', icon: '🦜' },
    { name: 'Kangaroo', category: 'Mammal', icon: '🦘' },
  ];

  const categories = ['Mammal', 'Bird', 'Fish'];
  const [items, setItems] = useState(() => shuffleArray(animals));
  const [placed, setPlaced] = useState<{ [key: string]: string[] }>({
    Mammal: [],
    Bird: [],
    Fish: [],
  });
  const [score, setScore] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    if (isRevealing) return;
    if (timeLeft === 0) {
      handleDrop(null);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRevealing]);

  const handleDrop = (category: string | null) => {
    if (isRevealing) return;
    const currentAnimal = items[currentIdx];
    const isCorrect = currentAnimal.category === category;
    
    setIsRevealing(true);

    if (isCorrect) {
      setScore(s => s + 15);
      setPlaced(prev => ({
        ...prev,
        [category!]: [...prev[category!], currentAnimal.icon]
      }));
      playSound('correct');
    } else {
      playSound('wrong');
    }
    
    setTimeout(() => {
      if (currentIdx < items.length - 1) {
        setCurrentIdx(i => i + 1);
        setTimeLeft(30);
        setIsRevealing(false);
      } else {
        onComplete(score + (isCorrect ? 15 : 0));
      }
    }, 1500);
  };

  const currentAnimal = items[currentIdx];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <div className="flex justify-center gap-4 mb-4">
          <div className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest">
            Animal {currentIdx + 1} of {items.length}
          </div>
          <div className={`px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest ${timeLeft <= 3 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-zinc-100 text-zinc-700'}`}>
            Time: {timeLeft}s
          </div>
        </div>
        <h2 className="text-3xl font-black text-zinc-900 mb-2">Animal Sort</h2>
        <p className="text-zinc-500">Drag the animal to its correct group!</p>
      </div>

      <div className="flex flex-col items-center gap-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            className={`bg-white w-32 h-32 rounded-3xl shadow-2xl border-4 flex items-center justify-center text-6xl cursor-grab active:cursor-grabbing ${isRevealing ? 'border-zinc-200 opacity-50' : 'border-emerald-500'}`}
          >
            {currentAnimal.icon}
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {categories.map(cat => {
            const isCorrectCategory = isRevealing && currentAnimal.category === cat;
            return (
              <div 
                key={cat}
                onClick={() => !isRevealing && handleDrop(cat)}
                className={`border-2 border-dashed rounded-3xl p-6 min-h-[160px] flex flex-col items-center justify-center transition-all cursor-pointer group ${isCorrectCategory ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500' : 'bg-zinc-100 border-zinc-300 hover:bg-emerald-50 hover:border-emerald-300'}`}
              >
                <h4 className={`font-black mb-4 uppercase tracking-widest text-sm ${isCorrectCategory ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-emerald-600'}`}>{cat}s</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {placed[cat].map((icon, i) => (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} key={i} className="text-2xl">{icon}</motion.span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {isRevealing && timeLeft === 0 && (
          <p className="text-rose-500 font-bold animate-bounce">Time's up! It belongs to {currentAnimal.category}s.</p>
        )}
      </div>
    </div>
  );
};


const MatchingGame = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const levels = [
    [
      { animal: 'Camel', trait: 'Desert', icon: '🐪' },
      { animal: 'Frog', trait: 'Wetlands', icon: '🐸' },
      { animal: 'Penguin', trait: 'Ice', icon: '🐧' },
      { animal: 'Monkey', trait: 'Jungle', icon: '🐒' },
    ],
    [
      { animal: 'Shark', trait: 'Ocean', icon: '🦈' },
      { animal: 'Eagle', trait: 'Mountains', icon: '🦅' },
      { animal: 'Lion', trait: 'Savanna', icon: '🦁' },
      { animal: 'Polar Bear', trait: 'Arctic', icon: '🐻‍❄️' },
    ],
    [
      { animal: 'Elephant', trait: 'Grasslands', icon: '🐘' },
      { animal: 'Crocodile', trait: 'Swamp', icon: '🐊' },
      { animal: 'Squirrel', trait: 'Forest', icon: '🐿️' },
      { animal: 'Bat', trait: 'Cave', icon: '🦇' },
    ],
    [
      { animal: 'Whale', trait: 'Deep Ocean', icon: '🐋' },
      { animal: 'Monkey', trait: 'Rainforest', icon: '🐒' },
      { animal: 'Scorpion', trait: 'Desert', icon: '🦂' },
      { animal: 'Goat', trait: 'Cliffside', icon: '🐐' },
    ],
    [
      { animal: 'Sea Turtle', trait: 'Coral Reef', icon: '🐢' },
      { animal: 'Rabbit', trait: 'Meadow', icon: '🐇' },
      { animal: 'Owl', trait: 'Night Sky', icon: '🦉' },
      { animal: 'Zebra', trait: 'Savanna', icon: '🦓' },
    ],
    [
      { animal: 'Octopus', trait: 'Mariana Trench', icon: '🐙' },
      { animal: 'Kangaroo', trait: 'Outback', icon: '🦘' },
      { animal: 'Panda', trait: 'Bamboo Forest', icon: '🐼' },
      { animal: 'Flamingo', trait: 'Salt Lake', icon: '🦩' },
    ]
  ];

  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);
  const [matches, setMatches] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [shuffledPairs, setShuffledPairs] = useState<typeof levels[0]>([]);
  const [shuffledTraitIndices, setShuffledTraitIndices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    const pairs = levels[currentLevel];
    const shuffled = shuffleArray(pairs);
    setShuffledPairs(shuffled);
    setShuffledTraitIndices(shuffleArray(Array.from({ length: pairs.length }, (_, i) => i)));
    setMatches([]);
    setSelectedAnimal(null);
    setTimeLeft(30);
    setIsRevealing(false);
  }, [currentLevel]);

  useEffect(() => {
    if (isRevealing || matches.length === shuffledPairs.length) return;
    if (timeLeft === 0) {
      setIsRevealing(true);
      playSound('wrong');
      setTimeout(() => {
        if (currentLevel < levels.length - 1) {
          setCurrentLevel(prev => prev + 1);
        } else {
          onComplete(score);
        }
      }, 3000);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRevealing, matches.length, shuffledPairs.length]);

  if (shuffledPairs.length === 0) return null;

  const handleMatch = (traitIdx: number) => {
    if (selectedAnimal === null || isRevealing) return;
    
    if (selectedAnimal === traitIdx) {
      const newMatches = [...matches, selectedAnimal];
      setMatches(newMatches);
      setScore(s => s + 25);
      playSound('correct');

      if (newMatches.length === shuffledPairs.length) {
        if (currentLevel < levels.length - 1) {
          setTimeout(() => {
            setCurrentLevel(prev => prev + 1);
          }, 1000);
        } else {
          setTimeout(() => onComplete(score + 25), 1000);
        }
      }
    } else {
      playSound('wrong');
    }
    setSelectedAnimal(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <div className="flex justify-center gap-4 mb-4">
          <div className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest">
            Level {currentLevel + 1} of {levels.length}
          </div>
          <div className={`px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest ${timeLeft <= 5 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-zinc-100 text-zinc-700'}`}>
            Time: {timeLeft}s
          </div>
        </div>
        <h2 className="text-3xl font-black text-zinc-900 mb-2">Habitat Match</h2>
        <p className="text-zinc-500">Match the animal to where it lives!</p>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-4">
          {shuffledPairs.map((p, i) => {
            const isMatched = matches.includes(i);
            return (
              <button
                key={i}
                disabled={isMatched || isRevealing}
                onClick={() => setSelectedAnimal(i)}
                className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 font-bold ${isMatched ? 'bg-emerald-50 border-emerald-200 text-emerald-700 opacity-50' : selectedAnimal === i ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg' : isRevealing ? 'border-emerald-500 ring-2 ring-emerald-500' : 'border-zinc-100 bg-white hover:border-zinc-300'}`}
              >
                <span className="text-3xl">{p.icon}</span>
                {p.animal}
              </button>
            );
          })}
        </div>
        <div className="space-y-4">
          {shuffledTraitIndices.map((idx) => {
            const isMatched = matches.includes(idx);
            return (
              <button
                key={idx}
                disabled={isMatched || isRevealing}
                onClick={() => handleMatch(idx)}
                className={`w-full p-6 rounded-2xl border-2 transition-all font-bold h-[84px] ${isMatched ? 'bg-emerald-50 border-emerald-200 text-emerald-700 opacity-50' : isRevealing ? 'border-emerald-500 ring-2 ring-emerald-500' : 'border-zinc-100 bg-white hover:border-zinc-300'}`}
              >
                {shuffledPairs[idx].trait}
              </button>
            );
          })}
        </div>
      </div>
      {isRevealing && timeLeft === 0 && (
        <p className="mt-8 text-center text-rose-500 font-bold animate-bounce">Time's up! Showing correct habitats...</p>
      )}
    </div>
  );
};


const CrosswordGame = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const clues = [
    { clue: 'I say "Moo" and I give you milk. What am I?', answer: 'COW' },
    { clue: 'I have soft wool and I say "Baa". What am I?', answer: 'SHEEP' },
    { clue: 'I have a curly tail and I say "Oink". What am I?', answer: 'PIG' },
    { clue: 'I lay eggs and I say "Cluck". What am I?', answer: 'HEN' },
    { clue: 'I wake everyone up with a "Cock-a-doodle-doo"!', answer: 'ROOSTER' },
    { clue: 'I have a long neck and I say "Neigh". I am a...', answer: 'HORSE' },
    { clue: 'I swim in the pond and I say "Quack". What am I?', answer: 'DUCK' },
    { clue: 'I am a stubborn animal that says "Hee-haw"!', answer: 'DONKEY' },
    { clue: 'I am a baby chicken and I say "Peep"!', answer: 'CHICK' },
    { clue: 'I have horns and I say "Meh". What am I?', answer: 'GOAT' },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    if (isRevealing) return;
    if (timeLeft === 0) {
      handleTimeout();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRevealing]);

  const handleTimeout = () => {
    setIsRevealing(true);
    setInput(clues[currentIdx].answer);
    playSound('wrong');
    setTimeout(() => {
      moveToNext();
    }, 2000);
  };

  const moveToNext = () => {
    setIsRevealing(false);
    setFeedback(null);
    setInput('');
    if (currentIdx < clues.length - 1) {
      setCurrentIdx(i => i + 1);
      setTimeLeft(30);
    } else {
      onComplete(score);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealing) return;

    if (input.toUpperCase() === clues[currentIdx].answer) {
      setScore(s => s + 30);
      setFeedback('correct');
      playSound('correct');
      setIsRevealing(true);
      setTimeout(() => {
        moveToNext();
      }, 1000);
    } else {
      setFeedback('wrong');
      playSound('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-12">
        <div className="flex justify-center gap-4 mb-4">
          <div className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest">
            Clue {currentIdx + 1} of {clues.length}
          </div>
          <div className={`px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest ${timeLeft <= 5 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-zinc-100 text-zinc-700'}`}>
            Time: {timeLeft}s
          </div>
        </div>
        <h2 className="text-3xl font-black text-zinc-900 mb-2">Word Explorer</h2>
        <p className="text-zinc-500">Solve the clues to find the animal group!</p>
      </div>

      <motion.div 
        key={currentIdx}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-3xl shadow-xl border border-zinc-100"
      >
        <div className="bg-emerald-50 p-6 rounded-2xl mb-8 border border-emerald-100">
          <p className="text-emerald-800 font-medium text-lg italic">"{clues[currentIdx].clue}"</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {clues[currentIdx].answer.split('').map((_, i) => (
              <div key={i} className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center text-2xl font-black transition-all ${isRevealing && timeLeft === 0 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-zinc-50 text-zinc-900'}`}>
                {input[i]?.toUpperCase() || ''}
              </div>
            ))}
          </div>
          
          <input 
            autoFocus
            type="text"
            value={input}
            disabled={isRevealing}
            onChange={(e) => setInput(e.target.value.slice(0, clues[currentIdx].answer.length))}
            className="opacity-0 absolute h-0 w-0"
          />

          <div className="text-center">
            {feedback === 'correct' && <p className="text-emerald-600 font-bold mb-4">Correct! Well done! 🎉</p>}
            {feedback === 'wrong' && timeLeft > 0 && <p className="text-rose-500 font-bold mb-4">Try again! You can do it! 💪</p>}
            {timeLeft === 0 && <p className="text-rose-500 font-bold mb-4">Time's up! The word was {clues[currentIdx].answer}.</p>}
            <button 
              type="submit"
              disabled={isRevealing}
              className={`bg-emerald-600 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg ${isRevealing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Check Answer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};


// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, avgScore: 0 });
  const [serverLoginError, setServerLoginError] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem('aniclass_user_id');
    // Basic validation to avoid fetching "null" or "undefined" as strings
    if (savedId && savedId !== 'null' && savedId !== 'undefined') {
      fetch(`/api/user/${savedId}`)
        .then(async res => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            // If user not found, we just want to clear the session silently
            if (res.status === 404) {
              localStorage.removeItem('aniclass_user_id');
              return null;
            }
            throw new Error(errorData.error || `Server returned ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data) setUser(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch user:', err);
          localStorage.removeItem('aniclass_user_id');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (page === 'admin') {
      fetch('/api/admin/stats')
        .then(res => res.json())
        .then(setAdminStats)
        .catch(err => console.error('Failed to fetch admin stats:', err));
    }
  }, [page]);

  const handleLogin = async (username: string) => {
    setServerLoginError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Login failed');
      }
      const data = await res.json();
      setUser(data);
      localStorage.setItem('aniclass_user_id', data.id.toString());
    } catch (error) {
      console.error('Login error:', error);
      setServerLoginError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aniclass_user_id');
    setPage('home');
  };

  const handleGameComplete = async (score: number) => {
    if (!user) return;
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, game_type: 'quiz', score })
      });
      if (!res.ok) {
        throw new Error('Failed to save score');
      }
      const data = await res.json();
      setUser({ ...user, points: data.newPoints, level: data.newLevel });
      setPage('home');
    } catch (error) {
      console.error('Score submission error:', error);
      setPage('home');
    }
  };

  const getBackgroundClass = (currentPage: string) => {
    if (currentPage.includes('forest')) return 'bg-forest-pattern';
    if (currentPage.includes('ocean')) return 'bg-ocean-pattern';
    if (currentPage.includes('sky')) return 'bg-sky-pattern';
    if (currentPage.includes('farm')) return 'bg-farm-pattern';
    return 'bg-zinc-50';
  };

  if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className={`min-h-screen font-sans text-zinc-900 transition-colors duration-500 ${getBackgroundClass(page)}`}>
      <Navbar user={user} onLogout={handleLogout} onNavigate={setPage} />
      
      <main className="py-8">
        <AnimatePresence mode="wait">
          {!user ? (
            <Login onLogin={handleLogin} externalError={serverLoginError} />
          ) : (
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {page === 'home' && <HomeView user={user} onNavigate={setPage} />}
              {page === 'leaderboard' && <Leaderboard />}
              {page.startsWith('env-') && (
                <LessonView 
                  envId={page.split('-')[1]} 
                  onComplete={() => setPage(`game-${page.split('-')[1]}`)} 
                />
              )}
              {page === 'game-forest' && <DragDropGame onComplete={handleGameComplete} />}
              {page === 'game-ocean' && <QuizGame onComplete={handleGameComplete} />}
              {page === 'game-sky' && <MatchingGame onComplete={handleGameComplete} />}
              {page === 'game-farm' && <CrosswordGame onComplete={handleGameComplete} />}
              
              {page === 'admin' && user.role === 'teacher' && (
                <div className="max-w-4xl mx-auto p-6">
                  <h2 className="text-3xl font-black mb-8">Teacher Dashboard</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                      <p className="text-zinc-500 font-bold uppercase text-xs mb-2">Total Students</p>
                      <p className="text-4xl font-black">{adminStats.totalUsers}</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                      <p className="text-zinc-500 font-bold uppercase text-xs mb-2">Average Score</p>
                      <p className="text-4xl font-black">{Math.round(adminStats.avgScore)} pts</p>
                    </div>
                  </div>
                  <div className="mt-8 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Star size={14} className="text-emerald-600" />
                          </div>
                          <p className="font-medium">New student joined the adventure!</p>
                        </div>
                        <p className="text-zinc-400 text-sm">Just now</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 px-6 border-t border-zinc-200/50 mt-auto text-center">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Developed By</p>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-2">
              <p className="text-sm font-semibold text-zinc-700">Francis Kenrick O. Magallano</p>
              <p className="text-sm font-semibold text-zinc-700">Jarinyes Dexcem T. Gutierrez</p>
            </div>
            <p className="text-xs text-zinc-500 font-medium">Computer Science 3rd Year College</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
