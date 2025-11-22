
import React, { useState, useEffect, useMemo } from 'react';
import MathGame from './components/MathGame';
import SettingsModal from './components/SettingsModal';
import ProgressChart from './components/ProgressChart';
import Badges from './components/Badges';
import TimeChallenge from './components/TimeChallenge';
import Leaderboard from './components/Leaderboard';
import Rewards from './components/Rewards';
import Notifications from './components/Notifications';
import { AppSettings, HistoryItem, UserStats, Badge, ProblemType, DailyStreak, TimeChallenge as TimeChallengeType, Notification, Reward, LeaderboardEntry, UserProfile } from './types';
import { Settings, History, Trophy, Heart, BrainCircuit, BarChart3, List, Medal, Clock, Share2, Gift, Bell } from 'lucide-react';
import { playSound } from './services/audioService';
import { validateUserName, validateBoolean, validateDifficulty, validateTopics, safeJsonParse } from './services/validation';
import { errorHandler } from './services/errorHandler';

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Math Star',
  creatorName: 'Isabella Oreoluwa',
  difficulty: 'easy',
  soundEnabled: true
};

const BADGES_LIST: Badge[] = [
  { id: 'first_win', name: 'First Win', icon: '🌟', description: 'Solve your first problem', color: 'bg-yellow-100 border-yellow-200', unlocked: false, condition: (s) => s.totalCorrect >= 1 },
  { id: 'streak_5', name: 'On Fire', icon: '🔥', description: 'Reach a streak of 5', color: 'bg-orange-100 border-orange-200', unlocked: false, condition: (s) => s.streak >= 5 },
  { id: 'streak_10', name: 'Math Wizard', icon: '🧙‍♂️', description: 'Reach a streak of 10', color: 'bg-purple-100 border-purple-200', unlocked: false, condition: (s) => s.streak >= 10 },
  { id: 'geom_master', name: 'Shape Shifter', icon: '📐', description: '5 Correct Geometry problems', color: 'bg-pink-100 border-pink-200', unlocked: false, condition: (s) => (s.topicAccuracy['geometry']?.correct || 0) >= 5 },
  { id: 'frac_master', name: 'Pie Lover', icon: '🥧', description: '5 Correct Fraction problems', color: 'bg-green-100 border-green-200', unlocked: false, condition: (s) => (s.topicAccuracy['fraction']?.correct || 0) >= 5 },
  { id: 'logic_master', name: 'Big Brain', icon: '🧠', description: '5 Correct Logic problems', color: 'bg-blue-100 border-blue-200', unlocked: false, condition: (s) => (s.topicAccuracy['logic']?.correct || 0) >= 5 },
];

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [badges, setBadges] = useState<Badge[]>(BADGES_LIST);
  const [dailyStreak, setDailyStreak] = useState<DailyStreak>({ currentStreak: 0, longestStreak: 0, lastPlayDate: '' });
  const [timeChallenge, setTimeChallenge] = useState<TimeChallengeType | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ userId: '', dailyStreak, unlockedRewards: [] });

  // Load Data
  useEffect(() => {
    const loadData = () => {
      try {
        const savedSettings = localStorage.getItem('mathWhizSettings');
        if (savedSettings) {
          const parsed = safeJsonParse(savedSettings, {});
          setSettings({
            ...DEFAULT_SETTINGS,
            userName: validateUserName(parsed.userName),
            difficulty: validateDifficulty(parsed.difficulty),
            soundEnabled: validateBoolean(parsed.soundEnabled),
            selectedTopics: validateTopics(parsed.selectedTopics),
            focusMode: validateBoolean(parsed.focusMode)
          });
        }
      } catch (error) {
        errorHandler.log('Failed to load settings', 'warning', 'app-init', error);
      }

      try {
        const savedHistory = localStorage.getItem('mathWhizHistory');
        if (savedHistory) {
          setHistory(safeJsonParse(savedHistory, []));
        }
      } catch (error) {
        errorHandler.log('Failed to load history', 'warning', 'app-init', error);
      }

      try {
        const savedDailyStreak = localStorage.getItem('mathWhizDailyStreak');
        if (savedDailyStreak) {
          setDailyStreak(safeJsonParse(savedDailyStreak, { currentStreak: 0, longestStreak: 0, lastPlayDate: '' }));
        }
      } catch (error) {
        errorHandler.log('Failed to load daily streak', 'warning', 'app-init', error);
      }

      try {
        const savedLeaderboard = localStorage.getItem('mathWhizLeaderboard');
        if (savedLeaderboard) {
          setLeaderboard(safeJsonParse(savedLeaderboard, []));
        }
      } catch (error) {
        errorHandler.log('Failed to load leaderboard', 'warning', 'app-init', error);
      }

      try {
        const savedProfile = localStorage.getItem('mathWhizProfile');
        if (savedProfile) {
          const profile = safeJsonParse(savedProfile, { userId: '', dailyStreak, unlockedRewards: [] });
          setUserProfile(profile && profile.userId ? profile : { userId: `user_${Date.now()}`, dailyStreak, unlockedRewards: [] });
        } else {
          setUserProfile({ userId: `user_${Date.now()}`, dailyStreak, unlockedRewards: [] });
        }
      } catch (error) {
        errorHandler.log('Failed to load user profile', 'warning', 'app-init', error);
        setUserProfile({ userId: `user_${Date.now()}`, dailyStreak, unlockedRewards: [] });
      }
    };

    loadData();
  }, []);

  // Daily Streak Logic
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = dailyStreak.lastPlayDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (lastDate !== today) {
      if (lastDate === yesterday) {
        // Continue streak
        const newStreak = { ...dailyStreak, currentStreak: dailyStreak.currentStreak + 1, lastPlayDate: today };
        setDailyStreak(newStreak);
        localStorage.setItem('mathWhizDailyStreak', JSON.stringify(newStreak));
        if (newStreak.currentStreak > newStreak.longestStreak) {
          newStreak.longestStreak = newStreak.currentStreak;
          localStorage.setItem('mathWhizDailyStreak', JSON.stringify(newStreak));
        }
        addNotification({ type: 'reminder', title: 'Daily Streak Active!', message: `You're on a ${newStreak.currentStreak}-day streak! Keep it going! 🔥`, icon: '🔥' });
      } else {
        // Streak broken, reset
        const newStreak = { ...dailyStreak, currentStreak: 1, lastPlayDate: today, streakBrokenDate: lastDate };
        setDailyStreak(newStreak);
        localStorage.setItem('mathWhizDailyStreak', JSON.stringify(newStreak));
        addNotification({ type: 'reminder', title: 'Streak Reset', message: 'Start a new daily streak today! 💪', icon: '💪' });
      }
    }
  }, [history.length]); // Trigger on new history item

  const addNotification = (notif: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  // Calculate Stats from History on the fly
  const userStats = useMemo<UserStats>(() => {
    const stats: UserStats = {
      totalCorrect: 0,
      streak: 0,
      topicAccuracy: {} as any,
      currentLevel: 1
    };

    // Calculate from full history to ensure persistence across reloads
    // Note: Streak is tricky to recalc fully from history if history is truncated, 
    // but we'll calculate current streak based on latest history items.
    let currentStreak = 0;
    for (let i = 0; i < history.length; i++) {
        if (history[i].isCorrect) currentStreak++;
        else break; // Streak breaks on first non-correct
    }
    stats.streak = currentStreak;

    history.forEach(h => {
        if (h.isCorrect) stats.totalCorrect++;
        
        if (!stats.topicAccuracy[h.problem.type]) {
            stats.topicAccuracy[h.problem.type] = { correct: 0, total: 0 };
        }
        stats.topicAccuracy[h.problem.type].total++;
        if (h.isCorrect) stats.topicAccuracy[h.problem.type].correct++;
    });

    stats.currentLevel = Math.floor(stats.totalCorrect / 10) + 1;

    return stats;
  }, [history]);

  // Check for Badge Unlocks
  useEffect(() => {
    let newUnlock = false;
    const updatedBadges = badges.map(b => {
        if (b.unlocked) return b;
        if (b.condition(userStats)) {
            newUnlock = true;
            return { ...b, unlocked: true };
        }
        return b;
    });

    if (newUnlock) {
        setBadges(updatedBadges);
        if (settings.soundEnabled) playSound('correct'); // Or a special badge sound
        // Could trigger a toast notification here
    }
  }, [userStats, badges, settings.soundEnabled]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('mathWhizSettings', JSON.stringify(newSettings));
    if (newSettings.soundEnabled) playSound('correct');
  };

  const handleHistoryUpdate = (item: HistoryItem) => {
    const newHistory = [item, ...history].slice(0, 100); 
    setHistory(newHistory);
    localStorage.setItem('mathWhizHistory', JSON.stringify(newHistory));

    // Update leaderboard entry
    const newEntry: LeaderboardEntry = {
      playerName: settings.userName,
      totalCorrect: newHistory.filter(h => h.isCorrect).length,
      longestStreak: dailyStreak.longestStreak,
      currentStreak: dailyStreak.currentStreak,
      level: Math.floor(newHistory.filter(h => h.isCorrect).length / 10) + 1,
      timestamp: Date.now()
    };
    
    setLeaderboard(prev => {
      const filtered = prev.filter(e => e.playerName !== settings.userName);
      const updated = [newEntry, ...filtered].slice(0, 20);
      localStorage.setItem('mathWhizLeaderboard', JSON.stringify(updated));
      return updated;
    });
  };

  const correctCount = history.filter(h => h.isCorrect).length;
  const totalCount = history.length;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-fredoka">
      
      {/* Decorative Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none bg-[#f0f9ff]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-200 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="px-4 py-6 md:px-8 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg text-white">
            <BrainCircuit size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
              Hi, <span className="text-blue-600">{settings.userName}!</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium">🔥 {dailyStreak.currentStreak}-day streak!</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => setShowNotifications(true)}
            className="relative bg-white p-2 md:p-3 rounded-xl shadow-sm hover:shadow-md border border-gray-200 text-gray-600 hover:text-purple-600 transition-all"
            title="Notifications"
          >
            <Bell size={20} className="md:w-6 md:h-6" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 w-2 md:w-3 h-2 md:h-3 bg-red-500 rounded-full"></span>
            )}
          </button>

          <button 
            onClick={() => setShowRewards(true)}
            className="bg-white p-2 md:p-3 rounded-xl shadow-sm hover:shadow-md border border-gray-200 text-gray-600 hover:text-green-600 transition-all"
            title="Rewards"
          >
            <Gift size={20} className="md:w-6 md:h-6" />
          </button>

          <button 
            onClick={() => setShowLeaderboard(true)}
            className="bg-white p-2 md:p-3 rounded-xl shadow-sm hover:shadow-md border border-gray-200 text-gray-600 hover:text-yellow-600 transition-all"
            title="Leaderboard"
          >
            <Trophy size={20} className="md:w-6 md:h-6" />
          </button>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="bg-white p-2 md:p-3 rounded-xl shadow-sm hover:shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 transition-all transform hover:rotate-12"
            title="Settings"
          >
            <Settings size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-6 w-full max-w-6xl mx-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Col: Stats (Desktop) */}
          <div className="lg:col-span-3 lg:block hidden space-y-6">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6 space-y-6">
                <div>
                  <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">Your Stats</h3>
                  <div className="flex items-center gap-4 mb-4">
                     <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                       <Trophy size={24} />
                     </div>
                     <div>
                       <div className="text-2xl font-black text-gray-800">{correctCount}</div>
                       <div className="text-xs text-gray-500 font-bold uppercase">Correct</div>
                     </div>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${totalCount === 0 ? 0 : (correctCount / totalCount) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-2 font-medium">
                    {totalCount > 0 ? Math.round((correctCount/totalCount)*100) : 0}% Accuracy
                  </p>
                </div>

                {/* Daily Streak Card */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-4">
                  <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2 mb-2">
                    <span className="text-2xl">🔥</span> Daily Streak
                  </h4>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-black text-orange-600">{dailyStreak.currentStreak}</p>
                      <p className="text-xs text-gray-600 font-medium">days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">Longest</p>
                      <p className="text-lg font-black text-orange-500">{dailyStreak.longestStreak}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setTimeChallenge({ id: `tc_${Date.now()}`, targetCount: 5, timeLimit: 60, currentCount: 0, startTime: 0, isActive: false, completed: false, score: 0 })}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Clock size={20} /> Time Challenge
                </button>

                <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                        <Medal size={14} /> Badges
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {badges.filter(b => b.unlocked).length === 0 && (
                            <span className="text-xs text-gray-400 italic">Keep playing to unlock badges!</span>
                        )}
                        {badges.filter(b => b.unlocked).map(b => (
                            <div key={b.id} className="text-xl" title={b.name}>{b.icon}</div>
                        ))}
                    </div>
                </div>
             </div>
          </div>

          {/* Center: Game */}
          <div className="lg:col-span-6 w-full">
             <MathGame settings={settings} userStats={userStats} onHistoryUpdate={handleHistoryUpdate} />
             
             {/* Mobile Badges Area (Below Game) */}
             <div className="lg:hidden mt-6 bg-white p-4 rounded-3xl border border-gray-100">
                 <h3 className="font-bold text-gray-600 flex items-center gap-2 mb-2">
                    <Medal size={18} className="text-yellow-500"/> Your Badges
                 </h3>
                 <div className="flex overflow-x-auto gap-3 pb-2">
                    {badges.map(b => (
                        <div key={b.id} className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${b.unlocked ? b.color : 'bg-gray-50 border-gray-200 grayscale opacity-50'}`}>
                            {b.icon}
                        </div>
                    ))}
                 </div>
             </div>
          </div>

          {/* Right Col: History / Chart (Desktop) */}
          <div className="lg:col-span-3 lg:h-[600px] flex flex-col">
             <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-600 flex items-center gap-2">
                    {viewMode === 'list' ? <History size={18} /> : <BarChart3 size={18} />} 
                    {viewMode === 'list' ? 'Recent' : 'Progress'}
                  </h3>
                  <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          <List size={14} />
                      </button>
                      <button 
                        onClick={() => setViewMode('chart')}
                        className={`p-1 rounded-md transition-colors ${viewMode === 'chart' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          <BarChart3 size={14} />
                      </button>
                  </div>
                </div>
                
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {viewMode === 'chart' ? (
                      <div className="p-2">
                        <ProgressChart history={history} />
                        <div className="px-2">
                             <Badges badges={badges} />
                        </div>
                      </div>
                  ) : (
                    <div className="p-4 space-y-3">
                        {history.length === 0 && (
                            <div className="text-center text-gray-400 py-10 text-sm">No problems yet!</div>
                        )}
                        {history.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-10 rounded-full ${item.skipped ? 'bg-gray-400' : item.isCorrect ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <div className="flex flex-col">
                                    <div className="font-bold text-gray-700 text-sm truncate w-24">
                                    {item.problem.displayMode === 'standard' 
                                        ? `${item.problem.num1} ${item.problem.operator} ${item.problem.num2}` 
                                        : item.problem.type}
                                    </div>
                                    <div className="text-[10px] text-gray-400">{item.problem.type}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-black text-sm ${item.skipped ? 'text-gray-500 italic' : item.isCorrect ? 'text-green-600' : 'text-red-500 line-through'}`}>
                                {item.skipped ? 'Skipped' : (item.isCorrect ? item.problem.answer : item.userAnswer)}
                                </div>
                            </div>
                            </div>
                        ))}
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* Mobile History Toggle */}
          <div className="lg:hidden w-full mt-8">
             <button 
              onClick={() => setShowHistory(!showHistory)}
              className="w-full bg-white p-4 rounded-2xl shadow-sm font-bold text-gray-600 flex justify-center items-center gap-2 border border-gray-200"
             >
               <History size={20} /> {showHistory ? 'Hide' : 'Show'} Recent Problems
             </button>
             {showHistory && (
               <div className="mt-4 bg-white rounded-2xl shadow-sm p-4 max-h-60 overflow-y-auto border border-gray-100">
                 {history.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b last:border-0 border-gray-100 py-2 text-sm">
                       <span className="font-medium text-gray-600 truncate max-w-[150px]">
                         {item.problem.displayMode === 'standard' ? `${item.problem.num1} ${item.problem.operator} ${item.problem.num2}` : item.problem.questionText}
                       </span>
                       <span className={item.skipped ? 'text-gray-400 font-bold' : item.isCorrect ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                         {item.skipped ? 'Skip' : item.isCorrect ? '✔' : '✘'}
                       </span>
                    </div>
                 ))}
               </div>
             )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm text-sm font-medium text-gray-500">
           <span>Created with</span> 
           <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" /> 
           <span>by {settings.creatorName}</span>
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <TimeChallenge
        isOpen={!!timeChallenge}
        onClose={() => setTimeChallenge(null)}
        settings={settings}
        userStats={userStats}
        onComplete={(result) => {
          addNotification({
            type: result.score === result.targetCount ? 'achievement' : 'challenge',
            title: result.score === result.targetCount ? '🌟 Perfect Challenge!' : '⏱️ Challenge Complete',
            message: result.score === result.targetCount 
              ? `You solved all ${result.targetCount} in ${Math.round(result.completedTime! / 1000)}s! +50 bonus points!`
              : `You solved ${result.score}/${result.targetCount} problems!`,
            icon: result.score === result.targetCount ? '🌟' : '⏱️'
          });
        }}
      />

      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        entries={leaderboard}
        currentPlayerName={settings.userName}
      />

      <Rewards
        isOpen={showRewards}
        onClose={() => setShowRewards(false)}
        userStats={userStats}
        dailyStreak={dailyStreak}
        unlockedRewards={userProfile.unlockedRewards}
        selectedReward={userProfile.selectedReward}
        onSelectReward={(rewardId) => {
          const updated = { ...userProfile, selectedReward: rewardId };
          setUserProfile(updated);
          localStorage.setItem('mathWhizProfile', JSON.stringify(updated));
          addNotification({
            type: 'reward',
            title: '✨ Reward Selected!',
            message: `You've equipped a new reward! ✨`,
            icon: '✨'
          });
        }}
      />

      <Notifications
        notifications={notifications}
        onDismiss={(id) => {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

    </div>
  );
};

export default App;
