import { API_BASE_URL } from './apiConfig';
import { FirebaseAuthService } from './firebaseAuth';

export const uploadPhoto = async (file: File, _userId: string): Promise<string> => {
  const token = await FirebaseAuthService.getIdToken();
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  formData.append('photo', file);
  formData.append('is_primary', 'true');

  const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }

  const data = await response.json();
  // Return an absolute URL so it works from any page
  const photoPath: string = data.photo_url;
  if (photoPath.startsWith('http')) return photoPath;
  return `${API_BASE_URL}${photoPath}`;
};
