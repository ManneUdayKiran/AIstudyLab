import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, message, Card, Spin, Typography, Collapse, Pagination, Modal } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
  LogoutOutlined,
  BookOutlined,
  RobotOutlined,
  CalculatorOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  CodeOutlined,
  BulbOutlined,
  RocketOutlined,
  HeartOutlined,
  ReadOutlined
} from '@ant-design/icons';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import ChatAssistant from './pages/ChatAssistant';
import AdminQuestions from './pages/AdminQuestions';
import Books from './pages/Books';
import UserProfileDropdown from './components/UserProfileDropdown';
import OnboardingModal from './components/OnboardingModal';
import logo from './assets/react.svg';

const { Header, Content } = Layout;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    window.addEventListener('storage', handleStorage);
    // On mount, ensure user/token are loaded before rendering
    setIsLoggedIn(!!localStorage.getItem('token'));
    setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    setLoadingUser(false);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleAuthChange = (loggedIn, userData = null) => {
    setIsLoggedIn(loggedIn);
    if (userData) {
      setUser(userData);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser({});
    window.location.href = '/login';
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleShowLoginModal = () => {
    setShowLoginModal(true);
  };

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
  };

  const handleEditComplete = async (profileData) => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Frontend - Token:', token);
      console.log('Frontend - Stored user:', storedUser);
      console.log('Frontend - Current user state:', user);
      console.log('Frontend - Profile data to send:', profileData);
      
      // Decode the token to see its structure
      if (token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('Frontend - Token payload:', payload);
          }
        } catch (e) {
          console.log('Frontend - Could not decode token:', e);
        }
      }
      
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      console.log('Frontend - Response status:', response.status);
      console.log('Frontend - Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Frontend - Error response:', errorData);
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      console.log('Frontend - Success response:', data);
      
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setShowEditModal(false);
      message.success('Profile updated successfully!');
    } catch (error) {
      console.error('Frontend - Profile update error:', error);
      message.error('Failed to update profile. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Show spinner while loading user state
  if (loadingUser) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}><Spin size="large" /></div>;
  }

  // Dynamically build menu items based on login state
  const leftMenuItems = [
    { label: <Link to="/dashboard">Dashboard</Link>, key: 'dashboard', icon: <DashboardOutlined /> },
    { label: <Link to="/quiz">Quiz</Link>, key: 'quiz', icon: <QuestionCircleOutlined /> },
    { label: <Link to="/books">Books</Link>, key: 'books', icon: <BookOutlined /> },
    { label: <Link to="/learning">Learning</Link>, key: 'learning', icon: <BookOutlined /> },
    { label: <Link to="/chat">Chat Assistant</Link>, key: 'chat', icon: <RobotOutlined /> },
  ];

  return (
    <Router>
      <Header
        style={{
          position: 'fixed',
          top: 0,
          left: -5,
          width: '98%',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          background: '#001529',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 32 }}>
          <img src={logo} alt="Logo" style={{ height: 40, marginRight: 12 }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>AIStudyLab</span>
        </div>
        <div style={{ display: 'flex', flex: 1, minWidth: 0, alignItems: 'center' }}>
          <Menu
            theme="dark"
            mode="horizontal"
            items={leftMenuItems}
            style={{ flex: 1, minWidth: 0 }}
            overflowedIndicator={<span style={{ color: '#fff' }}>...</span>}
          />
          {!isLoggedIn && (
            <div style={{marginRight:'18', display: 'flex', gap: 12 }}>
              <Link to="/login">
                <Button type="primary" ghost size="middle" style={{ color: '#1890ff', borderColor: '#1890ff' }}>Login</Button>
              </Link>
              <Link to="/register">
                <Button type="default" size="middle" style={{ color: '#1890ff', borderColor: '#1890ff' }}>Register</Button>
              </Link>
            </div>
          )}
        </div>
        {isLoggedIn && (
          <div style={{marginRight:'20px'}}>

          <UserProfileDropdown 
            user={user} 
            onEdit={handleEditProfile}
            onLogout={handleLogout}
            />
            </div>
        )}
      </Header>
      <Content style={{ padding: '96px 16px 32px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleAuthChange} />} />
          <Route path="/register" element={<Register onRegister={() => handleAuthChange(false)} />} />
          <Route path="/dashboard" element={
            <Dashboard
              user={user}
              progress={75}
              onUserUpdate={handleUserUpdate}
            />
          } />
          <Route path="/quiz" element={<Quiz isLoggedIn={isLoggedIn} onShowLoginModal={handleShowLoginModal} />} />
          <Route path="/books" element={<Books />} />
          <Route path="/learning" element={
            <LearningPage isLoggedIn={isLoggedIn} onShowLoginModal={handleShowLoginModal} />
          } />
          <Route path="/chat" element={<ChatAssistant />} />
          {/* <Route path="/admin/questions" element={<AdminQuestions />} /> */}
          <Route path="*" element={<Dashboard user={user} progress={75} onUserUpdate={handleUserUpdate} />} />
        </Routes>
      </Content>

      {/* Edit Profile Modal */}
      <OnboardingModal
        visible={showEditModal}
        onFinish={handleEditComplete}
        loading={editLoading}
        initialValues={user}
      />

      {/* Login Required Modal */}
      <Modal
        title="Login Required"
        open={showLoginModal}
        onCancel={handleLoginModalClose}
        footer={[
          <Button key="cancel" onClick={handleLoginModalClose}>
            Cancel
          </Button>,
          <Link key="login" to="/login">
            <Button type="primary" onClick={handleLoginModalClose}>
              Login
            </Button>
          </Link>
        ]}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Typography.Title level={4} style={{ marginBottom: 16 }}>
            Please Login to Access This Resource
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: 16, color: '#666' }}>
            You need to be logged in to access this feature. Please login to continue.
          </Typography.Paragraph>
        </div>
      </Modal>
    </Router>
  );
}

