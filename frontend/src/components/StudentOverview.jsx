import React from 'react';
import { Card, Avatar, Space, Typography, Tag, Progress } from 'antd';
import { ClockCircleOutlined, BookOutlined, TrophyOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const StudentOverview = ({ user, onEdit }) => {
  const formatStudyTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getMoodColor = (mood) => {
    const moodColors = {
      '😊': '#52c41a', // happy - green
      '😌': '#1890ff', // calm - blue
      '🤔': '#722ed1', // thoughtful - purple
      '😴': '#faad14', // tired - orange
      '😤': '#f5222d', // determined - red
      '😎': '#13c2c2', // confident - cyan
    };
    return moodColors[mood] || '#1890ff';
  };

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        marginBottom: 24
      }}
      bodyStyle={{ padding: 24 }}
      extra={
        onEdit && (
          <button
            onClick={onEdit}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              cursor: 'pointer',
              padding: '6px 16px',
              fontWeight: 500,
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
            title="Edit Profile"
          >
            <EditOutlined /> Edit
          </button>
        )
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space size="large">
          <Avatar
            size={80}
            style={{ 
              fontSize: '32px',
              border: '3px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.2)'
            }}
          >
            {user?.avatar || '👨‍🎓'}
          </Avatar>
          
          <div>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              {user?.name || 'Student'}
            </Title>
            <Space size="middle" style={{ marginTop: 8 }}>
              <Tag color="white" style={{ color: '#667eea' }}>
                {user?.grade || 'Class 1'}
              </Tag>
              <Tag color="white" style={{ color: '#667eea' }}>
                <BookOutlined /> {user?.currentFocus || 'Mathematics'}
              </Tag>
            </Space>
          </div>
        </Space>

        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
              Daily Study Time
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClockCircleOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />
              <Text strong style={{ color: 'white', fontSize: 18 }}>
                {formatStudyTime(user?.dailyStudyTime || 60)}
              </Text>
            </div>
          </div>
          
          <div>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
              Today's Mood
            </Text>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              marginTop: 4
            }}>
              <span style={{ fontSize: 24 }}>
                {user?.mood || '😊'}
              </span>
              <Text style={{ color: 'white', fontSize: 14 }}>
                {user?.mood === '😊' && 'Happy'}
                {user?.mood === '😌' && 'Calm'}
                {user?.mood === '🤔' && 'Thoughtful'}
                {user?.mood === '😴' && 'Tired'}
                {user?.mood === '😤' && 'Determined'}
                {user?.mood === '😎' && 'Confident'}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentOverview; 