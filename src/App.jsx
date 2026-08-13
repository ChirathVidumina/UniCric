import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UOMOppositionScout from './pages/UOMOppositionScout';
import Tournaments from './pages/Tournaments';
import TeamsPlayers from './pages/TeamsPlayers';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <main className="main-viewport" style={{ maxWidth: '100%', padding: 0 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<UOMOppositionScout />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/teams-players" element={<TeamsPlayers />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
