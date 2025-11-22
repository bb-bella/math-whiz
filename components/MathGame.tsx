
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MathProblem, AppSettings, HistoryItem, UserStats } from '../types';
import { getMathHint, generateAIProblem } from '../services/geminiService';
import { playSound } from '../services/audioService';
import { 
  ArrowRight, CheckCircle2, XCircle, Lightbulb, SkipForward, 
  Clock, BookOpen, Shapes, Ruler, BrainCircuit, Divide, HelpCircle, Pencil, RotateCcw, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Scratchpad from './Scratchpad';
import VisualHelper from './VisualHelper';

interface MathGameProps {
  settings: AppSettings;
  userStats: UserStats;
  onHistoryUpdate: (item: HistoryItem) => void;
}

const MathGame: React.FC<MathGameProps> = ({ settings, userStats, onHistoryUpdate }) => {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [lastSkippedProblem, setLastSkippedProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'skipped' | null>(null);
  const [inputFlash, setInputFlash] = useState<'green' | 'red' | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [animateStreak, setAnimateStreak] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNewProblem = useCallback(async () => {
    setLoadingProblem(true);
    setHint(null);
    setFeedback(null);
    setUserAnswer('');
    setAttempts(0);
    setShowScratchpad(false);
    
    // Pass full settings to allow for topic overrides
    const newProblem = await generateAIProblem(settings, userStats);
    setProblem(newProblem);
    setLoadingProblem(false);
    
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [settings, userStats]);

  useEffect(() => {
    fetchNewProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Sync local streak state for visual effect only
  useEffect(() => {
      if (userStats.streak !== streak) {
          setStreak(userStats.streak);
      }
  }, [userStats.streak, streak]);

  useEffect(() => {
    if (!problem || feedback === 'correct' || feedback === 'skipped' || hint) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      handleGetHint();
    }, 15000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [problem, feedback, hint]);

  useEffect(() => {
    if (attempts === 2 && !hint && problem) {
        handleGetHint();
    }
  }, [attempts, hint, problem]);


  const handleCheck = () => {
    if (!problem) return;
    
    const val = parseFloat(userAnswer);
    if (isNaN(val)) return;

    if (settings.soundEnabled) playSound('click');

    const isCorrect = Math.abs(val - problem.answer) < 0.01;

    // Immediate Flash Feedback
    setInputFlash(isCorrect ? 'green' : 'red');
    setTimeout(() => setInputFlash(null), 400);

    if (isCorrect) {
      handleCorrect(val);
    } else {
      handleWrong();
    }
  };

  const handleCorrect = (val: number) => {
    if (!problem) return;

    setFeedback('correct');
    setAnimateStreak(true);
    setTimeout(() => setAnimateStreak(false), 1000);

    if (settings.soundEnabled) playSound('correct');
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4ADE80', '#FACC15', '#60A5FA']
    });
    
    onHistoryUpdate({ 
      problem, 
      userAnswer: val, 
      isCorrect: true, 
      skipped: false,
      timestamp: Date.now() 
    });
    
    if (timerRef.current) clearTimeout(timerRef.current);

    setTimeout(() => {
      fetchNewProblem();
    }, 1500);
  };

  const handleWrong = () => {
    setFeedback('wrong');
    setAttempts(a => a + 1);
    if (settings.soundEnabled) playSound('wrong');
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  const handleSkip = () => {
    if (!problem) return;
    if (settings.soundEnabled) playSound('skip');

    setFeedback('skipped');
    setLastSkippedProblem(problem);
    
    onHistoryUpdate({ 
        problem, 
        userAnswer: null, 
        isCorrect: false, 
        skipped: true,
        timestamp: Date.now() 
    });

    if (timerRef.current) clearTimeout(timerRef.current);

    setTimeout(() => {
        fetchNewProblem();
    }, 800);
  };

  const handleRetryLast = () => {
    if (!lastSkippedProblem) return;
    
    setProblem(lastSkippedProblem);
    setLastSkippedProblem(null); 
    setFeedback(null);
    setHint(null);
    setUserAnswer('');
    setAttempts(0);
    setShowScratchpad(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleGetHint = async () => {
    if (!problem || loadingHint) return;
    setLoadingHint(true);
    const hintText = await getMathHint(problem);
    setHint(hintText);
    setLoadingHint(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCheck();
  };

  const renderQuestionText = (text: string) => {
    const parts = text.split(/(\d+\/\d+)/);
    return (
        <span>
            {parts.map((part, i) => {
                if (/^\d+\/\d+$/.test(part)) {
                    const [num, den] = part.split('/');
                    return (
                        <span key={i} className="inline-flex flex-col items-center align-middle mx-1 font-bold text-blue-600" style={{ verticalAlign: 'middle' }}>
                            <span className="border-b-2 border-blue-600 leading-none px-1 text-sm md:text-xl">{num}</span>
                            <span className="leading-none px-1 text-sm md:text-xl">{den}</span>
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
  };

  const renderIcon = () => {
      if (!problem) return null;
      switch (problem.type) {
          case 'time': return <Clock className="w-12 h-12 text-purple-400 mb-2" />;
          case 'word': return <BookOpen className="w-12 h-12 text-blue-400 mb-2" />;
          case 'geometry': return <Shapes className="w-12 h-12 text-pink-400 mb-2" />;
          case 'measurement': return <Ruler className="w-12 h-12 text-orange-400 mb-2" />;
          case 'fraction': return <Divide className="w-12 h-12 text-green-400 mb-2" />;
          case 'logic': return <BrainCircuit className="w-12 h-12 text-indigo-400 mb-2" />;
          case 'riddle': return <Sparkles className="w-12 h-12 text-yellow-400 mb-2 animate-pulse" />;
          default: return <div className="text-4xl mb-2">🔢</div>;
      }
  };

  if (loadingProblem && !problem) return (
      <div className="p-20 text-center flex flex-col items-center animate-pulse">
          <div className="text-6xl mb-4">🤖</div>
          <div className="text-xl font-bold text-blue-500">Thinking up a challenge...</div>
      </div>
  );

  if (!problem) return null;

  return (
    <div className="w-full max-w-xl mx-auto">
      
      {/* Streak Banner */}
      <div className="flex justify-between items-center mb-6 px-4">
        <div className={`bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2 transition-all duration-300 ${streak > 0 ? 'border-orange-300 bg-orange-50' : ''} ${animateStreak ? 'scale-125' : 'scale-100'}`}>
           <span className={`text-2xl ${animateStreak ? 'animate-bounce' : ''}`}>🔥</span> 
           <span className="font-bold text-orange-500">{streak} Streak</span>
        </div>
        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
           <span className="text-2xl">🎓</span> 
           {/* Show specific difficulty if overridden, otherwise global */}
           <span className="font-bold text-blue-500">
             {(settings.topicDifficulty && settings.topicDifficulty[problem.type]) 
                ? settings.topicDifficulty[problem.type]?.toUpperCase() 
                : settings.difficulty.toUpperCase()}
           </span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] p-6 md:p-10 border-b-8 border-blue-100 relative overflow-hidden min-h-[400px] flex flex-col justify-center">
        
        <Scratchpad isOpen={showScratchpad} onClose={() => setShowScratchpad(false)} />

        {/* Background Decor */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-100 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-100 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full">
          
          <div className="flex justify-between items-start mb-4">
             <div className="w-10"></div>
             <div className="flex justify-center flex-1">
                 {renderIcon()}
             </div>
             <button 
               onClick={() => setShowScratchpad(true)}
               className="bg-blue-50 text-blue-500 p-2 md:p-3 rounded-xl hover:bg-blue-100 transition-colors"
               title="Open Scratchpad"
             >
                 <Pencil size={18} className="md:w-5 md:h-5" />
             </button>
          </div>

          {/* Question Display */}
          {problem.displayMode === 'standard' ? (
            <div className="flex items-center justify-center gap-4 md:gap-6 text-5xl md:text-7xl font-black text-gray-800 mb-10">
                <div className="bg-blue-50 min-w-[80px] px-4 py-6 rounded-2xl flex items-center justify-center shadow-inner text-blue-600">
                {problem.num1}
                </div>
                <div className="text-gray-300">{problem.operator}</div>
                <div className="bg-purple-50 min-w-[80px] px-4 py-6 rounded-2xl flex items-center justify-center shadow-inner text-purple-600">
                {problem.num2}
                </div>
            </div>
          ) : (
            <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-700 leading-tight px-4">
                    {renderQuestionText(problem.questionText)}
                </h3>
                <p className="text-sm text-gray-400 mt-2 font-medium uppercase tracking-wider">{problem.type}</p>
            </div>
          )}

          {/* Interactive Helper */}
          {!feedback && (
              <VisualHelper type={problem.type} />
          )}

          {/* Answer Input */}
          <div className="relative max-w-xs mx-auto mb-8 mt-8">
            <input
              ref={inputRef}
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Answer..."
              className={`w-full text-center text-2xl md:text-3xl font-bold py-3 md:py-4 rounded-2xl border-4 outline-none transition-all shadow-sm
                ${inputFlash === 'green' ? 'bg-green-200 border-green-500 scale-105' : 
                  inputFlash === 'red' ? 'bg-red-200 border-red-500 scale-95' :
                  feedback === 'correct' ? 'border-green-400 bg-green-50 text-green-600' : 
                  feedback === 'wrong' ? 'border-red-400 bg-red-50 text-red-600' : 
                  feedback === 'skipped' ? 'border-gray-300 bg-gray-100 text-gray-400' :
                  'border-gray-200 focus:border-blue-400 focus:bg-blue-50 text-gray-700'}`}
              autoFocus
              disabled={feedback === 'correct' || feedback === 'skipped'}
            />
            {feedback === 'correct' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-bounce">
                <CheckCircle2 size={32} />
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                <XCircle size={32} />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 md:gap-3 flex-col md:flex-row">
            
            {lastSkippedProblem && !feedback && (
              <button
                onClick={handleRetryLast}
                className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-3 md:py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                title="Retry the last skipped problem"
              >
                <RotateCcw size={18} className="md:w-5 md:h-5" /> Retry
              </button>
            )}

            <button
              onClick={handleSkip}
              disabled={loadingProblem || feedback === 'correct'}
              className="flex-1 bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-500 font-bold py-3 md:py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 border-2 border-transparent hover:border-red-200 text-sm md:text-base"
            >
                <SkipForward size={18} className="md:w-5 md:h-5" /> Skip
            </button>

            <button
              onClick={handleCheck}
              disabled={!userAnswer || loadingProblem || feedback === 'correct'}
              className="flex-[2] bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 md:py-4 rounded-2xl shadow-lg hover:shadow-blue-200/50 transform hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base md:text-lg"
            >
              {feedback === 'correct' ? 'Good Job!' : 'Check'} <ArrowRight size={20} className="md:w-6 md:h-6" strokeWidth={3} />
            </button>
          </div>

          {/* Hints */}
          <div className="mt-4 min-h-[80px]">
             {!feedback && !hint && (
                 <button
                 onClick={handleGetHint}
                 disabled={loadingHint}
                 className={`w-full font-semibold py-2 text-sm flex items-center justify-center gap-2 transition-all rounded-xl
                     ${loadingHint ? 'text-gray-400' : 'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700'}`}
                 >
                 {loadingHint ? (
                     <span className="animate-spin">⌛</span> 
                 ) : (
                     <><Lightbulb size={16} /> Need a hint?</>
                 )}
                 </button>
             )}

             {hint && (
                <div className="mt-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4 text-left animate-fade-in shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="bg-yellow-200 p-2 rounded-full shrink-0">
                    <HelpCircle size={20} className="text-yellow-700" />
                    </div>
                    <div>
                    <h4 className="font-bold text-yellow-800 text-xs uppercase mb-1">AI Cheerleader</h4>
                    <p className="text-gray-700 text-lg leading-relaxed font-medium">{hint}</p>
                    </div>
                </div>
                </div>
             )}
          </div>

        </div>
      </div>
      
      {loadingProblem && (
          <div className="text-center mt-4 text-gray-400 text-sm">Generating next challenge...</div>
      )}
    </div>
  );
};

export default MathGame;
