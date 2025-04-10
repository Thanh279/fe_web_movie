import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div>
          <p>&copy; 2025 Chuyên đề web 2 team Chí Thành vs Văn Huy</p>
        </div>
        <nav className="mt-4 md:mt-0">
          <ul className="flex space-x-4">
            <li><a href="#" className="text-gray-300 hover:text-white">About</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Licensing</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;