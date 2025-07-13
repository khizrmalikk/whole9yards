import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname: string,
        /* clientPayload?: string, */
      ) => {
        // Generate a client token for the browser to upload the file
        // For now, we'll allow all uploads - in production you'd want authentication
        
        return {
          allowedContentTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            uploadTime: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        console.log('blob upload completed', blob, tokenPayload);
        
        try {
          // You can add any post-upload logic here
          // For example, save to database, send notifications, etc.
          console.log('File uploaded successfully:', blob.url);
        } catch (error) {
          console.error('Error in upload completion handler:', error);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
} 