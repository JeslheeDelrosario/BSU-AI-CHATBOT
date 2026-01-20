// client/src/components/DigitalSerenityWithSummary.tsx
// CONVERTED TO SASS LANDING PAGE
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Users, BookOpen, Bot, Settings, Search } from 'lucide-react';

interface Ripple { id: number; x: number; y: number; }
interface MouseGradient { left: string; top: string; opacity: number; }

const DigitalSerenityWithSummary: React.FC = () => {
  const [mouseGradientStyle, setMouseGradientStyle] = useState<MouseGradient>({
    left: '0px', top: '0px', opacity: 0,
  });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  // Floating particles and scroll detection
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

  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer: "Go to the 'Browse Courses' section, select your desired course, and click the 'Enroll' button. You'll get immediate access to all course materials."
    },
    {
      question: "Can the AI Tutor understand both English and Filipino?",
      answer: "Yes! The AI Tutor supports bilingual interaction. You can ask questions in either language and receive responses in the same language."
    },
    {
      question: "How do teachers upload course materials?",
      answer: "Teachers can access their dashboard, go to 'My Courses', select the specific course, and use the 'Upload Materials' feature to add documents, videos, or assignments."
    },
    {
      question: "What can administrators do in the system?",
      answer: "Admins have full control: manage user accounts, configure system settings, monitor all activities, generate reports, and approve course content."
    },
    {
      question: "How is my learning progress tracked?",
      answer: "The system automatically tracks completed modules, quiz scores, time spent, and assignment submissions. View your progress in the 'My Courses' section."
    },
    {
      question: "Can I access the system on my phone?",
      answer: "Yes! The platform is fully responsive and works on all devices. For best experience, use Chrome or Safari on your mobile browser."
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page. You'll receive an email with a password reset link valid for 24 hours."
    },
    {
      question: "Are there any system requirements?",
      answer: "Modern web browser (Chrome 90+, Firefox 88+, Safari 14+), stable internet connection, and JavaScript enabled. No additional software needed."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
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
    .scroll-indicator {
      animation: bounce 2s infinite;
    }
  `;

  const scrollToSummary = () => {
    const summarySection = document.getElementById('system-summary');
    if (summarySection) {
      summarySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        {/* DigitalSerenity Background Elements - Cover Entire Page */}
        
        {/* Glowing Orbs – cyan + purple only (no pink) */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 -right-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/25 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid Background */}
        <div 
          className="fixed inset-0 opacity-5 pointer-events-none"
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
        <div className="float-particle" style={{ top: '50%', left: '50%', animationDelay: '4s' }}></div>
        <div className="float-particle" style={{ top: '25%', left: '75%', animationDelay: '5s' }}></div>
        <div className="float-particle" style={{ top: '60%', left: '25%', animationDelay: '6s' }}></div>

        {/* Mouse Glow */}
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

        {/* Content Container */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="min-h-screen flex flex-col justify-center items-center px-6 py-20">
            <div className="max-w-7xl mx-auto w-full">
              <p className="text-cyan-400 text-lg font-light tracking-widest uppercase mb-12 text-center">
                <span className="word-animate">Future</span>{' '}
                <span className="word-animate" style={{ animationDelay: '0.3s' }}>of</span>{' '}
                <span className="word-animate" style={{ animationDelay: '0.6s' }}>Learning</span>
              </p>

              <div className="flex justify-center mb-10">
                <img src="/icon-logo.png" alt="TISA" className="w-32 h-32 object-contain drop-shadow-2xl" />
              </div>

              {/* Hero Title – cyan → indigo gradient (no pink) */}
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-center mb-8">
                <span className="block bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent word-animate" style={{ animationDelay: '1s' }}>
                  T I S A
                </span>
              </h1>

              <p className="text-2xl md:text-4xl font-extralight text-gray-300 text-center max-w-5xl mx-auto leading-relaxed mb-16">
                <span className="word-animate" style={{ animationDelay: '1.8s' }}>Towards</span>{' '}
                <span className="word-animate" style={{ animationDelay: '2s' }}>Intelligence</span>{' '}
                <span className="word-animate" style={{ animationDelay: '2.2s' }}>Student</span>{' '}
                <span className="word-animate" style={{ animationDelay: '2.4s' }}>Assistant</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center mb-20">
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
                
                <button
                  onClick={scrollToSummary}
                  className="word-animate inline-flex items-center gap-3 px-8 py-6 border border-cyan-500/30 rounded-2xl font-medium text-lg hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300"
                  style={{ animationDelay: '3.2s' }}
                >
                  <span>Explore Features</span>
                  <ChevronDown className="w-5 h-5 scroll-indicator" />
                </button>
              </div>

              <p className="text-gray-500 text-sm tracking-widest text-center">
                <span className="word-animate" style={{ animationDelay: '3.6s' }}>Bulacan State University</span>
                <span className="mx-4">•</span>
                <span className="word-animate" style={{ animationDelay: '3.8s' }}>AI-Powered Education</span>
              </p>
            </div>
          </section>

          {/* System Summary Section */}
          <section id="system-summary" className="min-h-screen py-20 px-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  System Features Overview
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Explore the powerful features of our AI-powered learning platform designed for students, teachers, and administrators.
                </p>
              </div>

              {/* Main Content */}
              <div className="space-y-16">
                {/* AI Tutor Section */}
                <section id="ai-tutor" className="scroll-mt-20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Bot className="w-7 h-7 text-cyan-400" />
                    </div>
                    <h2 className="text-3xl font-bold">AI Tutor Assistant</h2>
                  </div>
                  
                  <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-cyan-300">Core Features</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mt-1">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            </div>
                            <span>24/7 Interactive Q&A Support</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mt-1">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            </div>
                            <span>Bilingual Support (English & Filipino)</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mt-1">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            </div>
                            <span>Step-by-step Problem Solving</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mt-1">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            </div>
                            <span>Personalized Learning Recommendations</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-cyan-300">Benefits</h3>
                        <p className="text-gray-300">
                          Get instant help with homework, understand complex concepts, and receive personalized study guidance anytime, anywhere. The AI Tutor adapts to your learning style and pace.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ILS Section */}
                <section id="ils" className="scroll-mt-20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Settings className="w-7 h-7 text-purple-400" />
                    </div>
                    <h2 className="text-3xl font-bold">Integrated Learning System (ILS)</h2>
                  </div>
                  
                  <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-purple-300">System Management</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            </div>
                            <span>Centralized Course & Resource Management</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            </div>
                            <span>Real-time Student Progress Tracking</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            </div>
                            <span>Automated Grading & Feedback System</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            </div>
                            <span>Comprehensive Learning Analytics</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-purple-300">Purpose</h3>
                        <p className="text-gray-300">
                          The ILS serves as the backbone of the platform, ensuring seamless integration of all learning components, maintaining data consistency, and providing actionable insights for continuous improvement.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* User Accounts Section */}
                <section id="user-accounts" className="scroll-mt-20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Users className="w-7 h-7 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold">User Account Types</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Student Card */}
                    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold">Students</h3>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>Access enrolled courses & modules</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>Track learning progress & achievements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>Submit assignments & take quizzes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>Receive personalized recommendations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>Interact with AI Tutor for assistance</span>
                        </li>
                      </ul>
                    </div>

                    {/* Teacher Card */}
                    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold">Teachers</h3>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>Create & manage course content</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>Upload lectures & learning materials</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>Monitor student performance & analytics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>Grade assignments & provide feedback</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>Manage course enrollments</span>
                        </li>
                      </ul>
                    </div>

                    {/* Admin Card */}
                    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <Settings className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold">Administrators</h3>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          <span>Full system configuration & control</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          <span>User management & role assignment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          <span>System analytics & reporting</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          <span>Content moderation & approval</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          <span>Backup & system maintenance</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Additional Features Section */}
                <section id="features" className="scroll-mt-20">
                  <h2 className="text-3xl font-bold mb-8 text-center">Additional Features</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Browse Courses */}
                    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                          <Search className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold">Browse Courses</h3>
                      </div>
                      <p className="text-gray-300 mb-4">
                        Explore available courses with powerful filtering and search capabilities:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                          <span>Search by title, category, or instructor</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                          <span>Filter by difficulty level and duration</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                          <span>Preview course content and reviews</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                          <span>One-click enrollment process</span>
                        </li>
                      </ul>
                    </div>

                    {/* My Courses */}
                    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-pink-400" />
                        </div>
                        <h3 className="text-xl font-bold">My Courses</h3>
                      </div>
                      <p className="text-gray-300 mb-4">
                        Your personalized learning dashboard with all enrolled courses:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                          <span>View all enrolled courses at a glance</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                          <span>Track completion progress visually</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                          <span>Access course materials & assignments</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                          <span>Continue where you left off</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="scroll-mt-20">
                  <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                      Find quick answers to common questions about using the TISA platform
                    </p>
                  </div>
                  
                  <div className="max-w-4xl mx-auto">
                    {faqs.map((faq, index) => (
                      <div 
                        key={index} 
                        className="mb-4 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden transition-all duration-300"
                      >
                        <button
                          onClick={() => toggleFaq(index)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-cyan-500/10 transition-colors duration-200"
                        >
                          <span className="text-lg font-semibold">{faq.question}</span>
                          {openFaq === index ? (
                            <ChevronUp className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        
                        <div 
                          className={`overflow-hidden transition-all duration-300 ${
                            openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="p-6 pt-0">
                            <div className="pl-4 border-l-2 border-cyan-500">
                              <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <footer className="border-t border-gray-800/50 mt-20 pt-8 pb-6">
                <div className="text-center text-gray-500 text-sm">
                  <p>© {new Date().getFullYear()} TISA - Towards Intelligence Student Assistant</p>
                  <p className="mt-2">Bulacan State University | AI-Powered Learning Platform</p>
                </div>
              </footer>
            </div>
          </section>

          {/* Floating Navigation */}
          <button
            onClick={scrollToTop}
            className="fixed right-6 bottom-6 z-50 w-12 h-12 bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-full flex items-center justify-center hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-300"
            title="Back to Top"
          >
            <ChevronUp className="w-5 h-5 text-cyan-400" />
          </button>

          {/* Quick Navigation Dots */}
          <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4">
            {['hero', 'ai-tutor', 'ils', 'user-accounts', 'features', 'faq'].map((section) => (
              <a
                key={section}
                href={`#${section}`}
                className="w-3 h-3 bg-gray-600 rounded-full hover:bg-cyan-400 transition-all duration-300"
                title={section === 'hero' ? 'Top' : section.replace('-', ' ')}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DigitalSerenityWithSummary;