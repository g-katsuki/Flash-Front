'use client';

import { useState } from 'react';
import { Folder } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FolderIcon, PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FolderForm } from './FolderForm';

interface FolderListProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onAddFolder: (name: string) => void;
  onEditFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
}

export function FolderList({
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onEditFolder,
  onDeleteFolder,
}: FolderListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const handleSubmit = (name: string) => {
    if (editingFolder) {
      onEditFolder(editingFolder.id, name);
      setEditingFolder(null);
    } else {
      onAddFolder(name);
    }
    setShowForm(false);
  };

  const handleEdit = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setShowForm(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this folder and all its cards?')) {
      onDeleteFolder(id);
      if (selectedFolderId === id) {
        onSelectFolder('');
      }
    }
  };

  const handleCancel = () => {
    setEditingFolder(null);
    setShowForm(false);
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      
      {showForm && (
        <div className="mb-4">
          <FolderForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialValue={editingFolder?.name}
          />
        </div>
      )}

      <div className="space-y-2">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={cn(
              'group flex items-center',
              selectedFolderId === folder.id && 'bg-secondary rounded-lg'
            )}
          >
            <Button
              variant="ghost"
              className="flex-1 justify-start"
              onClick={() => onSelectFolder(folder.id)}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              {folder.name}
            </Button>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity px-2 space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleEdit(folder, e)}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDelete(folder.id, e)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}