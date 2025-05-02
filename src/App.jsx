// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './Home';
import SeriesDetail from './components/pages/Series/SeriesDetail';
import GenreList from './components/pages/Category/GenreList';
import AnimationDetail from './components/pages/AnimationDetail';
import MovieDetail from './components/pages/Movie/MovieDetail';
import MovieList from './components/pages/MovieList';
import AllSeries from './components/pages/Series/AllSeries';
import Chatbox from './components/pages/Chatbox';
import Login from './components/Auth/Login';
import WatchHistory from './components/Service/WatchHistory';
import Favorites from './components/Service/Favorites';
import TabService from './components/pages/TabService';
import CategoryDetail from './components/pages/Category/CategoryDetail';
import SearchResults from './components/Service/SearchResults';
import Comment from './components/Service/Comment';

const App = () => {

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/series/tmdb/:id" element={<SeriesDetail />} />
          <Route path="/series/tmdb/:id/episode/:episodeNumber" element={<SeriesDetail />} />
          <Route path="/genres" element={<GenreList />} />
          <Route path="/animation/:id" element={<AnimationDetail />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/movielist" element={<MovieList />} />
          <Route path="/all-series" element={<AllSeries />} />
          <Route path="/chatbox" element={<Chatbox />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<TabService />} />
          <Route path="/watch-history" element={<TabService />} />
          <Route path="/favorites" element={<TabService />} />
          <Route path="/category/:id" element={<CategoryDetail />} />
          <Route path="/search/:query" element={<SearchResults />} />
          <Route path="/series/tmdb/:id/comments" element={<Comment />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;