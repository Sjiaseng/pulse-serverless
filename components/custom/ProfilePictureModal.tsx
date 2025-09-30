"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import Image from "next/image";

interface ProfilePicture {
  id: string;
  name: string;
  url: string;
}

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  pictures: ProfilePicture[];
  onSelectPicture: (url: string) => void;
  isLoading: boolean;
  userId?: string;
}

export default function ProfilePictureModal({
  isOpen,
  onClose,
  pictures,
  onSelectPicture,
  isLoading,
  userId
}: ProfilePictureModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a JPEG, PNG, or WebP image');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCustomUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadLoading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (userId) {
        formData.append('userId', userId);
      }
      
      const response = await fetch('/api/uploadCustomProfilePicture', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Call onSelectPicture to update the profile picture in the parent component
        onSelectPicture(data.uploadedUrl);
        
        // Clean up
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        
        // Show success message if there's a warning (DB update failed but file uploaded)
        if (data.warning) {
          console.warn(data.warning);
        }
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-lg">Choose Profile Picture</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {pictures.map((picture) => (
            <div
              key={picture.id}
              className="cursor-pointer group relative bg-gray-100 rounded-lg"
              onClick={() => onSelectPicture(picture.url)}
              style={{ height: '80px' }}
            >
              <Image
                src={picture.url}
                alt={picture.name}
                width={80}
                height={80}
                className="w-full h-full object-cover rounded-lg border-2 border-gray-300 hover:border-blue-500"
                style={{
                  display: 'block',
                  backgroundColor: 'white',
                  minHeight: '80px'
                }}
                onLoad={(e) => {
                  console.log(`Successfully loaded image: ${picture.url}`);
                  const target = e.currentTarget as HTMLImageElement;
                  console.log('Image dimensions:', target.naturalWidth, 'x', target.naturalHeight);
                  console.log('Image complete:', target.complete);
                }}
                onError={(e) => {
                  console.error(`Failed to load image: ${picture.url}`);
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.backgroundColor = "#ef4444";
                  target.style.color = "white";
                  target.innerHTML = "Error";
                }}
              />
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-3">Or upload your own:</p>
          
          {/* File input */}
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isLoading || uploadLoading}
            />
          </div>

          {/* Preview and upload button */}
          {selectedFile && previewUrl && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300">
                  <Image 
                    src={previewUrl} 
                    alt="Preview" 
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleCustomUpload}
                disabled={uploadLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Image
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Updating...</span>
          </div>
        )}
      </div>
    </div>
  );
}