import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlantData } from '../../contexts/PlantDataContext';
import { toast } from 'react-hot-toast';
import { CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';
import ResultCard from './ResultCard';
import ResultModal from './ResultModal';
import { useAppContext } from '../../contexts/AppContext';


const useAuth = () => {
  const token = localStorage.getItem('access_token');
  return { token };
};

const API_BASE_URL = 'http://127.0.0.1:8000';

const UploadSection = () => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [analyzedImage, setAnalyzedImage] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addImage, updateImageResult, selectedImage } = usePlantData();
  const { token } = useAuth();
  const { language } = useAppContext();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    if (imageFiles.length > 1) {
      toast.error('Please select only one image at a time for analysis');
      return;
    }

    const file = imageFiles[0];
    analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    if (!token) {
        toast.error("You must be logged in to analyze an image.");
        return;
    }

    setIsAnalyzing(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/plant_doctor_ai/analyze/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Language': `${language}`
        },
        body: formData,
      });

      if (!response.ok) {
        // Try to parse error from Django response for better feedback
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `Analysis failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const resultData = await response.json();
      
      // The backend response structure matches our frontend needs
      const result = {
        disease: resultData.disease,
        confidence: resultData.confidence,
        severity: resultData.severity,
        cure: resultData.cure,
        recoveryTime: resultData.recoveryTime,
        preventiveMeasures: resultData.preventiveMeasures,
      };

      // Now update the global state using your context
      const imageId = addImage(file);
      updateImageResult(imageId, result);
      
      // Prepare the data for the result modal, using the server-provided preview URL
      const imageForModal = { 
        id: imageId, 
        file: file,
        preview: resultData.preview, // Use the URL from the server
        uploadDate: new Date(), 
        result: result
      };
      
      setAnalyzedImage(imageForModal);
      setShowResultModal(true);
      
      toast.success('Analysis complete!');

    } catch (error: any) {
      // The 'any' type is used here to access error.message
      console.error("Analysis API Error:", error);
      toast.error(error.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('dashboard.upload.title')}</h1>
        <p className="text-gray-600">{t('dashboard.upload.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
              isDragging
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CloudArrowUpIcon className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {t('dashboard.upload.dropZone')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('dashboard.upload.browseText')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('dashboard.upload.supportedFormats')}
                </p>
              </div>
              
              <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200">
                {t('dashboard.upload.chooseFile')}
              </button>
            </div>
          </div>

          {isAnalyzing && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <div>
                  <h3 className="font-semibold text-gray-800">{t('dashboard.upload.analyzing')}</h3>
                  <p className="text-sm text-gray-600">{t('dashboard.upload.analyzingSubtext')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="space-y-6">
          {selectedImage && selectedImage.result ? (
            <ResultCard image={selectedImage} />
          ) : (
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
              <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('dashboard.upload.noAnalysis')}</h3>
              <p className="text-gray-500">{t('dashboard.upload.noAnalysisSubtext')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {analyzedImage && (
        <ResultModal
          image={analyzedImage}
          isOpen={showResultModal}
          onClose={() => {
            setShowResultModal(false);
            setAnalyzedImage(null);
          }}
        />
      )}
    </div>
  );
};

export default UploadSection;