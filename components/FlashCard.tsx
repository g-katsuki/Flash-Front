'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FlashCardProps {
  frontContent: string;
  backContent: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function FlashCard({ frontContent, backContent, onEdit, onDelete }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-full aspect-[3/2] perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "w-full h-full transition-transform duration-500 transform-style-preserve-3d cursor-pointer",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        <div className="absolute w-full h-full backface-hidden">
          <div className="w-full h-full bg-white rounded-lg shadow-sm p-1.5 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs font-medium text-gray-800 whitespace-normal text-center px-1">{frontContent}</p>
            </div>
            <div className="mt-0.5 flex justify-end space-x-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="text-blue-600 hover:text-blue-800 text-[10px]"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    if (window.confirm('Are you sure you want to delete this card?')) {
                      e.stopPropagation();
                      onDelete();
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-[10px]"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full bg-white rounded-lg shadow-sm p-1.5 flex items-center justify-center">
            <p className="text-xs text-gray-700 whitespace-normal text-center px-1">{backContent}</p>
          </div>
        </div>
      </div>
    </div>
  );
}