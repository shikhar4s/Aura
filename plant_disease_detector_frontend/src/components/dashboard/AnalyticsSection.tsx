import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePlantData } from '../../contexts/PlantDataContext';
import { ChartBarIcon, EyeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const AnalyticsSection = () => {
  const { t } = useTranslation();
  const { images } = usePlantData();

  const analyzedImages = images.filter(img => img.result);
  const totalUploads = images.length;
  const successRate = totalUploads > 0 ? (analyzedImages.length / totalUploads) * 100 : 0;

  // Disease distribution
  const diseaseCount = analyzedImages.reduce((acc, img) => {
    if (img.result) {
      acc[img.result.disease] = (acc[img.result.disease] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Severity distribution
  const severityCount = analyzedImages.reduce((acc, img) => {
    if (img.result) {
      acc[img.result.severity] = (acc[img.result.severity] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Average confidence
  const avgConfidence = analyzedImages.length > 0 
    ? analyzedImages.reduce((sum, img) => sum + (img.result?.confidence || 0), 0) / analyzedImages.length
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('dashboard.analytics.title')}</h1>
        <p className="text-gray-600">{t('dashboard.analytics.subtitle')}</p>
      </div>

      {totalUploads === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-12 border border-white/20 text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('dashboard.analytics.noData')}</h3>
          <p className="text-gray-500">{t('dashboard.analytics.noDataSubtext')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('dashboard.analytics.totalUploads')}</p>
                  <p className="text-2xl font-bold text-gray-800">{totalUploads}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <EyeIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('dashboard.analytics.analyzed')}</p>
                  <p className="text-2xl font-bold text-gray-800">{analyzedImages.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('dashboard.analytics.successRate')}</p>
                  <p className="text-2xl font-bold text-gray-800">{Math.round(successRate)}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('dashboard.analytics.avgConfidence')}</p>
                  <p className="text-2xl font-bold text-gray-800">{Math.round(avgConfidence * 100)}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Disease Distribution */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.analytics.diseaseDistribution')}</h3>
              {Object.keys(diseaseCount).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(diseaseCount).map(([disease, count]) => (
                    <div key={disease} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{disease}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(count / analyzedImages.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">{t('dashboard.analytics.noData')}</p>
              )}
            </div>

            {/* Severity Distribution */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.analytics.severityDistribution')}</h3>
              {Object.keys(severityCount).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(severityCount).map(([severity, count]) => {
                    const color = severity === 'Low' ? 'bg-green-500' : 
                                 severity === 'Medium' ? 'bg-yellow-500' : 'bg-red-500';
                    return (
                      <div key={severity} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t(`common.${severity.toLowerCase()}`)}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${color} h-2 rounded-full`}
                              style={{ width: `${(count / analyzedImages.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">{t('dashboard.analytics.noData')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSection;