import React from 'react';
import { Dropdown, Avatar, Space, Typography, Divider, Button } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  EditOutlined, 
  BookOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

const UserProfileDropdown = ({ user, onEdit, onLogout }) => {
  const formatStudyTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getMoodLabel = (mood) => {
    const moodLabels = {
      '😊': 'Happy',
      '😌': 'Calm', 
      '🤔': 'Thoughtful',
      '😴': 'Tired',
      '😤': 'Determined',
      '😎': 'Confident'
    };
    return moodLabels[mood] || 'Happy';
  };

  const menuItems = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <Avatar
              size={48}
              style={{ 
                fontSize: '20px',
                marginRight: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {user?.avatar || '👨‍🎓'}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#1890ff' }}>
                {user?.name || 'Student'}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {user?.grade || 'Class 1'}
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: 8 }}>
            <Space>
              <BookOutlined style={{ color: '#1890ff' }} />
              <Text style={{ fontSize: 12 }}>
                Focus: {user?.currentFocus || 'Mathematics'}
              </Text>
            </Space>
          </div>
          
          <div style={{ marginBottom: 8 }}>
            <Space>
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
              <Text style={{ fontSize: 12 }}>
                Study Time: {formatStudyTime(user?.dailyStudyTime || 60)}
              </Text>
            </Space>
          </div>
          
          <div>
            <Space>
              <span style={{ fontSize: 16 }}>
                {user?.mood || '😊'}
              </span>
              <Text style={{ fontSize: 12 }}>
                {getMoodLabel(user?.mood)}
              </Text>
            </Space>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Profile',
      onClick: onEdit,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: onLogout,
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={["hover"]}
      overlayStyle={{ minWidth: 280 }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        cursor: 'pointer', 
        padding: '8px 12px',
        borderRadius: 6,
        transition: 'background-color 0.2s',
        ':hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
      }}>
        <Avatar
          size={32}
          style={{ 
            fontSize: '16px',
            marginRight: 8,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          {user?.avatar || '👨‍🎓'}
        </Avatar>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Text style={{ color: '#fff', fontWeight: 500, fontSize: 14, lineHeight: 1 }}>
            {user?.name || 'User'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, lineHeight: 1 }}>
            {user?.grade || 'Class 1'}
          </Text>
        </div>
      </div>
    </Dropdown>
  );
};

export default UserProfileDropdown; 