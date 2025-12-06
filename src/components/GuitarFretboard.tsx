import { useState } from 'react';
import { Button } from './ui/button';
import { Volume2, RotateCcw } from 'lucide-react';

interface FretPosition {
  string: number; // 0-5 (from high E to low E)
  fret: number;   // 0-12
}

interface GuitarFretboardProps {
  chord?: {
    name: string;
    positions: FretPosition[];
  };
  showFingerNumbers?: boolean;
  interactive?: boolean;
  onChordPlay?: () => void;
}

const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'];
const FRET_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function GuitarFretboard({ 
  chord, 
  showFingerNumbers = true, 
  interactive = false,
  onChordPlay
}: GuitarFretboardProps) {
  const [userPositions, setUserPositions] = useState<FretPosition[]>([]);

  // Convert chord finger notation to positions
  const parseChordPositions = (fingerNotation: string): FretPosition[] => {
    if (!fingerNotation) return [];
    
    const positions: FretPosition[] = [];
    const strings = fingerNotation.split(' ');
    
    strings.forEach((stringNotation, stringIndex) => {
      const fretMatch = stringNotation.match(/(\d+)$/);
      if (fretMatch && !stringNotation.includes('x')) {
        const fret = parseInt(fretMatch[1]);
        positions.push({ string: stringIndex, fret });
      }
    });
    
    return positions;
  };

  const chordPositions = chord ? parseChordPositions(chord.name) : [];
  const displayPositions = interactive ? userPositions : chordPositions;

  const handleFretClick = (string: number, fret: number) => {
    if (!interactive) return;

    const existingPosition = userPositions.find(p => p.string === string);
    
    if (existingPosition) {
      if (existingPosition.fret === fret) {
        // Remove position if clicking same fret
        setUserPositions(prev => prev.filter(p => p.string !== string));
      } else {
        // Update fret for this string
        setUserPositions(prev => 
          prev.map(p => p.string === string ? { string, fret } : p)
        );
      }
    } else {
      // Add new position
      setUserPositions(prev => [...prev, { string, fret }]);
    }
  };

  const clearPositions = () => {
    setUserPositions([]);
  };

  const isPositionActive = (string: number, fret: number): boolean => {
    return displayPositions.some(p => p.string === string && p.fret === fret);
  };

  const getFingerNumber = (string: number, fret: number): number => {
    const position = displayPositions.find(p => p.string === string && p.fret === fret);
    return position ? displayPositions.indexOf(position) + 1 : 0;
  };

  return (
    <div className="bg-amber-50 p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-900">
          Sơ đồ Đàn Guitar
          {chord && (
            <span className="ml-2 text-indigo-600 font-bold">{chord.name}</span>
          )}
        </h3>
        <div className="flex space-x-2">
          {onChordPlay && (
            <Button
              size="sm"
              onClick={onChordPlay}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Volume2 className="h-4 w-4 mr-1" />
              Nghe
            </Button>
          )}
          {interactive && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearPositions}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Xóa
            </Button>
          )}
        </div>
      </div>

      {/* Guitar Fretboard */}
      <div className="relative bg-amber-100 rounded-lg p-4 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* String names */}
          <div className="flex mb-2">
            <div className="w-12 flex flex-col space-y-4 pt-2">
              {STRING_NAMES.map((stringName, idx) => (
                <div key={idx} className="text-sm font-semibold text-amber-900 text-center">
                  {stringName}
                </div>
              ))}
            </div>
            
            {/* Fret numbers */}
            <div className="flex-1">
              <div className="flex">
                {FRET_NUMBERS.map((fretNum) => (
                  <div key={fretNum} className="flex-1 text-center">
                    <div className="text-xs text-amber-700 mb-1">
                      {fretNum}
                    </div>
                  </div>
                ))}
              </div>

              {/* Strings and Frets */}
              <div className="relative">
                {/* Fret lines */}
                {FRET_NUMBERS.slice(1).map((fretNum) => (
                  <div
                    key={fretNum}
                    className="absolute bg-amber-700 opacity-30"
                    style={{
                      left: `${(fretNum / FRET_NUMBERS.length) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: '2px'
                    }}
                  />
                ))}

                {/* Strings */}
                {STRING_NAMES.map((_, stringIndex) => (
                  <div key={stringIndex} className="flex items-center h-8 relative">
                    {/* String line */}
                    <div className="absolute inset-x-0 bg-amber-800 h-0.5 z-0" />
                    
                    {/* Fret positions */}
                    <div className="flex w-full relative z-10">
                      {FRET_NUMBERS.map((fretNum) => (
                        <div
                          key={fretNum}
                          className="flex-1 flex justify-center items-center"
                        >
                          <button
                            onClick={() => handleFretClick(stringIndex, fretNum)}
                            disabled={!interactive && fretNum === 0}
                            className={`
                              w-6 h-6 rounded-full border-2 transition-all duration-200
                              ${interactive ? 'cursor-pointer hover:scale-110' : ''}
                              ${isPositionActive(stringIndex, fretNum)
                                ? 'bg-indigo-600 border-indigo-800 shadow-lg'
                                : fretNum === 0
                                ? 'bg-amber-200 border-amber-400'
                                : 'bg-amber-50 border-amber-300 hover:bg-amber-100'
                              }
                            `}
                          >
                            {showFingerNumbers && isPositionActive(stringIndex, fretNum) && (
                              <span className="text-xs font-bold text-white">
                                {getFingerNumber(stringIndex, fretNum)}
                              </span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Fret markers (dots) */}
                <div className="absolute inset-0 pointer-events-none">
                  {[3, 5, 7, 9].map(fret => (
                    <div
                      key={fret}
                      className="absolute w-3 h-3 bg-amber-600 rounded-full opacity-40"
                      style={{
                        left: `calc(${(fret - 0.5) / FRET_NUMBERS.length * 100}% - 6px)`,
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  ))}
                  {/* Double dots for 12th fret */}
                  <div
                    className="absolute w-3 h-3 bg-amber-600 rounded-full opacity-40"
                    style={{
                      left: `calc(${(12 - 0.5) / FRET_NUMBERS.length * 100}% - 6px)`,
                      top: '35%'
                    }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-amber-600 rounded-full opacity-40"
                    style={{
                      left: `calc(${(12 - 0.5) / FRET_NUMBERS.length * 100}% - 6px)`,
                      top: '65%'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-amber-700 space-y-1">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-indigo-600 rounded-full border-2 border-indigo-800"></div>
            <span>Vị trí bấm</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-200 rounded-full border-2 border-amber-400"></div>
            <span>Dây rỗng (0)</span>
          </div>
          {interactive && (
            <span className="text-amber-600">• Nhấp vào để bấm/thả</span>
          )}
        </div>
        <div>• Các dấu chấm trên cần đàn là ký hiệu vị trí (fret 3, 5, 7, 9, 12)</div>
      </div>
    </div>
  );
}