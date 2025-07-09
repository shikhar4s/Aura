import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

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

interface ResultCardProps {
  image: PlantImage;
}

const ResultCard: React.FC<ResultCardProps> = ({ image }) => {
  const { result } = image;

  if (!result) return null;

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
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
      {/* Image Preview */}
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        <img
          src={image.preview}
          alt="Plant analysis"
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Results */}
      <div className="p-6 space-y-4">
        {/* Disease Name & Confidence */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">{result.disease}</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(result.confidence * 100)}%
            </div>
            <div className="text-sm text-gray-600">Confidence</div>
          </div>
        </div>

        {/* Severity */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.severity)}`}>
            {getSeverityIcon(result.severity)}
            <span>{result.severity} Severity</span>
          </span>
          <span className="text-sm text-gray-600">
            Recovery: {result.recoveryTime}
          </span>
        </div>

        {/* Cure */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">Recommended Treatment</h4>
          <p className="text-green-700 text-sm">{result.cure}</p>
        </div>

        {/* Preventive Measures */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Prevention Tips</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            {result.preventiveMeasures.map((measure, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{measure}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;