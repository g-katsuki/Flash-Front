import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const mockApiCards = [
      {
        id: 'api-1',
        frontContent: 'APIから取得したカード1',
        backContent: 'これはAPIから取得したカードの答えです1',
        folderId: '3',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'api-2',
        frontContent: 'APIから取得したカード2',
        backContent: 'これはAPIから取得したカードの答えです2',
        folderId: '3',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    console.log('Sending API response:', mockApiCards);

    return new NextResponse(JSON.stringify(mockApiCards), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 