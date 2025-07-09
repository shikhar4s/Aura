import React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

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

interface ResultModalProps {
  image: PlantImage;
  isOpen: boolean;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ image, isOpen, onClose }) => {
  const { t } = useTranslation();
  const { result } = image;

  if (!isOpen || !result) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Low': return <CheckCircleIcon className="w-5 h-5" />;
      case 'Medium': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'High': return <XCircleIcon className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{t('result.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={image.preview}
                alt="Plant analysis"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-gray-800">{result.disease}</h3>
              <div className="flex items-center justify-center space-x-4">
                <span className={`inline-flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium ${getSeverityColor(result.severity)}`}>
                  {getSeverityIcon(result.severity)}
                  <span>{t(`common.${result.severity.toLowerCase()}`)} {t('result.severity')}</span>
                </span>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(result.confidence * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">{t('result.confidence')}</div>
                </div>
              </div>
              <p className="text-gray-600">
                {t('result.recoveryTime')}: <span className="font-semibold">{result.recoveryTime}</span>
              </p>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h4 className="text-lg font-bold text-green-800 mb-3 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {t('result.treatment')}
            </h4>
            <p className="text-green-700 leading-relaxed">{result.cure}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h4 className="text-lg font-bold text-blue-800 mb-3">{t('result.prevention')}</h4>
            <ul className="text-blue-700 space-y-2">
              {(result.preventiveMeasures || []).map((measure, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="text-blue-500 mt-1 font-bold">•</span>
                  <span className="leading-relaxed">{measure}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-center space-x-4">
            <button
              onClick={onClose}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
            >
              {t('result.gotIt')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;