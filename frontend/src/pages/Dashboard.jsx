import React, { useEffect, useState, useRef } from 'react';
import { Card, Progress, message } from 'antd';
import AnalyticsChart from '../components/AnalyticsChart';
import SmartProgressTracker from '../components/SmartProgressTracker';
import OnboardingModal from '../components/OnboardingModal';
import TypingEffect from 'react-typed.ts';
import { motion, useInView } from 'framer-motion';
import StudyRecommendations from '../components/StudyRecommendations';
import DashboardSidebar from '../components/DashboardSidebar';
import WeeklyStudyPlan from './WeeklyStudyPlan';
import { RocketOutlined, BookOutlined, LineChartOutlined, MessageOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const TYPING_SPEED = 80;

const SUBJECTS = [
  'Maths',
  'Science',
  'History',
  'English',
  'Geography',
  'Computer',
  'General Knowledge',
  'Space',
  'Coding',
];

// Add helper for time ago
function timeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000); // seconds
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return then.toLocaleDateString();
}

const Dashboard = ({ user, progress = 0, onUserUpdate }) => {
  const [typedName, setTypedName] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const subjectRef = useRef(null);
  const isInView = useInView(subjectRef, { once: false, margin: '-100px' });
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [progressSummary, setProgressSummary] = useState({
    totalQuizzes: 0,
    totalStudyTime: 0,
    subjectsStudied: 0,
    averageScore: 0
  });
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    // Check if user needs onboarding
    if (user && !user.isOnboarded) {
      setShowOnboarding(true);
      setEditMode(false);
    }
  }, [user]);

  useEffect(() => {
    // Fetch progress data when user is logged in
    if (user && user._id) {
      fetchProgressData();
    }
  }, [user]);

  useEffect(() => {
    let idx = 0;
    setTypedName('');
    setShowCursor(true);
    if (!user?.name) return;
    const type = () => {
      if (idx <= user.name.length) {
        setTypedName(user.name.slice(0, idx));
        idx++;
        setTimeout(type, TYPING_SPEED);
      } else {
        setShowCursor(false);
      }
    };
    type();
    // Cleanup
    return () => setTypedName('');
  }, [user?.name]);

  const handleOnboardingComplete = async (profileData) => {
    setOnboardingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://a-istudy-lab.vercel.app/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      
      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update parent component
      if (onUserUpdate) {
        onUserUpdate(data.user);
      }

      setShowOnboarding(false);
      setEditMode(false);
      message.success('Profile updated!');
    } catch (error) {
      message.error('Failed to update profile. Please try again.');
      console.error('Onboarding error:', error);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch weekly progress
      const weeklyResponse = await fetch('https://a-istudy-lab.vercel.app/api/progress/weekly', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json();
        setWeeklyProgress(weeklyData.data || []);
      }

      // Fetch progress summary
      const summaryResponse = await fetch('https://a-istudy-lab.vercel.app/api/progress/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setProgressSummary(summaryData.data || {
          totalQuizzes: 0,
          totalStudyTime: 0,
          subjectsStudied: 0,
          averageScore: 0
        });
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleWeeklyPlanClick = () => {
    setShowWeeklyPlan(true);
  };

  if (!user?.name) {
    const navigate = useNavigate();
    const features = [
      {
        icon: <RocketOutlined style={{ fontSize: 36, color: '#4fc3f7' }} />, title: 'AI Study Assistant',
        desc: 'Personalized AI-powered study assistant for instant help.'
      },
      {
        icon: <BookOutlined style={{ fontSize: 36, color: '#81c784' }} />, title: 'Curated Resources',
        desc: 'Access curated quizzes, books, and learning resources.'
      },
      {
        icon: <LineChartOutlined style={{ fontSize: 36, color: '#ffd54f' }} />, title: 'Progress Tracking',
        desc: 'Smart progress tracking and weekly study plans.'
      },
      {
        icon: <MessageOutlined style={{ fontSize: 36, color: '#ff8a65' }} />, title: 'Chat Assistant',
        desc: 'Interactive chat assistant for all your questions.'
      },
      {
        icon: <LockOutlined style={{ fontSize: 36, color: '#ba68c8' }} />, title: 'Secure Dashboard',
        desc: 'Secure, personalized dashboard for your learning journey.'
      },
    ];
    return (
      <div style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', padding: 0 }}>
        <div style={{ marginTop: 64, marginBottom: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 44, fontWeight: 700, color: '#fff', letterSpacing: 1, margin: 0 }}>
            Welcome to <span>
              <TypingEffect
                strings={["AIStudyLab"]}
                typeSpeed={120}
                backSpeed={60}
                loop={true}
                showCursor={true}
                cursorChar="|"
              />
            </span>
          </h1>
        </div>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto', marginBottom: 32 }}>
          <p style={{ color: '#fff', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
            Start your learning journey with AIStudyLab! Our platform empowers you to master any subject, track your progress, and get instant help from our AI assistant.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'linear-gradient(90deg, #4fc3f7 0%, #1976d2 100%)', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 8, padding: '12px 36px', cursor: 'pointer', marginBottom: 12, boxShadow: '0 2px 8px #1976d255' }}
          >
            Login to Get Started
          </button>
        </div>
        <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', marginBottom: 32 }}>
          <div style={{ color: '#fff', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>
            Platform Features
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 28,
            justifyContent: 'center',
            alignItems: 'stretch',
            margin: '0 auto',
          }}>
            {features.map((f, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.07)',
                borderRadius: 18,
                padding: '32px 18px',
                textAlign: 'center',
                boxShadow: '0 2px 12px #0001',
                border: '1.5px solid #4fc3f733',
                minHeight: 180,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                {f.icon}
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginTop: 18, marginBottom: 10 }}>{f.title}</div>
                <div style={{ color: '#b3e5fc', fontSize: 16, fontWeight: 500 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'linear-gradient(90deg, #4fc3f7 0%, #1976d2 100%)', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 8, padding: '12px 36px', cursor: 'pointer', marginTop: 18, boxShadow: '0 2px 8px #1976d255' }}
          >
            Login to Experience All Features
          </button>
        </div>
      </div>
    );
  }

  // Build dynamic Recent Activity
  let recentActivity = [];
  if (weeklyProgress && weeklyProgress.length > 0) {
    weeklyProgress.forEach(day => {
      const dateStr = day.date;
      // Completed quiz
      if (day.quizzesCompleted > 0) {
        (day.subjectsStudied || []).forEach(subject => {
          recentActivity.push({
            action: 'Completed',
            subject: `${subject} Quiz`,
            time: timeAgo(dateStr),
            score: day.progress ? `${day.progress}%` : null,
            date: dateStr
          });
        });
      }
      // Studied subject (but not completed quiz)
      else if (day.progress > 0 && day.studyTime > 0) {
        (day.subjectsStudied || []).forEach(subject => {
          recentActivity.push({
            action: 'Studied',
            subject: subject,
            time: timeAgo(dateStr),
            score: null,
            date: dateStr
          });
        });
      }
      // Started subject (no progress yet)
      else if (day.subjectsStudied && day.subjectsStudied.length > 0) {
        (day.subjectsStudied || []).forEach(subject => {
          recentActivity.push({
            action: 'Started',
            subject: subject,
            time: timeAgo(dateStr),
            score: null,
            date: dateStr
          });
        });
      }
    });
    // Sort by date descending
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    // Only show most recent 5
    recentActivity = recentActivity.slice(0, 5);
  }

  // Build dynamic Study Recommendations
  let allSubjects = weeklyProgress.reduce((acc, day) => {
    (day.subjectsStudied || []).forEach(subj => acc.add(subj));
    return acc;
  }, new Set());
  // Count study frequency for each subject
  let subjectCounts = {};
  weeklyProgress.forEach(day => {
    (day.subjectsStudied || []).forEach(subj => {
      subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
    });
  });
  // Find subjects with least frequency (or not studied at all)
  let allPossibleSubjects = Array.from(allSubjects);
  // If user has not studied anything, fallback to demo subjects
  if (allPossibleSubjects.length === 0) {
    allPossibleSubjects = ['Maths', 'Science', 'History', 'English', 'Geography', 'Computer Science'];
  }
  let recommendations = allPossibleSubjects
    .sort((a, b) => (subjectCounts[a] || 0) - (subjectCounts[b] || 0))
    .slice(0, 3)
    .map((subject, idx) => {
      let count = subjectCounts[subject] || 0;
      let priority = count === 0 ? 'High' : count === 1 ? 'Medium' : 'Low';
      let desc = count === 0 ? `You haven't studied ${subject} yet this week.` : `Revise ${subject} for better retention.`;
      return {
        title: `Study ${subject}`,
        desc,
        priority,
        time: '30 min'
      };
    });

  return (
    <div
      style={{
        padding: 32,
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        gap: 24
      }}
    >
      <div style={{ flex: 1 }}>
        {/* Welcome Section */}
        <Card bordered={false} style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0, color: 'white', fontSize: 28, fontWeight: 700 }}>
                Welcome back, {typedName}
                {showCursor && <span className="typing-cursor">|</span>}
              </h2>
              <p style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
                Ready to continue your learning journey today?
              </p>
            </div>
            {/* <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Current Progress</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>{progress}%</div>
            </div> */}
          </div>
        </Card>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <Card bordered={false} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: 'white', boxShadow: '0 2px 12px #0001' }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>📚</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Subjects Studied</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{progressSummary.subjectsStudied}</div>
          </Card>
          <Card bordered={false} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: 'white', boxShadow: '0 2px 12px #0001' }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Quizzes Completed</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{progressSummary.totalQuizzes}</div>
          </Card>
          <Card bordered={false} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: 'white', boxShadow: '0 2px 12px #0001' }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>⏱️</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Study Time</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{Math.round(progressSummary.totalStudyTime / 60)}h</div>
          </Card>
          <Card bordered={false} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: 'white', boxShadow: '0 2px 12px #0001' }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Average Score</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{progressSummary.averageScore}%</div>
          </Card>
        </div>

        {/* Progress Analytics */}
        <Card bordered={false} style={{ marginBottom: 24, background: 'transparent',backdropFilter: 'blur(15px)',
 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 ,color:'white'}}>📈 Weekly Progress Analytics</h3>
            <div style={{ fontSize: 14, color: '#666' }}>Last 7 days</div>
          </div>
          
          {/* Line Chart Container */}
          <div style={{ 
            position: 'relative', 
            height: 200, 
            marginBottom: 16,
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px'
          }}>
            {/* Week Label */}
            <div style={{ 
              position: 'absolute', 
              top: -30, 
              left: 0, 
              right: 0, 
              textAlign: 'center',
              fontSize: 14,
              color: 'rgba(246, 242, 242, 0.8)',
              fontWeight: 600
            }}>
              Week of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            {/* Background Grid */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '20px',
              pointerEvents: 'none'
            }}>
              {[100, 75, 50, 25, 0].map((value) => (
                <div key={value} style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
                  height: 1,
                  position: 'relative'
                }}>
                  <span style={{ 
                    position: 'absolute', 
                    right: 0, 
                    top: -8, 
                    fontSize: 10, 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 500
                  }}>
                    {value}%
                  </span>
                </div>
              ))}
            </div>

            {/* Animated Line Chart */}
            <svg 
              width="100%" 
              height="100%" 
              style={{ position: 'absolute', top: -1, left: 0 }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Glow Effect */}
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                {/* Gradient Definition */}
                <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff69b4" stopOpacity="0.8"/>
                  <stop offset="50%" stopColor="#ff1493" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#ff69b4" stopOpacity="0.8"/>
                </linearGradient>
                
                {/* Area Gradient for Fill */}
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff1493" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#ff1493" stopOpacity="0.05"/>
                </linearGradient>
              </defs>
              
              {/* Animated Line Path */}
              <path
                d={loadingProgress ? 
                  "M 0,100 L 15,85 L 30,70 L 45,55 L 60,40 L 75,25 L 100,10" :
                  weeklyProgress.length > 0 ? 
                  `M ${weeklyProgress.map((day, index) => 
                    `${index * 16.66},${Math.max(0, Math.min(100, 100 - (day.cumulativeProgress || 0)))}`
                  ).join(' L ')}` : 
                  "M 0,100 L 15,85 L 30,70 L 45,55 L 60,40 L 75,25 L 100,10"
                }
                stroke="url(#pinkGradient)"
                strokeWidth="0.5"
                fill="none"
                filter="url(#glow)"
                style={{ 
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  animation: 'drawLine 2s ease-in-out'
                }}
              />
              
              {/* Area Fill */}
              <path
                d={loadingProgress ? 
                  "M 0,100 L 15,85 L 30,70 L 45,55 L 60,40 L 75,25 L 100,10 L 100,100 L 0,100 Z" :
                  weeklyProgress.length > 0 ? 
                  `M ${weeklyProgress.map((day, index) => 
                    `${index * 16.66},${Math.max(0, Math.min(100, 100 - (day.cumulativeProgress || 0)))}`
                  ).join(' L ')} L 100,100 L 0,100 Z` : 
                  "M 0,100 L 15,85 L 30,70 L 45,55 L 60,40 L 75,25 L 100,10 L 100,100 L 0,100 Z"
                }
                fill="url(#areaGradient)"
                opacity="0.6"
                style={{ animation: 'fillArea 2.5s ease-in-out' }}
              />
              
              {/* Animated Data Points */}
              {(loadingProgress ? 
                [
                  { x: 0, y: 100 },
                  { x: 15, y: 85 },
                  { x: 30, y: 70 },
                  { x: 45, y: 55 },
                  { x: 60, y: 40 },
                  { x: 75, y: 25 },
                  { x: 100, y: 10 }
                ] :
                weeklyProgress.length > 0 ? 
                weeklyProgress.map((day, index) => ({
                  x: index * 16.66,
                  y: Math.max(0, Math.min(100, 100 - (day.cumulativeProgress || 0)))
                })) : 
                [
                  { x: 0, y: 100 },
                  { x: 15, y: 85 },
                  { x: 30, y: 70 },
                  { x: 45, y: 55 },
                  { x: 60, y: 40 },
                  { x: 75, y: 25 },
                  { x: 100, y: 10 }
                ]
              ).map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="0"
                  fill="#ff1493"
                  stroke="white"
                  strokeWidth="0.2"
                  filter="url(#glow)"
                  style={{ 
                    animation: `pulsePoint 2s ease-in-out ${index * 0.2}s forwards`
                  }}
                />
              ))}
              
                             {/* Moving Dot */}
               <circle
                 cx="0"
                 cy="100"
                 r="1"
                 fill="#ff1493"
                 stroke="white"
                 strokeWidth="0.2"
                 filter="url(#glow)"
                 style={{ 
                   animation: 'moveDot 3s ease-in-out infinite'
                 }}
               />
            </svg>
            
            {/* CSS Animations */}
            <style>{`
              @keyframes drawLine {
                0% {
                  stroke-dasharray: 0 1000;
                  stroke-dashoffset: 0;
                }
                100% {
                  stroke-dasharray: 1000 0;
                  stroke-dashoffset: 0;
                }
              }
              
              @keyframes fillArea {
                0% {
                  opacity: 0;
                }
                100% {
                  opacity: 0.6;
                }
              }
              
                             @keyframes pulsePoint {
                 0% {
                   r: 0;
                   opacity: 0;
                 }
                 50% {
                   r: 1;
                   opacity: 1;
                 }
                 100% {
                   r: 1;
                   opacity: 1;
                 }
               }
              
              @keyframes moveDot {
                0% {
                  cx: ${weeklyProgress.length > 0 ? '0' : '0'};
                  cy: ${weeklyProgress.length > 0 ? (100 - (weeklyProgress[0]?.cumulativeProgress || 0)) : '100'};
                }
                16.66% {
                  cx: ${weeklyProgress.length > 0 ? '16.66' : '15'};
                  cy: ${weeklyProgress.length > 0 ? (100 - (weeklyProgress[1]?.cumulativeProgress || 0)) : '85'};
                }
                33.33% {
                  cx: ${weeklyProgress.length > 0 ? '33.33' : '30'};
                  cy: ${weeklyProgress.length > 0 ? (100 - (weeklyProgress[2]?.cumulativeProgress || 0)) : '70'};
                }
                50% {
                  cx: ${weeklyProgress.length > 0 ? '50' : '45'};
                  cy: ${weeklyProgress.length > 0 ? (100 - (weeklyProgress[3]?.cumulativeProgress || 0)) : '55'};
                }
                66.66% {
                  cx: ${weeklyProgress.length > 0 ? '66.66' : '60'};
                  cy: ${weeklyProgress.length > 0 ? (100 - (weeklyProgress[4]?.cumulativeProgress || 0)) : '40'};
                }
                83.33% {
                  cx: ${weeklyProgress.length > 0 ? '83.33' : '75'};
                  cy: ${weeklyProgress.length > 0 ? (100 - (weeklyProgress[5]?.cumulativeProgress || 0)) : '25'};
                }
                100% {
                  cx: ${weeklyProgress.length > 0 ? '100' : '100'};
                  cy: ${weeklyProgress.length > 0 ? (100 - (weeklyProgress[6]?.cumulativeProgress || 0)) : '10'};
                }
              }
            `}</style>
            
            {/* Day Labels */}
            <div style={{ 
              position: 'absolute', 
              bottom: -30, 
              left: 0, 
              right: 0, 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '0 20px'
            }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} style={{ 
                  fontSize: 12, 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontWeight: 500,
                  textAlign: 'center'
                }}>
                  {day}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',padding:'15px' }}>
            <div>
              <div style={{ fontSize: 14, color: '#666' }}>Overall Progress</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ff1493' }}>
                {weeklyProgress.length > 0 ? 
                  weeklyProgress[weeklyProgress.length - 1]?.cumulativeProgress || 0 : 
                  progress
                }%
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, color: '#666' }}>This Week</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#81c784' }}>
                {weeklyProgress.length > 0 ? 
                  `+${weeklyProgress.filter(day => day.progress > 0).length * 15}%` : 
                  '+12%'
                }
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity & Recommendations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent Activity */}
          <Card bordered={false} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: 'white', boxShadow: '0 2px 12px #0001' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600 }}>🕒 Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentActivity.length === 0 ? (
                <div style={{ color: '#eee', padding: 12 }}>No recent activity yet.</div>
              ) : recentActivity.map((activity, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px', 
                  background: 'rgba(255,255,255,0.13)', 
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.13)'
                }}>
                  <div style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    background: activity.score ? '#81c784' : '#ffd54f',
                    marginRight: 12 
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {activity.action} <span style={{ color: '#4fc3f7' }}>{activity.subject}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#eee' }}>{activity.time}</div>
                  </div>
                  {activity.score && (
                    <div style={{ 
                      padding: '4px 8px', 
                      background: 'rgba(129,199,132,0.15)', 
                      color: '#b7eb8f', 
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {activity.score}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Study Recommendations */}
          <Card bordered={false} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: 'white', boxShadow: '0 2px 12px #0001' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600 }}>💡 Study Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recommendations.length === 0 ? (
                <div style={{ color: '#eee', padding: 12 }}>No recommendations yet.</div>
              ) : recommendations.map((rec, index) => (
                <div key={index} style={{ 
                  padding: '12px', 
                  background: 'rgba(255,255,255,0.13)', 
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.13)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{rec.title}</div>
                    <div style={{ 
                      padding: '2px 6px', 
                      background: rec.priority === 'High' ? 'rgba(255,71,87,0.15)' : rec.priority === 'Medium' ? 'rgba(255,193,7,0.15)' : 'rgba(76,175,80,0.15)',
                      color: rec.priority === 'High' ? '#ff6b81' : rec.priority === 'Medium' ? '#ffd600' : '#b7eb8f',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600
                    }}>
                      {rec.priority}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#eee', marginBottom: 4 }}>{rec.desc}</div>
                  <div style={{ fontSize: 11, color: '#eee' }}>⏱️ {rec.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

       
      </div>

      <DashboardSidebar onWeeklyPlanClick={handleWeeklyPlanClick} weeklyProgress={weeklyProgress} progressSummary={progressSummary} />

      <OnboardingModal
        visible={showOnboarding}
        onFinish={handleOnboardingComplete}
        loading={onboardingLoading}
        initialValues={editMode ? user : undefined}
      />

      {/* Weekly Study Plan Modal */}
      {showWeeklyPlan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            width: '100%',
            maxWidth: 1200,
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowWeeklyPlan(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                zIndex: 1
              }}
            >
              ×
            </button>
            <WeeklyStudyPlan />
          </div>
        </div>
      )}

      <style>{`
        .typing-effect {
          display: inline-block;
          animation: fadeIn 1s cubic-bezier(.4,2,.6,1);
        }
        .typing-cursor {
          display: inline-block;
          width: 1ch;
          color: #1890ff;
          font-weight: 700;
          animation: blink 1s steps(1) infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 