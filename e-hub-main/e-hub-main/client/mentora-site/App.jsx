import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Hub from './pages/Hub';
import Tournaments from './pages/Tournaments';
import Players from './pages/Players';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/players" element={<Players />} />
        <Route path="/profile/:tag" element={<Profile />} />
      </Routes>
    </Router>
  );
}
