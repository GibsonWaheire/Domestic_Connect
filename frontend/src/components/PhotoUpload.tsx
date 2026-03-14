import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { toast } from '@/hooks/use-toast';
import { uploadPhoto } from '@/lib/photoUpload';
import {
  Upload,
  Camera,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface PhotoUploadProps {
  onPhotoUploaded?: (photoUrl: string) => void;
  currentPhoto?: string;
}

const PhotoUpload = ({ onPhotoUploaded, currentPhoto }: PhotoUploadProps) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhoto || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(currentPhoto || null);
    }
  }, [currentPhoto]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid File Type', description: 'Please select an image file (JPEG, PNG, etc.)', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'Please select an image smaller than 5MB', variant: 'destructive' });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({ title: 'Upload Error', description: "Please select a file and ensure you're logged in", variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const photoUrl = await uploadPhoto(selectedFile, user.id);
      setPreviewUrl(photoUrl);
      setSelectedFile(null);
      toast({ title: 'Upload Successful!', description: 'Your profile photo has been uploaded.' });
      if (onPhotoUploaded) onPhotoUploaded(photoUrl);
    } catch {
      toast({ title: 'Upload Failed', description: 'An error occurred during upload. Please try again.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'Photo Removed', description: 'Your profile photo has been removed.' });
  };

  const handleRetakePhoto = () => {
    setSelectedFile(null);
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <Camera className="h-5 w-5 mr-2 text-blue-600" />
          Profile Photo Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewUrl && (
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
              <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!previewUrl && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <div className="p-4 bg-blue-50 rounded-full inline-block mb-4">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Profile Photo</h3>
            <p className="text-sm text-gray-600 mb-4">Choose a clear, professional photo of yourself</p>
            <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Camera className="h-4 w-4 mr-2" />
              Select Photo
            </Button>
            <p className="text-xs text-gray-500 mt-2">JPEG, PNG up to 5MB</p>
          </div>
        )}

        <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

        {selectedFile && !isUploading && (
          <div className="flex space-x-2">
            <Button onClick={handleUpload} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
            <Button variant="outline" onClick={handleRetakePhoto} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Retake
            </Button>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            Uploading to storage...
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Photo Guidelines
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use a clear, front-facing photo</li>
            <li>• Good lighting and neutral background</li>
            <li>• Professional appearance</li>
            <li>• No sunglasses or hats</li>
            <li>• File size under 5MB</li>
          </ul>
        </div>

        {!user && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center text-red-800">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Please sign in to upload photos</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;
