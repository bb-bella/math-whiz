
import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pencil, Trash2, X } from 'lucide-react';

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2563EB'); // Blue
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  // Initialize canvas size
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        // Set initial context styles
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    draw(pos.x, pos.y, false);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.beginPath(); // Reset path so lines don't connect weirdly
    }
  };

  const drawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    draw(pos.x, pos.y, true);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const draw = (x: number, y: number, isMoving: boolean) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.lineWidth = tool === 'eraser' ? 20 : 3;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    
    if (!isMoving) {
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    if (!isMoving) {
       ctx.beginPath(); // Start a new path immediately for dots
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-white/90 rounded-[2rem] overflow-hidden flex flex-col animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-blue-50 border-b border-blue-100">
        <div className="flex gap-2">
           <button 
             onClick={() => setTool('pen')}
             className={`p-2 rounded-lg ${tool === 'pen' ? 'bg-blue-200 text-blue-700' : 'text-gray-500'}`}
           >
             <Pencil size={20} />
           </button>
           <button 
             onClick={() => setTool('eraser')}
             className={`p-2 rounded-lg ${tool === 'eraser' ? 'bg-blue-200 text-blue-700' : 'text-gray-500'}`}
           >
             <Eraser size={20} />
           </button>
           <div className="w-px h-8 bg-gray-300 mx-1"></div>
           <div className="flex gap-1 items-center">
              {['#2563EB', '#DC2626', '#16A34A', '#000000'].map(c => (
                  <button 
                    key={c}
                    onClick={() => { setColor(c); setTool('pen'); }}
                    className={`w-6 h-6 rounded-full border-2 ${color === c && tool === 'pen' ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
              ))}
           </div>
        </div>
        <div className="flex gap-2">
            <button onClick={clearCanvas} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Clear All">
                <Trash2 size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <X size={24} />
            </button>
        </div>
      </div>

      {/* Canvas Area - Using CSS radial gradient for grid instead of external image */}
      <div 
        className="flex-1 relative touch-none"
        style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px'
        }}
      >
         <canvas
           ref={canvasRef}
           onMouseDown={startDrawing}
           onMouseUp={stopDrawing}
           onMouseOut={stopDrawing}
           onMouseMove={drawMove}
           onTouchStart={startDrawing}
           onTouchEnd={stopDrawing}
           onTouchMove={drawMove}
           className="absolute inset-0 cursor-crosshair w-full h-full"
         />
      </div>
    </div>
  );
};

export default Scratchpad;
