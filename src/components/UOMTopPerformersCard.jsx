import React, { useState, useEffect } from 'react';
import { Award, Zap, Star, Trophy, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function UOMTopPerformersCard({ performers }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [internalPerformers, setInternalPerformers] = useState([]);

  useEffect(() => {
    if (performers && performers.length > 0) {
      setInternalPerformers(performers);
      return;
    }

    // Fetch from dashboard API if not passed via props
    const fetchTopPerformers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dashboard`);
        if (res.ok) {
          const data = await res.json();
          if (data.topPerformers && data.topPerformers.length > 0) {
            setInternalPerformers(data.topPerformers);
          }
        }
      } catch (err) {
        console.error("Error loading top performers:", err);
      }
    };

    fetchTopPerformers();
  }, [performers]);

  const defaultSlides = [
    { 
      title: "🌟 STAR PERFORMER", 
      name: "No Performer Logged", 
      sub: "Upload Match Scorecards", 
      icon: "star" 
    }
  ];

  const slides = internalPerformers.length > 0 ? internalPerformers : defaultSlides;

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'star':
        return <Star size={20} color="#f59e0b" />;
      case 'zap':
        return <Zap size={20} color="#f97316" />;
      case 'award':
        return <Award size={20} color="#3b82f6" />;
      default:
        return <Trophy size={20} color="#10b981" />;
    }
  };

  const handleNext = () => {
    if (!fade || slides.length <= 1) return;
    
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setFade(true);
    }, 200);
  };

  const currentSlide = slides[currentIndex % slides.length] || slides[0];

  return (
    <div 
      className="stat-card" 
      onClick={handleNext}
      style={{ cursor: slides.length > 1 ? 'pointer' : 'default', userSelect: 'none', display: 'flex', flexDirection: 'column', minHeight: '142px' }}
      title={slides.length > 1 ? "Click to view next performer" : undefined}
    >
      <div style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.2s ease-in-out', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="stat-header" style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>{currentSlide.title}</span>
          <div className="stat-icon">{getIconComponent(currentSlide.icon)}</div>
        </div>
        <div className="stat-value" style={{ fontSize: '1.25rem', color: '#60a5fa', marginBottom: '0.25rem' }}>
          {currentSlide.name}
        </div>
        <div className="stat-change positive" style={{ marginTop: 'auto', alignSelf: 'flex-start', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
          {currentSlide.sub}
        </div>
      </div>
      
      {/* Pagination / Hint */}
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: '12px', right: '15px', display: 'flex', gap: '5px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginRight: '4px', fontWeight: '800', letterSpacing: '0.05em' }}>TAP</span>
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              style={{ 
                width: idx === (currentIndex % slides.length) ? '6px' : '4px', 
                height: idx === (currentIndex % slides.length) ? '6px' : '4px', 
                borderRadius: '50%', 
                background: idx === (currentIndex % slides.length) ? '#60a5fa' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
