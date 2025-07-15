import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Tag, Typography, Button, Timeline, Space, Spin, Divider, message } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';

const { Title, Text } = Typography;

const WeeklyStudyPlan = () => {
  const navigate = useNavigate();
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDay, setCurrentDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1); // 0=Monday, 6=Sunday
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    const fetchWeeklyPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGet('/progress/weekly');
        if (res.success) {
          setWeeklyPlan(res.data);
          setTotalProgress(res.totalProgress);
        } else {
          setError('Failed to load weekly plan.');
        }
      } catch (err) {
        setError('Failed to load weekly plan.');
      } finally {
        setLoading(false);
      }
    };
    fetchWeeklyPlan();
  }, []);

  const getDayStatus = (dayIndex) => {
    if (dayIndex < currentDay) return 'completed';
    if (dayIndex === currentDay) return 'current';
    return 'upcoming';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#52c41a';
      case 'current': return '#1890ff';
      default: return '#d9d9d9';
    }
  };

  // Calculate completed tasks and study hours
  const completedTasks = weeklyPlan.reduce((acc, day) => acc + (day.quizzesCompleted || 0), 0);
  const totalTasks = weeklyPlan.reduce((acc, day) => acc + (day.subjectsStudied?.length || 0), 0);
  const totalStudyTime = weeklyPlan.reduce((acc, day) => acc + (day.studyTime || 0), 0);

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', color: 'white', boxShadow: '0 2px 12px #0001', borderRadius: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <CalendarOutlined /> Weekly Study Plan
        </Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="📅 Daily Breakdown" style={{ marginBottom: 24 }}>
            <Timeline>
              {weeklyPlan.map((day, index) => {
                const status = getDayStatus(index);
                const statusColor = getStatusColor(status);
                return (
                  <Timeline.Item 
                    key={day.day}
                    color={statusColor}
                    dot={status === 'current' ? <ClockCircleOutlined style={{ color: statusColor }} /> : undefined}
                  >
                    <Card 
                      size="small" 
                      style={{ 
                        marginBottom: 16,
                        border: status === 'current' ? '2px solid #1890ff' : '1px solid #d9d9d9'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div>
                          <Text strong style={{ fontSize: 16 }}>{day.day}</Text>
                          <Text type="secondary" style={{ marginLeft: 8 }}>{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Tag color={status === 'completed' ? 'green' : status === 'current' ? 'blue' : 'default'}>
                            {status === 'completed' ? 'Completed' : status === 'current' ? 'Today' : 'Upcoming'}
                          </Tag>
                          <Progress 
                            percent={day.progress} 
                            size="small" 
                            style={{ width: 80 }}
                            strokeColor={statusColor}
                          />
                        </div>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Text type="secondary">
                          <BookOutlined /> Focus: {day.subjectsStudied && day.subjectsStudied.length > 0 ? day.subjectsStudied.join(', ') : 'No subjects'}
                        </Text>
                      </div>
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        {day.subjectsStudied && day.subjectsStudied.length > 0 ? (
                          day.subjectsStudied.map((subject, idx) => (
                            <div 
                              key={subject + idx}
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '8px 12px',
                                background: day.progress > 0 ? '#f6ffed' : '#fafafa',
                                borderRadius: 6,
                                border: day.progress > 0 ? '1px solid #b7eb8f' : '1px solid #d9d9d9'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {day.progress > 0 ? (
                                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                ) : (
                                  <ClockCircleOutlined style={{ color: '#666' }} />
                                )}
                                <div>
                                  <Text strong style={{ textDecoration: day.progress > 0 ? 'line-through' : 'none' }}>
                                    {subject}
                                  </Text>
                                  <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {day.studyTime ? `${day.studyTime} min` : 'No study time'}
                                    </Text>
                                  </div>
                                </div>
                              </div>
                              {day.progress > 0 && (
                                <TrophyOutlined style={{ color: '#faad14' }} />
                              )}
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '8px 12px', color: '#aaa' }}>No tasks</div>
                        )}
                      </Space>
                    </Card>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="📊 Weekly Overview" style={{ marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#1890ff' }}>
                {Math.round((totalProgress / (weeklyPlan.length * 100)) * 100) || 0}%
              </div>
              <div style={{ fontSize: 16, color: '#666' }}>
                Weekly Progress
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Completed Tasks:</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a', marginTop: 4 }}>
                {completedTasks}/{totalTasks}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Study Hours:</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#722ed1', marginTop: 4 }}>
                {(totalStudyTime / 60).toFixed(1)} hrs
              </div>
            </div>
            <div>
              <Text strong>Streak:</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#faad14', marginTop: 4 }}>
                {/* For now, show number of days with progress > 0 */}
                {weeklyPlan.filter(day => day.progress > 0).length} days
              </div>
            </div>
          </Card>
          <Card title="🎯 This Week's Goals">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {weeklyPlan.map((day, idx) => (
                day.subjectsStudied && day.subjectsStudied.length > 0 && day.progress < 100 ? (
                  <div key={day.day + idx} style={{ padding: '12px', background: '#fff7e6', borderRadius: 6, border: '1px solid #ffd591' }}>
                    <Text strong style={{ color: '#fa8c16' }}>⏳ {day.day}: {day.subjectsStudied.join(', ')}</Text>
                  </div>
                ) : null
              ))}
              {weeklyPlan.every(day => day.progress === 100) && (
                <div style={{ padding: '12px', background: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
                  <Text strong style={{ color: '#52c41a' }}>✓ All goals completed!</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WeeklyStudyPlan; 