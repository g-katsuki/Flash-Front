'use client';

import { useEffect, useState } from 'react';
import { FlashCard as FlashCardType } from '@/types/flashcard';
import { FlashCard } from './FlashCard';

interface CardListProps {
  cards: FlashCardType[];
  onEdit?: (card: FlashCardType) => void;
  onDelete?: (id: string) => void;
}

export function CardList({ cards, onEdit, onDelete }: CardListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3">
      {cards.map((card) => (
        <FlashCard
          key={card.id}
          frontContent={card.frontContent}
          backContent={card.backContent}
          onEdit={() => onEdit?.(card)}
          onDelete={() => onDelete?.(card.id)}
        />
      ))}
    </div>
  );
}