import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { X, Share2, Copy, Trophy } from 'lucide-react';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  currentPlayerName: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose, entries, currentPlayerName }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sortedEntries = [...entries].sort((a, b) => b.totalCorrect - a.totalCorrect);
  const currentPlayerRank = sortedEntries.findIndex(e => e.playerName === currentPlayerName) + 1;
  const currentPlayerEntry = sortedEntries.find(e => e.playerName === currentPlayerName);

  const handleShare = (entry: LeaderboardEntry) => {
    const text = `🎓 I'm on a ${entry.currentStreak}-day streak in Emoji Math Whiz! 🔥\n📊 Level: ${entry.level} | Correct: ${entry.totalCorrect} | Longest Streak: ${entry.longestStreak} days\n🏆 Rank: #${sortedEntries.indexOf(entry) + 1}\n\nJoin me at emoji-math-whiz.app!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Emoji Math Whiz - My Stats',
        text: text
      });
    } else {
      navigator.clipboard.writeText(text);
      setCopiedId(entry.playerName);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 md:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-orange-500 p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3 text-white min-w-0">
            <Trophy size={24} className="md:w-7 md:h-7 flex-shrink-0" />
            <h2 className="text-lg md:text-2xl font-black truncate">Leaderboard</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-all flex-shrink-0 ml-2"
          >
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Current Player Section */}
          {currentPlayerEntry && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-3 md:p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Your Rank</p>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-800 mt-1">#{currentPlayerRank}</h3>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-base md:text-lg font-bold text-blue-600">{currentPlayerEntry.totalCorrect} Correct</div>
                  <div className="text-xs md:text-sm text-purple-600 font-semibold">{currentPlayerEntry.currentStreak}-day streak 🔥</div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard List */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-base md:text-lg font-bold text-gray-700 px-2">Top Players</h3>
            {sortedEntries.slice(0, 10).map((entry, idx) => (
              <div
                key={`${entry.playerName}-${idx}`}
                className={`p-3 md:p-4 rounded-2xl border-2 transition-all ${
                  entry.playerName === currentPlayerName
                    ? 'bg-blue-100 border-blue-400 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <div className={`w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center font-bold text-white text-sm md:text-lg flex-shrink-0 ${
                      idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-blue-400'
                    }`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </div>

                    {/* Player Info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-800 text-sm md:text-base truncate">{entry.playerName}</p>
                      <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-gray-500 mt-0.5 flex-wrap">
                        <span>Level {entry.level}</span>
                        <span>•</span>
                        <span>{entry.totalCorrect} Correct</span>
                        <span>•</span>
                        <span>{entry.currentStreak}🔥</span>
                      </div>
                    </div>
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(entry)}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-2 rounded-lg transition-colors flex-shrink-0"
                    title="Share stats"
                  >
                    {copiedId === entry.playerName ? (
                      <Copy size={16} className="md:w-5 md:h-5" />
                    ) : (
                      <Share2 size={16} className="md:w-5 md:h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Social Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4">
            <h4 className="font-bold text-gray-800 mb-3">📱 Share Your Success!</h4>
            <p className="text-sm text-gray-600 mb-3">
              Challenge friends and family to beat your score. The more you play, the higher you climb the leaderboard!
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg">
                <p className="text-sm font-bold text-blue-600">Share Stats</p>
                <p className="text-xs text-gray-500">With friends</p>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <p className="text-sm font-bold text-green-600">Form Teams</p>
                <p className="text-xs text-gray-500">Class challenges</p>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <p className="text-sm font-bold text-purple-600">Weekly Goals</p>
                <p className="text-xs text-gray-500">Compete live</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
