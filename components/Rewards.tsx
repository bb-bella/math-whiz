import React, { useState, useMemo } from 'react';
import { Reward, UserStats, DailyStreak } from '../types';
import { X, Gift, Lock, Sparkles } from 'lucide-react';

interface RewardsProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  dailyStreak: DailyStreak;
  unlockedRewards: string[];
  selectedReward?: string;
  onSelectReward: (rewardId: string) => void;
}

const REWARDS_CATALOG: Reward[] = [
  // Avatars
  { id: 'avatar_star', name: 'Star Avatar', type: 'avatar', icon: '⭐', description: '5 correct problems', rarity: 'common', condition: (s) => s.totalCorrect >= 5 },
  { id: 'avatar_rocket', name: 'Rocket Avatar', type: 'avatar', icon: '🚀', description: 'Reach level 3', rarity: 'rare', condition: (s) => s.currentLevel >= 3 },
  { id: 'avatar_wizard', name: 'Wizard Avatar', type: 'avatar', icon: '🧙‍♂️', description: '10-day streak', rarity: 'epic', condition: (s, d) => d.longestStreak >= 10 },
  { id: 'avatar_dragon', name: 'Dragon Avatar', type: 'avatar', icon: '🐉', description: '50 correct problems', rarity: 'legendary', condition: (s) => s.totalCorrect >= 50 },

  // Themes
  { id: 'theme_sunset', name: 'Sunset Theme', type: 'theme', icon: '🌅', description: 'Unlock at level 2', rarity: 'common', condition: (s) => s.currentLevel >= 2 },
  { id: 'theme_ocean', name: 'Ocean Theme', type: 'theme', icon: '🌊', description: '5-day streak', rarity: 'rare', condition: (s, d) => d.currentStreak >= 5 },
  { id: 'theme_galaxy', name: 'Galaxy Theme', type: 'theme', icon: '🌌', description: 'Solve 15 logic problems', rarity: 'epic', condition: (s) => (s.topicAccuracy['logic']?.correct || 0) >= 15 },

  // Titles
  { id: 'title_mathstar', name: 'Math Star', type: 'title', icon: '✨', description: '10 correct problems', rarity: 'common', condition: (s) => s.totalCorrect >= 10 },
  { id: 'title_quicksolve', name: 'Quick Solver', type: 'title', icon: '⚡', description: 'Solve 3 in under 30s', rarity: 'rare', condition: (s) => s.totalCorrect >= 3 },
  { id: 'title_legend', name: 'Math Legend', type: 'title', icon: '🏆', description: '20-day streak', rarity: 'legendary', condition: (s, d) => d.longestStreak >= 20 },
];

const Rewards: React.FC<RewardsProps> = ({
  isOpen,
  onClose,
  userStats,
  dailyStreak,
  unlockedRewards,
  selectedReward,
  onSelectReward
}) => {
  const [filter, setFilter] = useState<'all' | 'avatar' | 'theme' | 'title'>('all');

  const evaluatedRewards = useMemo(() => {
    return REWARDS_CATALOG.map(reward => ({
      ...reward,
      isUnlocked: reward.condition(userStats, dailyStreak)
    }));
  }, [userStats, dailyStreak]);

  const filteredRewards = filter === 'all'
    ? evaluatedRewards
    : evaluatedRewards.filter(r => r.type === filter);

  const rarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-100 to-gray-50 border-gray-300';
      case 'rare': return 'from-blue-100 to-blue-50 border-blue-300';
      case 'epic': return 'from-purple-100 to-purple-50 border-purple-300';
      case 'legendary': return 'from-yellow-100 to-orange-50 border-yellow-300';
      default: return 'from-gray-100 to-gray-50 border-gray-300';
    }
  };

  const rarityBadge = (rarity: string) => {
    const badges = { common: '🎯', rare: '💎', epic: '👑', legendary: '🌟' };
    return badges[rarity as keyof typeof badges] || '🎯';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-400 to-emerald-500 p-4 sm:p-6 flex justify-between items-center shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3 text-white min-w-0">
            <Gift size={24} className="sm:w-7 sm:h-7" />
            <h2 className="text-lg sm:text-2xl font-black truncate">Reward Shop</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-all flex-shrink-0 ml-2"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'avatar', 'theme', 'title'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-sm sm:text-base transition-all ${
                  filter === tab
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredRewards.map(reward => (
              <div
                key={reward.id}
                onClick={() => reward.isUnlocked && onSelectReward(reward.id)}
                className={`rounded-2xl border-2 p-3 sm:p-4 transition-all cursor-pointer ${
                  rarityColor(reward.rarity)
                } ${
                  selectedReward === reward.id
                    ? 'ring-4 ring-green-400 shadow-lg'
                    : 'hover:shadow-md'
                } ${
                  !reward.isUnlocked ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="text-3xl sm:text-4xl">{reward.icon}</div>
                  <div className="text-xs font-bold px-2 py-1 bg-white/60 rounded-full">
                    {rarityBadge(reward.rarity)}
                  </div>
                </div>

                <h4 className="font-bold text-gray-800 text-xs sm:text-sm">{reward.name}</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{reward.description}</p>

                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-300/50">
                  {reward.isUnlocked ? (
                    <div className="flex items-center gap-1 sm:gap-2 text-green-600 font-bold text-xs sm:text-sm">
                      <Sparkles size={14} className="sm:w-4 sm:h-4" />
                      Unlocked!
                      {selectedReward === reward.id && (
                        <span className="ml-auto text-[10px] sm:text-xs bg-green-100 px-2 py-1 rounded-full">Selected</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-500 font-bold text-xs sm:text-sm">
                      <Lock size={14} className="sm:w-4 sm:h-4" />
                      Locked
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6">
            <h3 className="font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Your Progress</h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black text-blue-600">{userStats.totalCorrect}</p>
                <p className="text-xs text-gray-600 font-semibold mt-1">Problems Solved</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black text-purple-600">{userStats.currentLevel}</p>
                <p className="text-xs text-gray-600 font-semibold mt-1">Current Level</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black text-orange-600">{dailyStreak.longestStreak}</p>
                <p className="text-xs text-gray-600 font-semibold mt-1">Longest Streak</p>
              </div>
            </div>
          </div>

          {/* Rewards Count */}
          <div className="text-center text-xs sm:text-sm text-gray-600 pb-2">
            <p className="font-semibold">{unlockedRewards.length} of {REWARDS_CATALOG.length} rewards unlocked</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(unlockedRewards.length / REWARDS_CATALOG.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
