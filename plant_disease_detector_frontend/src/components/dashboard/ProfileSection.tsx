import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { usePlantData } from '../../contexts/PlantDataContext';
import { UserIcon, CameraIcon, ChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ProfileSection = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { images } = usePlantData();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const analyzedImages = images.filter(img => img.result);
  const totalUploads = images.length;
  const joinDate = new Date(2024, 0, 1); // Mock join date

  const handleSave = async () => {
    // Mock save - in real app, this would update the user profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('dashboard.profile.title')}</h1>
        <p className="text-gray-600">{t('dashboard.profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">{t('dashboard.profile.personalInfo')}</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  {t('dashboard.profile.editProfile')}
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                  >
                    {t('dashboard.profile.save')}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    {t('dashboard.profile.cancel')}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <button className="mt-2 text-sm text-green-600 hover:text-green-700 flex items-center space-x-1">
                    <CameraIcon className="w-4 h-4" />
                    <span>{t('dashboard.profile.changePhoto')}</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.profile.fullName')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.profile.emailAddress')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  {t('dashboard.profile.signOut')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.profile.accountStats')}</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CameraIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.analytics.totalUploads')}</p>
                    <p className="text-lg font-semibold text-gray-800">{totalUploads}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.analytics.analyzed')}</p>
                    <p className="text-lg font-semibold text-gray-800">{analyzedImages.length}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('dashboard.profile.memberSince')}</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {joinDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.profile.preferences')}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('dashboard.profile.emailNotifications')}</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('dashboard.profile.analysisAlerts')}</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('dashboard.profile.monthlyReports')}</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;