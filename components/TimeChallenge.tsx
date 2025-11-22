import React, { useState, useEffect, useRef } from 'react';
import { TimeChallenge as TimeChallengeType, AppSettings, UserStats, HistoryItem } from '../types';
import { Clock, X, Play, RotateCcw } from 'lucide-react';
import MathGame from './MathGame';
import confetti from 'canvas-confetti';
import { playSound } from '../services/audioService';

interface TimeChallengeProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  userStats: UserStats;
  onComplete?: (result: TimeChallengeType) => void;
}

const TimeChallenge: React.FC<TimeChallengeProps> = ({ isOpen, onClose, settings, userStats, onComplete }) => {
  const [challenge, setChallenge] = useState<TimeChallengeType | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [challengeHistory, setChallengeHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    
    // Default: 5 problems in 60 seconds
    const newChallenge: TimeChallengeType = {
      id: `challenge_${Date.now()}`,
      targetCount: 5,
      timeLimit: 60,
      currentCount: 0,
      startTime: 0,
      isActive: false,
      completed: false,
      score: 0
    };
    setChallenge(newChallenge);
    setChallengeHistory([]);
  }, [isOpen]);

  const handleStartChallenge = () => {
    if (!challenge) return;
    setHasStarted(true);
    setChallenge(prev => prev ? { ...prev, startTime: Date.now(), isActive: true } : null);
    setTimeLeft(challenge.timeLimit);
  };

  useEffect(() => {
    if (!hasStarted || !challenge?.isActive || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleChallengeEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, challenge?.isActive, timeLeft]);

  const handleChallengeEnd = () => {
    if (!challenge) return;
    const completedTime = Date.now() - challenge.startTime;
    
    setChallenge(prev => prev ? {
      ...prev,
      isActive: false,
      completed: true,
      completedTime,
      score: challengeHistory.filter(h => h.isCorrect).length
    } : null);
    
    setIsComplete(true);
    if (settings.soundEnabled) playSound('correct');
    
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#4ADE80', '#FACC15', '#60A5FA', '#EC4899']
    });

    if (onComplete && challenge) {
      onComplete({ ...challenge, isActive: false, completed: true, completedTime, score: challengeHistory.filter(h => h.isCorrect).length });
    }
  };

  const handleProblemComplete = (item: HistoryItem) => {
    setChallengeHistory(prev => [...prev, item]);
    setChallenge(prev => {
      if (!prev) return null;
      const newCount = prev.currentCount + 1;
      if (newCount >= prev.targetCount) {
        handleChallengeEnd();
      }
      return { ...prev, currentCount: newCount };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 md:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3 text-white min-w-0">
            <Clock size={24} className="md:w-7 md:h-7 flex-shrink-0" />
            <h2 className="text-lg md:text-2xl font-black truncate">Time Challenge</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-all flex-shrink-0 ml-2"
          >
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

        <div className="p-4 md:p-8">
          {!hasStarted ? (
            <div className="text-center space-y-4 md:space-y-6">
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-2xl md:text-3xl font-black text-gray-800">Solve 5 Problems</h3>
                <p className="text-base md:text-xl font-bold text-purple-600">in 60 seconds! ⏱️</p>
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-4 my-6 md:my-8">
                <div className="bg-blue-50 p-3 md:p-4 rounded-2xl border-2 border-blue-200">
                  <div className="text-2xl md:text-3xl font-black text-blue-600">5</div>
                  <div className="text-xs md:text-sm text-gray-600 font-semibold mt-1">Problems</div>
                </div>
                <div className="bg-purple-50 p-3 md:p-4 rounded-2xl border-2 border-purple-200">
                  <div className="text-2xl md:text-3xl font-black text-purple-600">60s</div>
                  <div className="text-xs md:text-sm text-gray-600 font-semibold mt-1">Time Limit</div>
                </div>
              </div>

              <p className="text-xs md:text-base text-gray-600 font-medium leading-relaxed">
                ✨ Solve all 5 before time runs out to complete the challenge! <br />
                🏆 Earn bonus points for your streak!
              </p>

              <button
                onClick={handleStartChallenge}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-300/50"
              >
                <Play size={24} /> Start Challenge
              </button>
            </div>
          ) : !isComplete ? (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">
                    Problems: {challenge?.currentCount}/{challenge?.targetCount}
                  </h3>
                  <div className={`text-3xl font-black font-mono ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      timeLeft <= 10
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}
                    style={{ width: `${((challenge?.targetCount || 5) - (challenge?.currentCount || 0)) / (challenge?.targetCount || 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Game Component */}
              <div className="border-2 border-gray-200 rounded-2xl p-4 bg-gray-50">
                <MathGame
                  settings={settings}
                  userStats={userStats}
                  onHistoryUpdate={handleProblemComplete}
                />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 py-6">
              <div className="text-6xl animate-bounce">🎉</div>
              <h3 className="text-3xl font-black text-gray-800">Challenge Complete!</h3>
              
              <div className="grid grid-cols-3 gap-4 my-8">
                <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-200">
                  <div className="text-3xl font-black text-green-600">{challenge?.score}</div>
                  <div className="text-sm text-gray-600 font-semibold mt-1">Correct</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200">
                  <div className="text-3xl font-black text-blue-600">{challenge?.targetCount}</div>
                  <div className="text-sm text-gray-600 font-semibold mt-1">Target</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200">
                  <div className="text-3xl font-black text-purple-600">{challenge?.score === challenge?.targetCount ? '⭐' : `${Math.round((challenge?.score || 0) / (challenge?.targetCount || 5) * 100)}%`}</div>
                  <div className="text-sm text-gray-600 font-semibold mt-1">Score</div>
                </div>
              </div>

              {challenge?.score === challenge?.targetCount ? (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 p-4 rounded-2xl">
                  <p className="text-lg font-bold text-yellow-800">Perfect! 🌟</p>
                  <p className="text-sm text-yellow-700 mt-1">+50 bonus points to your streak!</p>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl">
                  <p className="text-lg font-bold text-blue-800">{challenge?.score} out of {challenge?.targetCount} problems solved!</p>
                  <p className="text-sm text-blue-600 mt-1">Try again to improve your time!</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setHasStarted(false);
                    setIsComplete(false);
                    setChallenge(null);
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw size={20} /> Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-2xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeChallenge;
