
import React from 'react';
import { Badge } from '../types';
import { Lock } from 'lucide-react';

interface BadgesProps {
  badges: Badge[];
}

const Badges: React.FC<BadgesProps> = ({ badges }) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
      {badges.map((badge) => (
        <div 
          key={badge.id}
          className={`relative p-3 rounded-2xl border-2 flex flex-col items-center text-center transition-all duration-500 group
            ${badge.unlocked 
                ? `${badge.color} border-opacity-50 shadow-md scale-100` 
                : 'bg-gray-50 border-gray-100 grayscale opacity-60'}`}
        >
            {!badge.unlocked && (
                <div className="absolute top-2 right-2 text-gray-300">
                    <Lock size={12} />
                </div>
            )}
            <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform">
                {badge.icon}
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider mb-1">
                {badge.name}
            </div>
            <div className="text-[10px] leading-tight hidden md:block text-gray-500">
                {badge.description}
            </div>
        </div>
      ))}
    </div>
  );
};

export default Badges;
