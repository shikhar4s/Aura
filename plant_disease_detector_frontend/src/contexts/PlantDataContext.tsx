import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlantImage {
  id: string;
  file: File;
  preview: string;
  uploadDate: Date;
  result?: DetectionResult;
}

interface DetectionResult {
  disease: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  cure: string;
  recoveryTime: string;
  preventiveMeasures: string[];
}

interface PlantDataContextType {
  images: PlantImage[];
  addImage: (file: File) => string;
  updateImageResult: (id: string, result: DetectionResult) => void;
  removeImage: (id: string) => void;
  selectedImage: PlantImage | null;
  setSelectedImage: (image: PlantImage | null) => void;
}

const PlantDataContext = createContext<PlantDataContextType | undefined>(undefined);

export const usePlantData = () => {
  const context = useContext(PlantDataContext);
  if (context === undefined) {
    throw new Error('usePlantData must be used within a PlantDataProvider');
  }
  return context;
};

interface PlantDataProviderProps {
  children: ReactNode;
}

export const PlantDataProvider: React.FC<PlantDataProviderProps> = ({ children }) => {
  const [images, setImages] = useState<PlantImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<PlantImage | null>(null);

  const addImage = (file: File): string => {
    const id = Date.now().toString();
    const preview = URL.createObjectURL(file);
    
    const newImage: PlantImage = {
      id,
      file,
      preview,
      uploadDate: new Date(),
    };
    
    setImages(prev => [newImage, ...prev]);
    return id;
  };

  const updateImageResult = (id: string, result: DetectionResult) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, result } : img
    ));
    
    // Update selected image if it's the one being updated
    setSelectedImage(prev => 
      prev?.id === id ? { ...prev, result } : prev
    );
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  const value = {
    images,
    addImage,
    updateImageResult,
    removeImage,
    selectedImage,
    setSelectedImage,
  };

  return <PlantDataContext.Provider value={value}>{children}</PlantDataContext.Provider>;
};