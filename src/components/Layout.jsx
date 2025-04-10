
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Home/Header';
import Footer from './Home/Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-20">
      <Header />
      </div>
      
      <main className="flex-grow ">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;