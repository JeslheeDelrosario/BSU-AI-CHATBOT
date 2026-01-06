// client/src/components/DigitalSerenity.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Ripple { id: number; x: number; y: number; }
interface MouseGradient { left: string; top: string; opacity: number; }

const DigitalSerenity: React.FC = () => {
  const [mouseGradientStyle, setMouseGradientStyle] = useState<MouseGradient>({
    left: '0px', top: '0px', opacity: 0,
  });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [scrolled, setScrolled] = useState(false);

  // Word animation
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.word-animate').forEach((el, i) => {
        setTimeout(() => el.classList.add('animate'), i * 150);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Mouse glow
  useEffect(() => {
    const move = (e: MouseEvent) => setMouseGradientStyle({
      left: `${e.clientX}px`, top: `${e.clientY}px`, opacity: 1,
    });
    const leave = () => setMouseGradientStyle(prev => ({ ...prev, opacity: 0 }));
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
    };
  }, []);

  // Ripple effect
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const id = Date.now();
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1200);
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, []);

  // Floating particles
  useEffect(() => {
    const handleScroll = () => {
      if (!scrolled) {
        setScrolled(true);
        document.querySelectorAll('.float-particle').forEach((el, i) => {
          setTimeout(() => el.classList.add('active'), i * 100, 200);
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const styles = `
    @keyframes word-appear {
      from { opacity: 0; transform: translateY(30px); filter: blur(4px); }
      to   { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
      50%      { transform: translateY(-30px) translateX(15px); opacity: 0.8; }
    }
    @keyframes ripple {
      to { transform: translate(-50%, -50%) scale(50); opacity: 0; }
    }
    .word-animate { opacity: 0; }
    .word-animate.animate { animation: word-appear 1s ease-out forwards; }
    .float-particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: #67e8f9;
      border-radius: 50%;
      opacity: 0;
      box-shadow: 0 0 12px #67e8f9;
      animation: float 8s infinite ease-in-out;
      animation-play-state: paused;
    }
    .float-particle.active {
      opacity: 0.6;
      animation-play-state: running;
    }
    .ripple-effect {
      position: fixed;
      width: 10px;
      height: 10px;
      background: rgba(103, 232, 249, 0.6);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      animation: ripple 1.2s ease-out forwards;
      z-index: 9999;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="min-h-screen bg-black text-white overflow-hidden relative">

        {/* Glowing Orbs – cyan + purple only (no pink) */}
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 -right-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/25 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating Particles */}
        <div className="float-particle" style={{ top: '15%', left: '8%' }}></div>
        <div className="float-particle" style={{ top: '70%', left: '88%', animationDelay: '1s' }}></div>
        <div className="float-particle" style={{ top: '35%', left: '12%', animationDelay: '2s' }}></div>
        <div className="float-particle" style={{ top: '85%', left: '80%', animationDelay: '3s' }}></div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 py-20">

          <p className="text-cyan-400 text-lg font-light tracking-widest uppercase mb-12">
            <span className="word-animate">Future</span>{' '}
            <span className="word-animate" style={{ animationDelay: '0.3s' }}>of</span>{' '}
            <span className="word-animate" style={{ animationDelay: '0.6s' }}>Learning</span>
          </p>

          <div className="mb-10">
            <img src="/icon-logo.png" alt="TISA" className="w-32 h-32 object-contain drop-shadow-2xl" />
          </div>

          {/* Hero Title – cyan → indigo gradient (no pink) */}
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-center mb-8">
            <span className="block bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent word-animate" style={{ animationDelay: '1s' }}>
              T I S A
            </span>
          </h1>

          <p className="text-2xl md:text-4xl font-extralight text-gray-300 text-center max-w-5xl leading-relaxed mb-16">
            <span className="word-animate" style={{ animationDelay: '1.8s' }}>Towards</span>{' '}
            <span className="word-animate" style={{ animationDelay: '2s' }}>Intelligence</span>{' '}
            <span className="word-animate" style={{ animationDelay: '2.2s' }}>Student</span>{' '}
            <span className="word-animate" style={{ animationDelay: '2.4s' }}>Assistant</span>
          </p>

          {/* CTA Button – cyan → purple only */}
          <div className="word-animate" style={{ animationDelay: '3s' }}>
            <Link
              to="/login"
              className="group relative inline-flex items-center gap-5 px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-bold text-xl tracking-wide overflow-hidden shadow-2xl hover:shadow-cyan-500/40 transition-all duration-500 hover:scale-105"
            >
              <span className="relative z-10">Launch TISA</span>
              <div className="relative z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
            </Link>
          </div>

          <p className="mt-24 text-gray-500 text-sm tracking-widest">
            <span className="word-animate" style={{ animationDelay: '3.6s' }}>Bulacan State University</span>
            <span className="mx-4">•</span>
            <span className="word-animate" style={{ animationDelay: '3.8s' }}>AI-Powered Education</span>
          </p>
        </div>

        {/* Mouse Glow – cyan only */}
        <div
          className="fixed w-96 h-96 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 blur-3xl transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle, rgba(103,232,249,0.3), transparent 70%)',
            ...mouseGradientStyle,
          }}
        />

        {/* Ripples */}
        {ripples.map(r => (
          <div key={r.id} className="ripple-effect" style={{ left: r.x, top: r.y }} />
        ))}
      </div>
    </>
  );
};

export default DigitalSerenity;