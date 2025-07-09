import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarIcon, EyeIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import ResultModal from './ResultModal';

interface HistoryItem {
  id: number;
  image_url: string;
  created_at: string;
  disease_name: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  recommended_treatment: string;
  expected_recovery_time: string;
  prevention_tips: string[];
}

interface PlantImage {
  id: string;
  file: File;
  preview: string;
  uploadDate: Date;
  result?: {
    disease: string;
    confidence: number;
    severity: 'Low' | 'Medium' | 'High';
    cure: string;
    recoveryTime: string;
    preventiveMeasures: string[];
  };
}

const useAuth = () => {
  const token = localStorage.getItem('access_token');
  return { token };
};

const API_BASE_URL = 'http://127.0.0.1:8000';

const HistorySection = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<PlantImage | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) {
        setError("Authentication is required to view analysis history.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/plant_doctor_ai/history/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || t('dashboard.history.fetchError'));
        }
        
        const data = await response.json();
        const results = data.results || data;
        setHistoryItems(Array.isArray(results) ? results : []);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [token, t]);

  const handleDelete = async (imageId: number) => {
    const originalHistory = [...historyItems];
    setHistoryItems(currentItems => currentItems.filter(item => item.id !== imageId));

    try {
      const response = await fetch(`${API_BASE_URL}/api/plant_doctor_ai/history/${imageId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(t('dashboard.history.deleteError'));
      }
      toast.success(t('dashboard.history.deleteSuccess'));
    } catch (err: any) {
      toast.error(err.message);
      setHistoryItems(originalHistory);
    }
  };

  const handleViewDetails = (item: HistoryItem) => {
    const imageForModal: PlantImage = {
      id: item.id.toString(),
      file: new File([], item.image_url.split('/').pop() || 'image.jpg', { type: 'image/jpeg' }),
      preview: item.image_url,
      uploadDate: new Date(item.created_at),
      result: {
        disease: item.disease_name.replace(/___/g, ' ').replace(/_/g, ' '),
        confidence: item.confidence,
        severity: item.severity,
        cure: item.recommended_treatment,
        recoveryTime: item.expected_recovery_time,
        preventiveMeasures: item.prevention_tips,
      },
    };
    setModalImage(imageForModal);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">{t('common.error')}</h3>
              <div className="mt-2 text-md text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('dashboard.history.title')}</h1>
          <p className="text-gray-600">{t('dashboard.history.subtitle')}</p>
        </div>
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-12 border border-white/20 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('dashboard.history.noHistory')}</h3>
          <p className="text-gray-500">{t('dashboard.history.noHistorySubtext')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('dashboard.history.title')}</h1>
        <p className="text-gray-600">{t('dashboard.history.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {historyItems.map((item) => (
          <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden flex flex-col">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <img
                src={item.image_url}
                alt={t('dashboard.history.analysisAlt')}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-4 space-y-3 flex-grow flex flex-col">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {formatDate(item.created_at)}
              </div>
              
              <div className="flex-grow space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 truncate pr-2">{item.disease_name.replace(/___/g, ' ').replace(/_/g, ' ')}</h3>
                  <span className="text-sm font-medium text-green-600 flex-shrink-0">
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                  {t(`common.${item.severity.toLowerCase()}`)} {t('dashboard.history.severity')}
                </span>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleViewDetails(item)}
                  className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>{t('dashboard.history.view')}</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {modalImage && (
        <ResultModal
          isOpen={!!modalImage}
          image={modalImage}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
};

export default HistorySection;