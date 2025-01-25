'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FlashCardRequest } from '@/types/flashcard';

interface CardFormProps {
  onSubmit: (card: FlashCardRequest) => void;
  onCancel: () => void;
  initialValues?: FlashCardRequest;
  folderId: string;
}

export function CardForm({ onSubmit, onCancel, initialValues, folderId }: CardFormProps) {
  const [frontContent, setFrontContent] = useState(initialValues?.frontContent || '');
  const [backContent, setBackContent] = useState(initialValues?.backContent || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ frontContent, backContent, folderId });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="frontContent">Front Content</Label>
          <Textarea
            id="frontContent"
            value={frontContent}
            onChange={(e) => setFrontContent(e.target.value)}
            placeholder="Enter the front content of the card"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="backContent">Back Content</Label>
          <Textarea
            id="backContent"
            value={backContent}
            onChange={(e) => setBackContent(e.target.value)}
            placeholder="Enter the back content of the card"
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialValues ? 'Update Card' : 'Add Card'}
          </Button>
        </div>
      </form>
    </Card>
  );
}