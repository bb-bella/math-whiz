
import React, { useState } from 'react';
import { PieChart, Ruler, Shapes, RotateCw, Maximize, Minimize } from 'lucide-react';

interface VisualHelperProps {
  type: 'fraction' | 'geometry' | 'measurement' | 'arithmetic' | 'word' | 'sequence' | 'time' | 'logic' | 'riddle';
}

const VisualHelper: React.FC<VisualHelperProps> = ({ type }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Fraction State
  const [denominator, setDenominator] = useState(4);
  const [filled, setFilled] = useState<boolean[]>(new Array(4).fill(false));

  // Measurement State
  const [sliderVal, setSliderVal] = useState(50);

  // Geometry State
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [shape, setShape] = useState<'square' | 'triangle' | 'circle'>('square');

  const toggleSlice = (index: number) => {
    const newFilled = [...filled];
    newFilled[index] = !newFilled[index];
    setFilled(newFilled);
  };

  const updateDenominator = (val: number) => {
    const d = Math.max(2, Math.min(12, val));
    setDenominator(d);
    setFilled(new Array(d).fill(false));
  };

  if (!['fraction', 'geometry', 'measurement'].includes(type)) return null;

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-4 bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-200 transition-colors"
      >
        {type === 'geometry' ? <Shapes size={18} /> : type === 'fraction' ? <PieChart size={18} /> : <Ruler size={18} />}
        Open {type === 'geometry' ? 'Shape Lab' : 'Visual Tool'}
      </button>
    );
  }

  return (
    <div className="mt-4 md:mt-6 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3 md:p-4 animate-fade-in w-full">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h4 className="font-bold text-indigo-800 text-xs md:text-sm uppercase">
          {type === 'fraction' ? 'Fraction Builder' : type === 'geometry' ? 'Interactive Geometry Lab' : 'Measurement Tool'}
        </h4>
        <button onClick={() => setIsOpen(false)} className="text-indigo-400 hover:text-indigo-600 font-bold text-sm">X</button>
      </div>

      {type === 'fraction' && (
        <div className="flex flex-col items-center gap-3 md:gap-4">
           <div className="flex gap-1 md:gap-2 items-center mb-2">
             <button onClick={() => updateDenominator(denominator - 1)} className="bg-white px-2 py-1 rounded shadow text-xs md:text-sm">-</button>
             <span className="font-bold text-gray-700 text-xs md:text-sm">Slices: {denominator}</span>
             <button onClick={() => updateDenominator(denominator + 1)} className="bg-white px-2 py-1 rounded shadow text-xs md:text-sm">+</button>
           </div>
           
           <div className="relative w-24 h-24 md:w-40 md:h-40">
             <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {filled.map((isFilled, i) => {
                    const sliceAngle = 360 / denominator;
                    const startAngle = i * sliceAngle;
                    const endAngle = (i + 1) * sliceAngle;
                    
                    const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                    const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                    const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                    const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);
                    
                    const largeArc = sliceAngle > 180 ? 1 : 0;
                    
                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    return (
                        <path
                            key={i}
                            d={pathData}
                            fill={isFilled ? '#4F46E5' : '#E0E7FF'}
                            stroke="white"
                            strokeWidth="2"
                            onClick={() => toggleSlice(i)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    );
                })}
             </svg>
           </div>
           <div className="text-indigo-600 font-black text-lg md:text-xl">
              {filled.filter(Boolean).length} / {denominator}
           </div>
        </div>
      )}

      {type === 'measurement' && (
        <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
            <div className="w-full bg-indigo-200 h-6 md:h-8 rounded-lg relative flex items-center px-2">
                <div className="absolute top-0 bottom-0 bg-indigo-500 rounded-l-lg opacity-50" style={{ width: `${sliderVal}%` }}></div>
                {[0, 25, 50, 75, 100].map(t => (
                    <div key={t} className="absolute h-full w-px bg-white/50" style={{ left: `${t}%` }}>
                        <span className="absolute bottom-full mb-0.5 text-[8px] md:text-[10px] text-gray-500 -translate-x-1/2 whitespace-nowrap">{t}cm</span>
                    </div>
                ))}
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderVal} 
              onChange={(e) => setSliderVal(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="font-bold text-indigo-700 text-sm md:text-base">{sliderVal} cm</div>
        </div>
      )}

      {type === 'geometry' && (
          <div className="flex flex-col items-center w-full">
              <div className="flex gap-1 md:gap-2 mb-3 md:mb-4">
                  {(['square', 'triangle', 'circle'] as const).map(s => (
                      <button 
                        key={s} 
                        onClick={() => setShape(s)}
                        className={`px-2 md:px-3 py-0.5 md:py-1 rounded-lg capitalize text-[10px] md:text-xs font-bold border ${shape === s ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}
                      >
                          {s}
                      </button>
                  ))}
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-6 w-full h-40 md:h-48 flex items-center justify-center overflow-hidden relative mb-3 md:mb-4">
                   <div 
                     className="bg-orange-400 transition-transform duration-300 flex items-center justify-center shadow-lg relative"
                     style={{
                         width: '80px',
                         height: '80px',
                         borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '8px',
                         clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
                         backgroundColor: shape === 'triangle' ? '#FB923C' : undefined,
                         transform: `rotate(${rotation}deg) scale(${scale})`
                     }}
                   >
                       {/* Visual Guides within shape */}
                       {shape === 'square' && <div className="absolute top-0 left-0 border-t-2 border-l-2 border-black w-3 h-3 opacity-30"></div>}
                   </div>

                    {/* Measurement Text */}
                    <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 text-[8px] md:text-[10px] text-gray-400">
                        Rot: {rotation}° | Scale: {scale.toFixed(1)}x
                    </div>
              </div>

              <div className="flex gap-2 md:gap-4 items-center w-full justify-center flex-wrap">
                  <div className="flex flex-col items-center">
                      <label className="text-[8px] md:text-[10px] font-bold text-gray-500 mb-1 flex items-center gap-0.5"><RotateCw size={10}/> Rotate</label>
                      <input 
                        type="range" 
                        min="0" max="360" 
                        value={rotation} 
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-20 md:w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                  </div>
                  <div className="flex flex-col items-center">
                      <label className="text-[8px] md:text-[10px] font-bold text-gray-500 mb-1 flex items-center gap-0.5"><Maximize size={10}/> Resize</label>
                      <div className="flex gap-1">
                          <button onClick={() => setScale(Math.max(0.5, scale - 0.1))} className="bg-gray-100 p-1 rounded hover:bg-gray-200"><Minimize size={12} className="md:w-4 md:h-4"/></button>
                          <button onClick={() => setScale(Math.min(2, scale + 0.1))} className="bg-gray-100 p-1 rounded hover:bg-gray-200"><Maximize size={12} className="md:w-4 md:h-4"/></button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default VisualHelper;
