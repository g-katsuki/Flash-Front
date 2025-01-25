export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashCard {
  id: string;
  folderId: string;
  frontContent: string;
  backContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashCardRequest {
  frontContent: string;
  backContent: string;
  folderId: string;
}

export interface FlashCardResponse {
  cards: FlashCard[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}