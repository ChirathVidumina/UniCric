import React, { useState } from 'react';
import { Award, Zap, Star } from 'lucide-react';

export default function UOMTopPerformersCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const slides = [
    { title: "🌟 STAR PERFORMER", name: "Sathira Vikasitha", sub: "Crucial 48 runs (63 balls)", icon: <Star size={20} color="#f59e0b" /> },
    { title: "🏏 KEY STRIKE BATTER", name: "Muftee Mysan", sub: "Quickfire 33 (SR: 117.86)", icon: <Zap size={20} color="#f97316" /> },
    { title: "🎯 KEY STRIKE BOWLER", name: "Kevindu Perera", sub: "3 Wkts (Econ 2.67)", icon: <Award size={20} color="#3b82f6" /> }
  ];

  const handleNext = () => {
    // Prevent double clicking while fading
    if (!fade) return;
    
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setFade(true);
    }, 200); // Quick fade out for snappy feeling
  };

  return (
    <div 
      className="stat-card" 
      onClick={handleNext}
      style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', flexDirection: 'column', minHeight: '142px' }}
      title="Click to view next performer"
    >
      <div style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.2s ease-in-out', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="stat-header" style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>{slides[currentIndex].title}</span>
          <div className="stat-icon">{slides[currentIndex].icon}</div>
        </div>
        <div className="stat-value" style={{ fontSize: '1.25rem', color: '#60a5fa', marginBottom: '0.25rem' }}>
          {slides[currentIndex].name}
        </div>
        <div className="stat-change positive" style={{ marginTop: 'auto', alignSelf: 'flex-start', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
          {slides[currentIndex].sub}
        </div>
      </div>
      
      {/* Pagination / Hint */}
      <div style={{ position: 'absolute', bottom: '12px', right: '15px', display: 'flex', gap: '5px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginRight: '4px', fontWeight: '800', letterSpacing: '0.05em' }}>TAP</span>
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            style={{ 
              width: idx === currentIndex ? '6px' : '4px', 
              height: idx === currentIndex ? '6px' : '4px', 
              borderRadius: '50%', 
              background: idx === currentIndex ? '#60a5fa' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }} 
          />
        ))}
      </div>
    </div>
  );
}
