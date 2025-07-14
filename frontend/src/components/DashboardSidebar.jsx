import React, { useState } from 'react';
import { Card, Button, Space, Typography, Modal } from 'antd';
import { CalendarOutlined, BookOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SmartProgressTracker from './SmartProgressTracker';

const { Title, Text } = Typography;

const DashboardSidebar = ({ onWeeklyPlanClick }) => {
  const navigate = useNavigate();
  const [progressModalOpen, setProgressModalOpen] = useState(false);

  const handleBooksClick = () => {
    navigate('/books');
  };

  return (
    <div style={{ width: 280, padding: '0 16px' }}>
      <Card 
        title={<span><CalendarOutlined /> Quick Actions</span>}
        style={{ marginBottom: 16 }}
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
          title="Progress Tracker"
          width={700}
          centered
        >
          <SmartProgressTracker />
        </Modal>
      </Card>

      <Card title="📊 Quick Stats" size="small">
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1890ff' }}>
            7
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>
            Days Studied
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>
            85%
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>
            Weekly Goal
          </div>
        </div>
      </Card>
      {/* <SmartProgressTracker /> */}
    </div>
  );
};

export default DashboardSidebar; 