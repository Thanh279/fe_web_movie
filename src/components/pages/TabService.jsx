import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaHistory, FaHeart } from 'react-icons/fa';
import WatchHistory from '../Service/WatchHistory';
import Favorites from '../Service/Favorites';
import Profile from '../Auth/User/Profile'; 

const TabService = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('watch-history')) return 'history';
    if (location.pathname.includes('favorites')) return 'favorites';
    return 'profile';
  });

  // Synchronize activeTab with route changes
  useEffect(() => {
    if (location.pathname.includes('watch-history')) {
      setActiveTab('history');
    } else if (location.pathname.includes('favorites')) {
      setActiveTab('favorites');
    } else {
      setActiveTab('profile');
    }
  }, [location.pathname]); // Re-run when location.pathname changes

  // Retrieve userName from localStorage
  const userName = localStorage.getItem('userName') || 'Khách';

  const tabs = [
    { id: 'profile', name: 'Thông tin tài khoản', icon: <FaUser className="text-gray-400" />, path: '/profile' },
    { id: 'history', name: 'Lịch sử xem', icon: <FaHistory className="text-gray-400" />, path: '/watch-history' },
    { id: 'favorites', name: 'Phim yêu thích', icon: <FaHeart className="text-gray-400" />, path: '/favorites' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-[#5a6170] via-[#4a5060] to-[#5a6170] p-8 text-center">
        <h1 className="text-white text-xl sm:text-2xl font-normal">
          Xin chào {userName}
        </h1>
        <nav className="mt-4 flex justify-center space-x-8 text-sm sm:text-base">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 ${
                activeTab === tab.id
                  ? 'text-sky-400 border-b-2 border-sky-400 pb-1'
                  : 'text-gray-300 hover:text-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </Link>
          ))}
        </nav>
      </header>

      <div className="container mx-auto px-4 pb-8">
        {activeTab === 'profile' && <Profile />}

        {activeTab === 'history' && <WatchHistory />}

        {activeTab === 'favorites' && <Favorites />}
      </div>
    </div>
  );
};

export default TabService;