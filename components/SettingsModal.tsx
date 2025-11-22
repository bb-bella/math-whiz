
import React, { useState } from 'react';
import { AppSettings, ProblemType } from '../types';
import { X, User, PenTool, Zap, Volume2, VolumeX, Sliders, Target, Music } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showAdvanced, setShowAdvanced] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleTopicDifficultyChange = (type: ProblemType, level: 'easy' | 'medium' | 'hard') => {
    setLocalSettings(prev => ({
      ...prev,
      topicDifficulty: {
        ...prev.topicDifficulty,
        [type]: level
      }
    }));
  };

  const topics: ProblemType[] = ['arithmetic', 'geometry', 'fraction', 'word', 'measurement', 'logic', 'riddle'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-4 border-yellow-300 max-h-[90vh] flex flex-col">
        <div className="bg-yellow-300 p-3 md:p-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg md:text-2xl font-bold text-yellow-900 flex items-center gap-2">
            <Zap className="w-5 md:w-6 h-5 md:h-6" /> Settings
          </h2>
          <button onClick={onClose} className="bg-white p-1 rounded-full hover:bg-yellow-100 transition-colors text-yellow-800">
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar">
          {/* User Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
              <User size={18} className="md:w-5 md:h-5 text-blue-500" /> Your Name
            </label>
            <input
              type="text"
              value={localSettings.userName}
              onChange={(e) => setLocalSettings({ ...localSettings, userName: e.target.value })}
              className="w-full border-2 border-blue-200 rounded-xl px-3 md:px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors text-sm md:text-base"
              placeholder="Enter your name"
            />
          </div>

           {/* Global Difficulty */}
           <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
              <Zap size={18} className="md:w-5 md:h-5 text-orange-500" /> Global Difficulty
            </label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setLocalSettings({...localSettings, difficulty: level})}
                  className={`flex-1 py-2 rounded-xl font-bold capitalize transition-all text-xs md:text-sm ${
                    localSettings.difficulty === level
                      ? 'bg-orange-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Mode - Topic Selection */}
          <div className="bg-blue-50 rounded-xl p-2.5 md:p-3 border-2 border-blue-200">
            <button 
              onClick={() => setLocalSettings({...localSettings, focusMode: !localSettings.focusMode})}
              className="flex items-center justify-between w-full text-blue-700 font-bold mb-2 md:mb-3 text-sm md:text-base"
            >
              <span className="flex items-center gap-2"><Target size={16} className="md:w-5 md:h-5" /> Focus Mode</span>
              <span className={`text-xs px-2 py-0.5 md:py-1 rounded-full font-bold ${localSettings.focusMode ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                {localSettings.focusMode ? 'ON' : 'OFF'}
              </span>
            </button>
            
            {localSettings.focusMode && (
              <div className="space-y-2">
                <p className="text-xs text-blue-600 font-semibold mb-1.5 md:mb-2">Choose topics you want to practice:</p>
                <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                  {topics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => {
                        const current = localSettings.selectedTopics || [];
                        const updated = current.includes(topic)
                          ? current.filter(t => t !== topic)
                          : [...current, topic];
                        setLocalSettings({...localSettings, selectedTopics: updated});
                      }}
                      className={`px-2 py-0.5 md:py-1 rounded-lg text-xs font-bold capitalize transition-all border-2 ${
                        (localSettings.selectedTopics || []).includes(topic)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-100'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-1.5 md:mt-2">
                  Selected: {(localSettings.selectedTopics || []).length || 'None'} topic(s)
                </p>
              </div>
            )}
          </div>

          {/* Advanced Topic Settings */}
          <div className="bg-gray-50 rounded-xl p-2.5 md:p-3 border border-gray-100">
             <button 
               onClick={() => setShowAdvanced(!showAdvanced)}
               className="flex items-center justify-between w-full text-gray-600 font-bold text-sm md:text-base"
             >
                <span className="flex items-center gap-2"><Sliders size={16} className="md:w-5 md:h-5" /> Custom Subject Difficulty</span>
                <span>{showAdvanced ? '▲' : '▼'}</span>
             </button>
             
             {showAdvanced && (
                <div className="mt-3 space-y-2">
                    {topics.map(t => {
                       const current = localSettings.topicDifficulty?.[t] || localSettings.difficulty;
                       return (
                         <div key={t} className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium capitalize text-gray-500 w-20">{t}</span>
                            <div className="flex gap-0.5 flex-1 justify-end">
                                {(['easy', 'medium', 'hard'] as const).map((level) => (
                                    <button
                                    key={level}
                                    onClick={() => handleTopicDifficultyChange(t, level)}
                                    className={`text-[8px] md:text-[9px] px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg capitalize transition-all border ${
                                        (localSettings.topicDifficulty?.[t] || null) === level
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : localSettings.topicDifficulty?.[t] === undefined && localSettings.difficulty === level
                                        ? 'bg-gray-200 text-gray-400 border-gray-200' 
                                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-100'
                                    }`}
                                    title={localSettings.topicDifficulty?.[t] ? "Custom setting" : "Using global default"}
                                    >
                                    {level}
                                    </button>
                                ))}
                            </div>
                         </div>
                       )
                    })}
                </div>
             )}
          </div>

          {/* Sound Toggle */}
          <div>
             <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                {localSettings.soundEnabled ? <Volume2 size={18} className="md:w-5 md:h-5 text-green-500"/> : <VolumeX size={18} className="md:w-5 md:h-5 text-gray-400"/>} 
                Sound Effects
             </label>
             <button
               onClick={() => setLocalSettings({...localSettings, soundEnabled: !localSettings.soundEnabled})}
               className={`w-full py-2 md:py-3 rounded-xl font-bold transition-all text-sm md:text-base ${
                 localSettings.soundEnabled 
                   ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                   : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
               }`}
             >
               {localSettings.soundEnabled ? 'Sound ON 🔊' : 'Sound OFF 🔇'}
             </button>
          </div>

          {/* Music Toggle */}
          <div>
             <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                {localSettings.musicEnabled ? <Music size={18} className="md:w-5 md:h-5 text-blue-500"/> : <VolumeX size={18} className="md:w-5 md:h-5 text-gray-400"/>} 
                Background Music
             </label>
             <button
               onClick={() => setLocalSettings({...localSettings, musicEnabled: !localSettings.musicEnabled})}
               className={`w-full py-2 md:py-3 rounded-xl font-bold transition-all text-sm md:text-base ${
                 localSettings.musicEnabled 
                   ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                   : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
               }`}
             >
               {localSettings.musicEnabled ? 'Music ON 🎵' : 'Music OFF 🔇'}
             </button>
          </div>

          {/* Creator Name - Read Only */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 md:p-4 border-2 border-purple-200">
            <label className="block text-purple-900 font-bold mb-2 md:mb-3 flex items-center gap-2 text-xs md:text-sm">
              <PenTool size={16} className="md:w-5 md:h-5 text-purple-500" /> 
              <span>👑 Original Creator & Owner</span>
            </label>
            <div className="bg-white rounded-lg px-3 md:px-4 py-2 md:py-3 border-2 border-purple-300">
              <p className="text-base md:text-lg font-black text-purple-900">Isabella Oreoluwa Akinniranye</p>
              <p className="text-xs md:text-sm text-purple-700 mt-1">
                Creator, Sole Proprietor & Forever Owner of Math-Whiz
              </p>
              <p className="text-xs text-purple-600 mt-1.5 md:mt-2 italic">
                Age at creation: 7 years 4 months old 👧
              </p>
            </div>
            <p className="text-xs text-purple-600 mt-2 md:mt-3 text-center font-semibold">
              © Isabella Oreoluwa Akinniranye - All Rights Reserved
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 md:py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 text-base md:text-lg"
          >
            Save Changes ✅
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
