'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface FolderFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
  initialValue?: string;
}

export function FolderForm({ onSubmit, onCancel, initialValue }: FolderFormProps) {
  const [name, setName] = useState(initialValue || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name);
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Folder Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter folder name"
            required
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialValue ? 'Update Folder' : 'Add Folder'}
          </Button>
        </div>
      </form>
    </Card>
  );
}