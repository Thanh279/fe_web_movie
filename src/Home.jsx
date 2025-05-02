import React from 'react';
import Content from './components/Content';
import Banner from './components/Banner';
import Rankings from './components/pages/Rankings';
import './assets/styles/css.css';



const Home = () => {
  return (
    <div>

      <div className="mt-20">
        <Banner />
      </div>
      <div className="mx-auto p-4">
        <div className="flex flex-col md:flex-row">
          <Content />
          <Rankings className="w-full md:w-1/5" />
        </div>
      </div>
    </div>
  );
};

export default Home;