// LearningPage component
function LearningPage({ isLoggedIn, onShowLoginModal }) {
  const [csData, setCSData] = React.useState([]);
  const [mathsData, setMathsData] = React.useState([]);
  const [dsData, setDSData] = React.useState([]);
  const [scienceData, setScienceData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showSubject, setShowSubject] = React.useState(null); // 'cs', 'maths', 'ds', 'science'
  const pageSize = 8;

  React.useEffect(() => {
    const fetchCS = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/data/learning');
        const json = await res.json();
        setCSData(json.data || []);
      } catch {
        setCSData([]);
      }
    };
    const fetchMaths = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/data/maths-learning');
        const json = await res.json();
        setMathsData(json.data || []);
      } catch {
        setMathsData([]);
      }
    };
    const fetchDS = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/data/datascience-learning');
        const json = await res.json();
        setDSData(json.data || []);
      } catch {
        setDSData([]);
      }
    };
    const fetchScience = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/data/science-learning');
        const json = await res.json();
        setScienceData(json.data || []);
      } catch {
        setScienceData([]);
      }
    };
    setLoading(true);
    Promise.all([fetchCS(), fetchMaths(), fetchDS(), fetchScience()]).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  if (!csData.length && !mathsData.length && !dsData.length && !scienceData.length) return <div style={{padding:40, textAlign:'center'}}><h2>No learning data found.</h2></div>;

  let data = [];
  if (showSubject === 'cs') data = csData;
  if (showSubject === 'maths') data = mathsData;
  if (showSubject === 'ds') data = dsData;
  if (showSubject === 'science') data = scienceData;

  // Pagination logic
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedData = data.slice(startIdx, endIdx);

  // Button config for subjects
  const subjectButtons = [
    {
      key: 'cs',
      label: 'Computer Science',
      icon: <RobotOutlined />,
      color: '#1976d2',
      bg: '#e3f2fd',
      hover: '#1565c0',
    },
    {
      key: 'maths',
      label: 'Maths',
      icon: <CalculatorOutlined />,
      color: '#388e3c',
      bg: '#e8f5e9',
      hover: '#1b5e20',
    },
    {
      key: 'ds',
      label: 'Data Science',
      icon: <DatabaseOutlined />,
      color: '#fbc02d',
      bg: '#fffde7',
      hover: '#f9a825',
    },
    {
      key: 'science',
      label: 'Science',
      icon: <ExperimentOutlined />,
      color: '#d84315',
      bg: '#ffebee',
      hover: '#b71c1c',
    },
  ];

  // Coming soon subjects
  const comingSoonSubjects = [
    {
      key: 'literature',
      label: 'Literature',
      icon: <BookOutlined />,
      color: '#8e44ad',
      bg: '#f4e6f7',
      hover: '#6c3483',
    },
    {
      key: 'chemistry',
      label: 'Chemistry',
      icon: <ExperimentOutlined />,
      color: '#e67e22',
      bg: '#fdf2e9',
      hover: '#d35400',
    },
    {
      key: 'physics',
      label: 'Physics',
      icon: <CalculatorOutlined />,
      color: '#3498db',
      bg: '#ebf3fd',
      hover: '#2980b9',
    },
    {
      key: 'programming',
      label: 'Programming',
      icon: <CodeOutlined />,
      color: '#2ecc71',
      bg: '#eafaf1',
      hover: '#27ae60',
    },
    {
      key: 'philosophy',
      label: 'Philosophy',
      icon: <BulbOutlined />,
      color: '#9b59b6',
      bg: '#f5eef8',
      hover: '#8e44ad',
    },
    {
      key: 'astronomy',
      label: 'Astronomy',
      icon: <RocketOutlined />,
      color: '#34495e',
      bg: '#ecf0f1',
      hover: '#2c3e50',
    },
    {
      key: 'biology',
      label: 'Biology',
      icon: <HeartOutlined />,
      color: '#e74c3c',
      bg: '#fdf2f2',
      hover: '#c0392b',
    },
    {
      key: 'geography',
      label: 'Geography',
      icon: <ReadOutlined />,
      color: '#f39c12',
      bg: '#fef9e7',
      hover: '#e67e22',
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', color: 'white' }}>
      <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 32, color: 'white' }}>Learning Resources</Typography.Title>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 20,
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        {/* Available subjects */}
        {subjectButtons.map(btn => (
          <Button
            key={btn.key}
            type={showSubject === btn.key ? 'primary' : 'default'}
            icon={btn.icon}
            size="large"
            style={{
              minWidth: 160,
              fontWeight: 600,
              color: showSubject === btn.key ? '#fff' : btn.color,
              background: showSubject === btn.key ? btn.color : btn.bg,
              borderColor: btn.color,
              boxShadow: showSubject === btn.key ? '0 2px 8px rgba(0,0,0,0.10)' : undefined,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onClick={() => { 
              if (!isLoggedIn) {
                onShowLoginModal();
                return;
              }
              setShowSubject(btn.key); 
              setCurrentPage(1); 
            }}
            onMouseEnter={e => {
              if (showSubject !== btn.key) {
                e.currentTarget.style.background = btn.hover;
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={e => {
              if (showSubject !== btn.key) {
                e.currentTarget.style.background = btn.bg;
                e.currentTarget.style.color = btn.color;
              }
            }}
          >
            {btn.label}
          </Button>
        ))}
        
        {/* Coming Soon subjects */}
        {comingSoonSubjects.map(btn => (
          <Button
            key={btn.key}
            type="default"
            icon={btn.icon}
            size="large"
            disabled={true}
            style={{
              minWidth: 160,
              fontWeight: 600,
              color: '#8c8c8c',
              background: '#f5f5f5',
              borderColor: '#d9d9d9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'not-allowed',
              opacity: 0.7,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {btn.label}
            <span style={{ fontSize: 10, marginLeft: 4, color: '#bfbfbf' }}>(Coming Soon)</span>
          </Button>
        ))}
      </div>
      {showSubject && (
        <>
          <Collapse accordion>
            {paginatedData.map(item => (
              <Collapse.Panel
                header={<span style={{ color: 'white' }}>{item.title || item.instruction || item.Question}</span>}
                key={item._id}
              >
                <Typography.Paragraph>{item.text || item.response || item.Answer}</Typography.Paragraph>
                {item.Context && <Typography.Paragraph type="secondary"></Typography.Paragraph>}
                {item.source && <a href={item.source} target="_blank" rel="noopener noreferrer">Source</a>}
              </Collapse.Panel>
            ))}
          </Collapse>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={data.length}
              onChange={page => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
