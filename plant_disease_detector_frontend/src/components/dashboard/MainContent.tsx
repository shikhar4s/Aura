import React from 'react';
import UploadSection from './UploadSection';
import HistorySection from './HistorySection';
import AnalyticsSection from './AnalyticsSection';
import ProfileSection from './ProfileSection';
import ContactSection from './ContactSection';

interface MainContentProps {
  activeTab: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadSection />;
      case 'history':
        return <HistorySection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'profile':
        return <ProfileSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return <UploadSection />;
    }
  };

  return (
    <div className="flex-1 p-8">
      {renderContent()}
    </div>
  );
};

export default MainContent;