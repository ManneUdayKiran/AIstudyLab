import React, { useState, useEffect } from 'react';
import { Card, Progress, Space, Typography, Tag, List, Row, Col, Spin, Alert, Button } from 'antd';
import { BookOutlined, TrophyOutlined, ReloadOutlined, FireOutlined } from '@ant-design/icons';
import { apiGet } from '../utils/api';

const { Title, Text } = Typography;

const SmartProgressTracker = () => {
  const [subjects, setSubjects] = useState([]);
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subject colors mapping
  const subjectColors = {
    'Mathematics': '#1890ff',
    'Science': '#52c41a',
    'History': '#faad14',
    'English': '#722ed1',
    'Geography': '#f5222d',
    'Computer Science': '#13c2c2',
    'Physics': '#3498db',
    'Chemistry': '#e67e22',
    'Biology': '#2ecc71',
    'Literature': '#9b59b6',
    'Philosophy': '#34495e',
    'Astronomy': '#1abc9c'
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': '#52c41a',
      'Medium': '#faad14',
      'Hard': '#f5222d'
    };
    return colors[difficulty] || '#1890ff';
  };

  const getDifficultyIcon = (difficulty) => {
    if (difficulty === 'Easy') return <TrophyOutlined />;
    if (difficulty === 'Medium') return <FireOutlined />;
    return <ReloadOutlined />;
  };

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all subjects that have progress data
      const subjectsWithProgress = new Set();
      const subjectProgressMap = new Map();

      // Fetch progress for each subject to get detailed data
      const availableSubjects = ['History', 'Computer Science', 'Mathematics', 'Science', 'English', 'Geography'];
      
      for (const subject of availableSubjects) {
        try {
          const data = await apiGet(`/progress/quiz-progress?subject=${encodeURIComponent(subject)}`);
          
          if (data.data.completedQuestions.length > 0) {
            subjectsWithProgress.add(subject);
            
            const correctAnswers = data.data.questionResults ? 
              Object.values(data.data.questionResults).filter(result => result === true).length : 0;
            const totalQuestions = data.data.completedQuestions.length;
            const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            
            subjectProgressMap.set(subject, {
              name: subject,
              progress: accuracy,
              difficulty: accuracy >= 80 ? 'Easy' : accuracy < 50 ? 'Hard' : 'Medium',
              quizzesCompleted: 1, // Each subject counts as one quiz session
              correctAnswers,
              totalQuestions,
              accuracy,
              color: subjectColors[subject] || '#1890ff'
            });
          }
        } catch (error) {
          console.error(`Error fetching progress for ${subject}:`, error);
        }
      }

      // Convert to array and sort by progress
      const processedSubjects = Array.from(subjectProgressMap.values())
        .sort((a, b) => b.progress - a.progress);

      setSubjects(processedSubjects);

      // Generate suggested topics based on performance
      const lowPerformingSubjects = processedSubjects.filter(s => s.progress < 60);
      const suggestions = lowPerformingSubjects.map(subject => ({
        subject: subject.name,
        topic: getSuggestedTopic(subject.name),
        reason: `Low performance (${subject.progress}% average)`,
        priority: subject.progress < 40 ? 'High' : 'Medium'
      }));

      setSuggestedTopics(suggestions);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setError('Failed to load progress data. Please try logging in again.');
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedTopic = (subject) => {
    const topicMap = {
      'Mathematics': 'Algebra Basics',
      'Science': 'Scientific Method',
      'History': 'World War II',
      'English': 'Grammar Fundamentals',
      'Geography': 'Continents and Oceans',
      'Computer Science': 'Programming Basics',
      'Physics': 'Newton\'s Laws',
      'Chemistry': 'Atomic Structure',
      'Biology': 'Cell Biology',
      'Literature': 'Classic Novels',
      'Philosophy': 'Ethics',
      'Astronomy': 'Solar System'
    };
    return topicMap[subject] || 'Core Concepts';
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  if (loading) {
    return (
      <div style={{ marginBottom: 24, textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading your progress data...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginBottom: 24 }}>
        <Alert
          message="Progress Tracking Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📚 Subject Progress</span>
                <Button 
                  type="text" 
                  icon={<ReloadOutlined />} 
                  onClick={fetchProgressData}
                  loading={loading}
                  size="small"
                >
                  Refresh
                </Button>
              </div>
            } 
            style={{ height: '100%' }}
          >
            {subjects.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {subjects.map((subject, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Space>
                        <BookOutlined style={{ color: subject.color }} />
                        <Text strong>{subject.name}</Text>
                        <Tag color={getDifficultyColor(subject.difficulty)}>
                          {getDifficultyIcon(subject.difficulty)} {subject.difficulty}
                        </Tag>
                      </Space>
                      <div style={{ textAlign: 'right' }}>
                        <Text type="secondary">
                          {subject.correctAnswers}/{subject.totalQuestions} correct
                        </Text>
                      </div>
                    </div>
                    <Progress 
                      percent={subject.progress} 
                      strokeColor={subject.color}
                      format={(percent) => `${percent}%`}
                      size="small"
                    />
                  </div>
                ))}
              </Space>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <BookOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Text type="secondary">
                  No progress data available. Start taking quizzes to see your progress here!
                </Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="🎯 Study Suggestions" style={{ height: '100%' }}>
            {suggestedTopics.length > 0 ? (
              <List
                size="small"
                dataSource={suggestedTopics}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Text strong>{item.subject}</Text>
                        <Tag color={item.priority === 'High' ? 'red' : 'orange'} size="small">
                          {item.priority}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Focus on: {item.topic}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {item.reason}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <TrophyOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} />
                <Text type="secondary">
                  Great job! Keep up the excellent work.
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SmartProgressTracker; 