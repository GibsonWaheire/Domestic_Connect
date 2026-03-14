import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadPhoto = async (file: File, userId: string): Promise<string> => {
  const storage = getStorage();
  const storageRef = ref(storage, `profile-photos/${userId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
