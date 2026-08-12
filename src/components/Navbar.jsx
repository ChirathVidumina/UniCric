import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldAlert, Trophy, Users, Target, Home, Upload } from 'lucide-react';
import '../assets/styles/navbar.css';

export const Navbar = () => {
  return (
    <header className="navbar-header" style={{ background: '#0b1329', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div className="navbar-inner">
        {/* Brand / Official Mora Cricket Logo */}
        <div className="navbar-brand">
          <Link to="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <img 
              src="/mora_logo.png" 
              alt="Mora Cricket Logo" 
              style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '8px', 
                objectFit: 'cover',
                border: '1.5px solid #dc2626',
                boxShadow: '0 0 14px rgba(220, 38, 38, 0.5)'
              }} 
            />
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif', lineHeight: '1.1', color: 'white' }}>
                Uni<span className="brand-highlight" style={{ color: '#dc2626' }}>Cric</span>
              </div>
              <span style={{ fontSize: '0.65rem', display: 'block', color: '#94a3b8', letterSpacing: '0.08em', fontWeight: '700' }}>
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
            <Home className="nav-icon" size={17} color="#dc2626" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/analytics" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Target className="nav-icon" size={17} color="#ef4444" />
            <span>Opponent Scouting & Analytics</span>
          </NavLink>

          <NavLink 
            to="/tournaments" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Trophy className="nav-icon" size={17} />
            <span>University Championship</span>
          </NavLink>

          <NavLink 
            to="/teams-players" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Users className="nav-icon" size={17} />
            <span>Teams & Players</span>
          </NavLink>

          <NavLink 
            to="/import" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Upload className="nav-icon" size={17} color="#10b981" />
            <span>PDF Upload</span>
          </NavLink>
        </nav>

        {/* Right Status Badge */}
        <div className="navbar-right">
          <div className="status-pill" style={{ color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.3)', background: 'rgba(220, 38, 38, 0.1)' }}>
            <span className="pulse-dot" style={{ backgroundColor: '#dc2626', boxShadow: '0 0 8px #dc2626' }}></span>
            <span>UOM INTEL LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
