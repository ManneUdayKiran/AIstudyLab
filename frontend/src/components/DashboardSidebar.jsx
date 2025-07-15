import React, { useState } from 'react';
import { Card, Button, Space, Typography, Modal } from 'antd';
import { CalendarOutlined, BookOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SmartProgressTracker from './SmartProgressTracker';

const { Title, Text } = Typography;

const DashboardSidebar = ({ onWeeklyPlanClick, weeklyProgress = [], progressSummary = {} }) => {
  const navigate = useNavigate();
  const [progressModalOpen, setProgressModalOpen] = useState(false);

  const handleBooksClick = () => {
    navigate('/books');
  };

  // Calculate dynamic quick stats
  const daysStudied = weeklyProgress.filter(day => day.progress > 0).length;
  // Weekly goal: show highest progress achieved this week, or average progress
  const weeklyGoal = weeklyProgress.length > 0
    ? Math.round(
        weeklyProgress.reduce((acc, day) => acc + (day.progress || 0), 0) / weeklyProgress.length
      )
    : 0;

  return (
    <div style={{ width: 280, padding: '0 16px' }}>
      <Card 
        title={<span style={{color:'white'}}><CalendarOutlined /> Quick Actions</span>}
        style={{ marginBottom: 16, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: 'white', boxShadow: '0 2px 12px #0001' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button
            type="primary"
            size="large"
            icon={<CalendarOutlined />}
            onClick={onWeeklyPlanClick}
            style={{
              width: '100%',
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>
                Weekly Study Plan
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                View your detailed plan
              </div>
            </div>
            <RightOutlined style={{ color: 'white' }} />
          </Button>

          <Button
            type="default"
            size="large"
            icon={<BookOutlined />}
            onClick={handleBooksClick}
            style={{
              width: '100%',
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '2px solid #1890ff',
              borderRadius: 12,
              color: '#1890ff',
              fontWeight: 600
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                Books
              </div>
              <div style={{ color: '#666', fontSize: 12 }}>
                Browse study materials
              </div>
            </div>
            <RightOutlined />
          </Button>

          {/* Progress Tracker Button */}
          <Button
            type="dashed"
            size="large"
            icon={<BookOutlined />}
            onClick={() => setProgressModalOpen(true)}
            style={{
              width: '100%',
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '2px dashed #faad14',
              borderRadius: 12,
              color: '#faad14',
              fontWeight: 600
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                Progress Tracker
              </div>
              <div style={{ color: '#b8860b', fontSize: 12 }}>
                View your progress
              </div>
            </div>
            <RightOutlined />
          </Button>
        </Space>
        <Modal
          open={progressModalOpen}
          onCancel={() => setProgressModalOpen(false)}
          footer={null}
          title={<span style={{color:'black'}}>Progress Tracker</span>}
          width={700}
          centered
          style={{ background: 'black', boxShadow: 'none', padding: 0 }}
        >
          <div style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(16px)', color: 'white', borderRadius: 18, padding: 24 }}>
            <SmartProgressTracker />
          </div>
        </Modal>
      </Card>

      <Card title="📊 Quick Stats" size="small" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: 'white', boxShadow: '0 2px 12px #0001', border: 'none' }}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1890ff' }}>
            {daysStudied}
          </div>
          <div style={{ fontSize: 14, color: '#eee' }}>
            Days Studied
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>
            {weeklyGoal}%
          </div>
          <div style={{ fontSize: 14, color: '#eee' }}>
            Weekly Goal
          </div>
        </div>
      </Card>
      {/* <SmartProgressTracker /> */}
    </div>
  );
};

export default DashboardSidebar; 