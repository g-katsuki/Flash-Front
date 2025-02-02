'use client';

import { useState, useEffect } from 'react';
import { CardList } from '@/components/CardList';
import { CardForm } from '@/components/CardForm';
import { FolderList } from '@/components/FolderList';
import { FlashCard, FlashCardRequest, Folder } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

// 変更後：プロトコルに依存しないURLを使用
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://katsuki-flashcard.jp';

// Temporary mock data until backend is integrated
const mockFolders: Folder[] = [
  {
    id: '1',
    name: 'Programming',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Languages',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'API Cards',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const mockCards: FlashCard[] = [
  {
    id: '1',
    folderId: '1',
    frontContent: 'What is React?',
    backContent: 'A JavaScript library for building user interfaces',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    folderId: '1',
    frontContent: 'What is TypeScript?',
    backContent: 'A typed superset of JavaScript that compiles to plain JavaScript',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    folderId: '2',
    frontContent: 'こんにちは',
    backContent: 'Hello',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function Home() {
  const [folders, setFolders] = useState<Folder[]>(mockFolders);
  const [cards, setCards] = useState<FlashCard[]>(mockCards);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
  const [showFolders, setShowFolders] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredCards = cards.filter(card => card.folderId === selectedFolderId);
  console.log('Selected Folder ID:', selectedFolderId);
  console.log('Filtered Cards:', filteredCards);

  const handleAddFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFolders([...folders, newFolder]);
  };

  const handleEditFolder = (id: string, name: string) => {
    const updatedFolders = folders.map(folder =>
      folder.id === id
        ? {
            ...folder,
            name,
            updatedAt: new Date().toISOString(),
          }
        : folder
    );
    setFolders(updatedFolders);
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(folders.filter(folder => folder.id !== id));
    setCards(cards.filter(card => card.folderId !== id));
    if (selectedFolderId === id) {
      setSelectedFolderId(null);
    }
  };

  const handleAddCard = async (cardData: FlashCardRequest) => {
    if (!selectedFolderId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...cardData,
          folderId: selectedFolderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add card');
      }

      const newCard: FlashCard = await response.json();
      setCards(prevCards => [...prevCards, newCard]);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding card:', error);
      // ここでエラーメッセージを表示するなどのエラーハンドリングを追加できます
    }
  };

  const handleEditCard = (card: FlashCard) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleUpdateCard = (cardData: FlashCardRequest) => {
    if (!editingCard) return;
    
    const updatedCards = cards.map(card => 
      card.id === editingCard.id 
        ? {
            ...card,
            ...cardData,
            updatedAt: new Date().toISOString(),
          }
        : card
    );
    
    setCards(updatedCards);
    setEditingCard(null);
    setShowForm(false);
  };

  const handleDeleteCard = async (id: string) => {
    console.log('Deleting card with ID:', id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/flashcards/${Number(id)}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('Delete response status:', response.status);
        throw new Error('Failed to delete card');
      }

      setCards(prevCards => prevCards.filter(card => card.id !== id));
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setShowForm(false);
  };

  const fetchCardsFromApi = async (folderId: string) => {
    setIsLoading(true);
    const apiUrl = `${API_BASE_URL}/api/flashcards`;
    console.log('Attempting to fetch from:', apiUrl);
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        }
      });
      console.log('API Response:', response);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${errorText}`);
      }

      const text = await response.text();
      console.log('Raw response:', text);
      
      if (!text) {
        throw new Error('Empty response from API');
      }

      let apiCards: FlashCard[];
      try {
        apiCards = JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e, 'Response text:', text);
        throw new Error('Invalid JSON response from API');
      }

      console.log('Parsed API cards:', apiCards);
      
      // APIから取得したカードにfolderIdを設定
      const cardsWithFolderId = apiCards.map(card => ({
        ...card,
        folderId: folderId // 明示的にfolderIdを設定
      }));
      
      setCards(prevCards => {
        const otherCards = prevCards.filter(card => card.folderId !== folderId);
        const newCards = [...otherCards, ...cardsWithFolderId];
        console.log('New cards state:', newCards);
        return newCards;
      });
    } catch (error) {
      console.error('Fetch error details:', {
        error,
        url: apiUrl,
        baseUrl: API_BASE_URL,
        env: process.env.NEXT_PUBLIC_API_URL
      });
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  };

  const handleSelectFolder = (folderId: string) => {
    console.log('Selected folder:', folderId);
    setSelectedFolderId(folderId);
    setShowFolders(false);
    
    if (folderId === '3' && !cards.some(card => card.folderId === '3')) {
      console.log('Triggering API fetch for folder 3');
      fetchCardsFromApi(folderId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="lg:hidden"
                onClick={() => setShowFolders(!showFolders)}
              >
                {showFolders ? '✕' : '☰'}
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
            </div>
            {selectedFolderId && !showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Card
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`
            lg:w-1/4 
            fixed lg:relative 
            inset-0 
            z-40 
            lg:z-auto 
            bg-gray-50 
            lg:bg-transparent
            transform 
            ${showFolders ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            transition-transform 
            duration-300 
            ease-in-out
          `}>
            <div className="p-4 lg:p-0">
              <FolderList
                folders={folders}
                selectedFolderId={selectedFolderId}
                onSelectFolder={handleSelectFolder}
                onAddFolder={handleAddFolder}
                onEditFolder={handleEditFolder}
                onDeleteFolder={handleDeleteFolder}
              />
            </div>
          </div>

          <div className="lg:w-3/4">
            {showForm && (
              <div className="mb-8">
                <CardForm 
                  onSubmit={editingCard ? handleUpdateCard : handleAddCard}
                  initialValues={editingCard || undefined}
                  onCancel={handleCancelEdit}
                  folderId={selectedFolderId!}
                />
              </div>
            )}
            {selectedFolderId ? (
              <>
                {isLoading ? (
                  <div className="text-center text-gray-500 mt-8">
                    Loading cards...
                  </div>
                ) : filteredCards.length > 0 ? (
                  <CardList
                    cards={filteredCards}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteCard}
                  />
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    No cards found in this folder
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                Please select a folder to view cards
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}