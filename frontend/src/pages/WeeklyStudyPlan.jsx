import React, { useState } from 'react';
import { Card, Row, Col, Progress, Tag, Typography, Button, Timeline, Space, Divider } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const WeeklyStudyPlan = () => {
  const navigate = useNavigate();
  const [currentDay] = useState(new Date().getDay()); // 0 = Sunday, 1 = Monday, etc.

  const weeklyPlan = [
    {
      day: 'Monday',
      date: 'Dec 18',
      tasks: [
        { id: 1, subject: 'Mathematics', task: 'Complete 5 Algebra problems', duration: '30 min', completed: true },
        { id: 2, subject: 'Science', task: 'Watch Newton\'s Laws video', duration: '20 min', completed: true },
        { id: 3, subject: 'English', task: 'Read Chapter 5 of Literature', duration: '25 min', completed: false }
      ],
      focus: 'Mathematics & Science',
      progress: 67
    },
    {
      day: 'Tuesday',
      date: 'Dec 19',
      tasks: [
        { id: 4, subject: 'History', task: 'Review World War II notes', duration: '35 min', completed: false },
        { id: 5, subject: 'Geography', task: 'Study continents and oceans', duration: '20 min', completed: false },
        { id: 6, subject: 'Computer Science', task: 'Practice Python coding', duration: '45 min', completed: false }
      ],
      focus: 'History & Geography',
      progress: 0
    },
    {
      day: 'Wednesday',
      date: 'Dec 20',
      tasks: [
        { id: 7, subject: 'Mathematics', task: 'Solve geometry problems', duration: '40 min', completed: false },
        { id: 8, subject: 'Science', task: 'Lab experiment: Photosynthesis', duration: '60 min', completed: false },
        { id: 9, subject: 'English', task: 'Write essay on Shakespeare', duration: '50 min', completed: false }
      ],
      focus: 'Mathematics & Science',
      progress: 0
    },
    {
      day: 'Thursday',
      date: 'Dec 21',
      tasks: [
        { id: 10, subject: 'History', task: 'Timeline of major events', duration: '30 min', completed: false },
        { id: 11, subject: 'Geography', task: 'Map reading exercises', duration: '25 min', completed: false },
        { id: 12, subject: 'Computer Science', task: 'Build simple calculator', duration: '45 min', completed: false }
      ],
      focus: 'History & Computer Science',
      progress: 0
    },
    {
      day: 'Friday',
      date: 'Dec 22',
      tasks: [
        { id: 13, subject: 'Mathematics', task: 'Algebra quiz preparation', duration: '35 min', completed: false },
        { id: 14, subject: 'Science', task: 'Chemistry formulas review', duration: '30 min', completed: false },
        { id: 15, subject: 'English', task: 'Grammar practice', duration: '20 min', completed: false }
      ],
      focus: 'Mathematics & Chemistry',
      progress: 0
    },
    {
      day: 'Saturday',
      date: 'Dec 23',
      tasks: [
        { id: 16, subject: 'General', task: 'Review weak topics', duration: '60 min', completed: false },
        { id: 17, subject: 'General', task: 'Create study summary', duration: '30 min', completed: false },
        { id: 18, subject: 'General', task: 'Plan next week', duration: '15 min', completed: false }
      ],
      focus: 'Review & Planning',
      progress: 0
    },
    {
      day: 'Sunday',
      date: 'Dec 24',
      tasks: [
        { id: 19, subject: 'General', task: 'Rest and reflect', duration: '0 min', completed: false },
        { id: 20, subject: 'General', task: 'Light reading', duration: '20 min', completed: false }
      ],
      focus: 'Rest & Reflection',
      progress: 0
    }
  ];

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

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <CalendarOutlined /> Weekly Study Plan
        </Title>
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
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
                          <Text type="secondary" style={{ marginLeft: 8 }}>{day.date}</Text>
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
                          <BookOutlined /> Focus: {day.focus}
                        </Text>
                      </div>

                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        {day.tasks.map(task => (
                          <div 
                            key={task.id}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '8px 12px',
                              background: task.completed ? '#f6ffed' : '#fafafa',
                              borderRadius: 6,
                              border: task.completed ? '1px solid #b7eb8f' : '1px solid #d9d9d9'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {task.completed ? (
                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                              ) : (
                                <ClockCircleOutlined style={{ color: '#666' }} />
                              )}
                              <div>
                                <Text strong style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                                  {task.subject}: {task.task}
                                </Text>
                                <div>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {task.duration}
                                  </Text>
                                </div>
                              </div>
                            </div>
                            {task.completed && (
                              <TrophyOutlined style={{ color: '#faad14' }} />
                            )}
                          </div>
                        ))}
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
                67%
              </div>
              <div style={{ fontSize: 16, color: '#666' }}>
                Weekly Progress
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>Completed Tasks:</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a', marginTop: 4 }}>
                2/15
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Study Hours:</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#722ed1', marginTop: 4 }}>
                2.5 hrs
              </div>
            </div>

            <div>
              <Text strong>Streak:</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#faad14', marginTop: 4 }}>
                5 days
              </div>
            </div>
          </Card>

          <Card title="🎯 This Week's Goals">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ padding: '12px', background: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
                <Text strong style={{ color: '#52c41a' }}>✓ Complete Algebra chapter</Text>
              </div>
              <div style={{ padding: '12px', background: '#fff7e6', borderRadius: 6, border: '1px solid #ffd591' }}>
                <Text strong style={{ color: '#fa8c16' }}>⏳ Master Newton's Laws</Text>
              </div>
              <div style={{ padding: '12px', background: '#fff2f0', borderRadius: 6, border: '1px solid #ffccc7' }}>
                <Text strong style={{ color: '#ff4d4f' }}>📝 Write Shakespeare essay</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WeeklyStudyPlan; 