import { useAuth } from '@/hooks/useAuth';

export interface PhotoUploadResponse {
  success: boolean;
  photoUrl?: string;
  error?: string;
}

export const uploadPhoto = async (file: File, userId: string): Promise<PhotoUploadResponse> => {
  try {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('userId', userId);

    // Upload to our JSON server endpoint
    const response = await fetch('http://localhost:3002/upload-photo', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      photoUrl: result.photoUrl,
    };
  } catch (error) {
    console.error('Photo upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Fallback function that converts file to base64 and stores in localStorage
export const uploadPhotoFallback = async (file: File): Promise<PhotoUploadResponse> => {
  try {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        // Store in localStorage as fallback
        localStorage.setItem('housegirl_profile_photo', base64Data);
        resolve({
          success: true,
          photoUrl: base64Data,
        });
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    return {
      success: false,
      error: 'Failed to process image',
    };
  }
};
