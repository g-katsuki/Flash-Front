'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadIcon } from 'lucide-react';
import { FlashCardRequest } from '@/types/flashcard';

interface CsvUploaderProps {
  onUpload: (cards: FlashCardRequest[]) => void;
  folderId: string;
}

export function CsvUploader({ onUpload, folderId }: CsvUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // エスケープされた引用符
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length < 2) {
          throw new Error('CSVファイルには少なくともヘッダー行と1行のデータが必要です');
        }

        const headers = parseCSVLine(lines[0]);
        const frontTextIndex = headers.indexOf('FrontText');
        const backTextIndex = headers.indexOf('BackText');

        if (frontTextIndex === -1 || backTextIndex === -1) {
          throw new Error('CSVファイルにはFrontTextとBackTextの列が必要です');
        }

        const cards: FlashCardRequest[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length < Math.max(frontTextIndex, backTextIndex) + 1) {
            console.warn(`行 ${i + 1} の列数が不足しています。スキップします。`);
            continue;
          }

          const card: FlashCardRequest = {
            frontContent: values[frontTextIndex].replace(/^"|"$/g, ''),
            backContent: values[backTextIndex].replace(/^"|"$/g, ''),
            folderId: folderId
          };
          cards.push(card);
        }
        
        if (cards.length === 0) {
          throw new Error('有効なカードデータが見つかりませんでした');
        }

        onUpload(cards);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert(`CSVファイルの解析中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className="flex items-center space-x-2 cursor-pointer"
        >
          <UploadIcon className="h-4 w-4" />
          <span>CSVファイルをアップロード</span>
        </label>
        {isUploading && <p>アップロード中...</p>}
      </div>
    </Card>
  );
} 