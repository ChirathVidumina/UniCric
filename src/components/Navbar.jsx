import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Target, Trophy, Users, Home } from 'lucide-react';
import '../assets/styles/navbar.css';

export const Navbar = () => {
  return (
    <header className="navbar-header">
      <div className="navbar-inner">
        {/* Brand / Official Mora Cricket Logo */}
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            <img 
              src="/mora_logo.png" 
              alt="Mora Cricket Logo" 
              style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '8px', 
                objectFit: 'cover',
                border: '1.5px solid #dc2626',
                boxShadow: '0 0 12px rgba(220, 38, 38, 0.45)'
              }} 
            />
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif', lineHeight: '1.1', color: 'white' }}>
                Uni<span className="brand-highlight">Cric</span>
              </div>
              <span style={{ fontSize: '0.62rem', display: 'block', color: '#94a3b8', letterSpacing: '0.08em', fontWeight: '700' }}>
                MORA CRICKET 2026
              </span>
            </div>
          </Link>
        </div>

        {/* Dynamic Nav Links */}
        <nav className="navbar-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            end
          >
            <Home className="nav-icon" size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Target className="nav-icon" size={18} />
            <span>Scouting</span>
          </NavLink>

          <NavLink 
            to="/tournaments" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Trophy className="nav-icon" size={18} />
            <span>Championship</span>
          </NavLink>

          <NavLink 
            to="/teams-players" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Users className="nav-icon" size={18} />
            <span>Squads</span>
          </NavLink>
        </nav>

        {/* Right Status Badge */}
        <div className="navbar-right">
          <div className="status-pill">
            <span className="pulse-dot"></span>
            <span>UOM INTEL LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
