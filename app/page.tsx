'use client';

import { useState, useEffect } from 'react';
import { CardList } from '@/components/CardList';
import { CardForm } from '@/components/CardForm';
import { FolderList } from '@/components/FolderList';
import { FlashCard, FlashCardRequest, Folder } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { PlusIcon, Wand2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CsvUploader } from '@/components/CsvUploader';

// 変更後：プロトコルに依存しないURLを使用
// https://katsuki-flashcard.jp
// http://localhost:8080
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
  const [folders, setFolders] = useState<Folder[]>([]);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
  const [showFolders, setShowFolders] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSentence, setGeneratedSentence] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredCards = cards.filter(card => card.folderId === selectedFolderId);
  console.log('Selected Folder ID:', selectedFolderId);
  console.log('Filtered Cards:', filteredCards);

  // フォルダを取得する関数
  const fetchFolders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/folders`, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  // コンポーネントマウント時にフォルダを取得
  useEffect(() => {
    fetchFolders();
  }, []);

  // フォルダ追加処理
  const handleAddFolder = async (name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to add folder');
      }

      const newFolder = await response.json();
      setFolders(prevFolders => [...prevFolders, newFolder]);
    } catch (error) {
      console.error('Error adding folder:', error);
    }
  };

  // フォルダ削除処理
  const handleDeleteFolder = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/folders/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      setFolders(prevFolders => prevFolders.filter(folder => folder.id !== id));
      setCards(prevCards => prevCards.filter(card => card.folderId !== id));
      if (selectedFolderId === id) {
        setSelectedFolderId(null);
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  // フォルダ名の更新処理
  const handleEditFolder = async (id: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/folders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update folder');
      }

      const updatedFolder = await response.json();
      setFolders(prevFolders =>
        prevFolders.map(folder =>
          folder.id === id ? updatedFolder : folder
        )
      );
    } catch (error) {
      console.error('Error updating folder:', error);
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

      // 追加したカードを即座に表示するために、現在のフォルダのカードを再取得
      fetchCardsFromApi(selectedFolderId);
    } catch (error) {
      console.error('Error adding card:', error);
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
    const apiUrl = `${API_BASE_URL}/api/flashcards/folder/${folderId}`;
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
    } catch (error: unknown) {
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
    
    // 選択されたフォルダのカードを取得
    console.log(`Triggering API fetch for folder ${folderId}`);
    fetchCardsFromApi(folderId);
  };

  const handleGenerateSentence = async () => {
    if (!selectedFolderId) return;
    setIsGenerating(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);

      const response = await fetch(`${API_BASE_URL}/api/flashcards/folder/${selectedFolderId}/generate-sentence`, {
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to generate sentence');
      }

      const text = await response.text();
      console.log('Raw response:', text);

      if (!text) {
        throw new Error('Empty response from server');
      }

      // レスポンスをそのまま表示
      setGeneratedSentence(text);
      setIsDialogOpen(true);
    } catch (error: unknown) {
      console.error('Error generating sentence:', error);
      alert('文の生成中にエラーが発生しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCsvUpload = async (cards: FlashCardRequest[]) => {
    try {
      for (const card of cards) {
        const response = await fetch(`${API_BASE_URL}/api/flashcards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(card),
        });

        if (!response.ok) {
          throw new Error('Failed to add card');
        }

        const newCard: FlashCard = await response.json();
        setCards(prevCards => [...prevCards, newCard]);
      }
    } catch (error: unknown) {
      console.error('Error adding cards from CSV:', error);
      alert('カードの追加中にエラーが発生しました。');
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
            {selectedFolderId && (
              <div className="flex gap-2">
                {!showForm && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 sm:gap-2"
                    size="sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Card</span>
                  </Button>
                )}
                <Button
                  onClick={handleGenerateSentence}
                  className="flex items-center gap-2 sm:gap-2"
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 sm:mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Generate AI Sentence</span>
                    </>
                  )}
                </Button>
              </div>
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
              {selectedFolderId && (
                <div className="mt-4">
                  <CsvUploader
                    onUpload={handleCsvUpload}
                    folderId={selectedFolderId}
                  />
                </div>
              )}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generated Sentence</DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-800 whitespace-pre-wrap">{generatedSentence}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}