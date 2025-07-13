import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// Configure route for larger file uploads
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      // This might be a "Request Entity Too Large" error
      console.error('Error parsing form data:', error);
      return NextResponse.json({ 
        error: 'Request too large. Please try a smaller file or check file size limits.' 
      }, { status: 413 });
    }
    
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' }, { status: 400 });
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 });
    }

    const imageUrl = await DatabaseService.uploadImage(file);
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('API Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
} 