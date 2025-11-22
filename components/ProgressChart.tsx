
import React from 'react';
import { HistoryItem } from '../types';
import { Star } from 'lucide-react';

interface ProgressChartProps {
  history: HistoryItem[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ history }) => {
  const recentHistory = [...history].slice(0, 20).reverse();
  
  // Calculate Level Logic
  const totalCorrect = history.filter(h => h.isCorrect).length;
  const currentLevel = Math.floor(totalCorrect / 10) + 1;
  const correctForNextLevel = currentLevel * 10;
  const progressToNext = totalCorrect % 10; // 0 to 9
  const percentageToNext = (progressToNext / 10) * 100;

  return (
    <div className="w-full p-4">
      
      {/* Level Progress Bar */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl border border-blue-100">
          <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-600 text-sm flex items-center gap-1">
                  <Star size={16} className="fill-blue-600"/> Level {currentLevel}
              </span>
              <span className="text-xs text-gray-500 font-medium">{10 - progressToNext} wins to Level {currentLevel + 1}</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-700"
                style={{ width: `${percentageToNext}%` }}
              ></div>
              {/* Milestones ticks */}
              {[20, 40, 60, 80].map(p => (
                  <div key={p} className="absolute top-0 h-full w-px bg-white/30" style={{ left: `${p}%` }}></div>
              ))}
          </div>
      </div>

      {/* Chart */}
      {recentHistory.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-gray-400 text-sm italic">
            Solve problems to build your chart! 📊
        </div>
      ) : (
        <>
            <div className="flex items-end justify-between h-32 gap-1">
                {recentHistory.map((item, i) => {
                    const height = item.isCorrect ? '80%' : item.skipped ? '20%' : '40%';
                    const color = item.isCorrect ? 'bg-green-400' : item.skipped ? 'bg-gray-300' : 'bg-red-400';
                    
                    return (
                        <div key={i} className="flex-1 flex flex-col justify-end group relative">
                            <div 
                                className={`w-full rounded-t-md transition-all duration-500 ${color} hover:opacity-80`}
                                style={{ height }}
                            ></div>
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] p-1 rounded whitespace-nowrap z-10 pointer-events-none">
                                {item.problem.type}
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-xs text-gray-400 font-bold uppercase">
                <span>Oldest</span>
                <span>Recent Activity</span>
                <span>Newest</span>
            </div>
        </>
      )}
    </div>
  );
};

export default ProgressChart;
