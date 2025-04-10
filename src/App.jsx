// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './Home';
import SeriesDetail from './components/pages/Series/SeriesDetail';
import GenreList from './components/pages/GenreList';
import AnimationDetail from './components/pages/AnimationDetail';
import MovieDetail from './components/pages/Movie/MovieDetail';
import MovieList from './components/pages/MovieList';
import AllSeries from './components/pages/Series/AllSeries';
import Chatbox from './components/pages/Chatbox';

const App = () => {
    
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/series/tmdb/:id" element={<SeriesDetail />} />
          <Route path="/series/backend/:id" element={<SeriesDetail />} />
          <Route path="/genres" element={<GenreList />} />
          <Route path="/animation/:id" element={<AnimationDetail />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/movielist" element={<MovieList />} />
          <Route path="/all-series" element={<AllSeries />} />
          <Route path="/chatbox" element={<Chatbox />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;