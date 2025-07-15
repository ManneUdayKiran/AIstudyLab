import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Typography, Alert, Spin, Space, Tag, Tabs } from 'antd';
import { CalculatorOutlined, ExperimentOutlined, BookOutlined, BulbOutlined, RocketOutlined, CodeOutlined, HeartOutlined, ReadOutlined, CheckCircleOutlined, MinusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { apiPost, apiGet } from '../utils/api';

const { Title } = Typography;

const Quiz = ({ isLoggedIn, onShowLoginModal }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [questionResults, setQuestionResults] = useState({}); // Track correct/incorrect for each question
  const [loadingProgress, setLoadingProgress] = useState(false);

  const subjectColors = ['#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2', '#f5222d', '#a0522d', '#ff6b35', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
  const subjectIcons = [
    <CalculatorOutlined />, // Maths
    <ExperimentOutlined />, // Science
    <BookOutlined />,      // English
    <BulbOutlined />,      // General
    <RocketOutlined />,    // Space
    <CodeOutlined />,      // Coding/Computer Science
    <HeartOutlined />,     // Other
    <ReadOutlined />,      // History
    <BookOutlined />,      // Literature
    <ExperimentOutlined />, // Chemistry
    <CalculatorOutlined />, // Physics
    <CodeOutlined />,      // Programming
    <BulbOutlined />,      // Philosophy
    <RocketOutlined />,    // Astronomy
    <HeartOutlined />,     // Biology
    <ReadOutlined />       // Geography
  ];

  // Fetch available subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('https://a-istudy-lab.vercel.app/api/admin/questions');
        const data = await res.json();
        const uniqueSubjects = [...new Set((data.questions || []).map(q => q.subject))];
        setSubjects(uniqueSubjects);
      } catch (err) {
        setError('Failed to load subjects.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch questions for selected subject
  useEffect(() => {
    if (!selectedSubject) return;
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (selectedSubject.toLowerCase() === 'maths') {
          const res = await fetch('https://a-istudy-lab.vercel.app/api/data/math-questions?category=general&limit=100');
          data = await res.json();
          // Transform math questions to match quiz format
          data.questions = data.questions.map(q => ({
            ...q,
            question: q.Problem,
            answer: q.correct,
            options: q.options ? q.options.split(',').map(opt => opt.trim()) : []
          }));
        } else if (selectedSubject.toLowerCase() === 'science') {
          const res = await fetch('https://a-istudy-lab.vercel.app/api/data/math-questions?category=science&limit=100');
          data = await res.json();
          // Transform science questions: strip labels, shuffle answer texts, and set correct letter
          data.questions = data.questions.map(q => {
            let rawOptions = q.options ? q.options.split(',').map(opt => opt.trim()) : [];
            // Remove label (e.g., 'a) ') from each option
            let answerTexts = rawOptions.map(opt => opt.replace(/^[a-dA-D]\)\s*/, ''));
            if (answerTexts.length !== 4) return q; // skip malformed
            const correctText = answerTexts[3]; // original correct answer is last
            // Shuffle answerTexts
            for (let i = answerTexts.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [answerTexts[i], answerTexts[j]] = [answerTexts[j], answerTexts[i]];
            }
            // Find new correct letter
            const correctIndex = answerTexts.findIndex(opt => opt === correctText);
            const correctLetter = ['a', 'b', 'c', 'd'][correctIndex];
            // Add back labels for display
            const displayOptions = answerTexts.map((txt, idx) => `${['a', 'b', 'c', 'd'][idx]}) ${txt}`);
            return {
              ...q,
              question: q.Problem,
              answer: correctLetter,
              options: displayOptions,
              explanation: q.Rationale || '',
            };
          });
        } else if (selectedSubject.toLowerCase() === 'history') {
          const res = await fetch('https://a-istudy-lab.vercel.app/api/data/math-questions?category=history&limit=100');
          data = await res.json();
          // Transform history questions: parse options, find correct letter, and display
          data.questions = data.questions.map(q => {
            let rawOptions = q.options ? q.options.split(',').map(opt => opt.trim()) : [];
            // Remove label (e.g., 'a) ') from each option
            let answerTexts = rawOptions.map(opt => opt.replace(/^[a-eA-E]\)\s*/, ''));
            // Find correct letter
            const correctLetter = q.correct;
            // Find correct text
            const correctIndex = ['a','b','c','d','e'].indexOf(correctLetter);
            const correctText = answerTexts[correctIndex];
            // Shuffle answerTexts
            for (let i = answerTexts.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [answerTexts[i], answerTexts[j]] = [answerTexts[j], answerTexts[i]];
            }
            // Find new correct letter
            const newCorrectIndex = answerTexts.findIndex(opt => opt === correctText);
            const displayOptions = answerTexts.map((txt, idx) => `${['a','b','c','d','e'][idx]}) ${txt}`);
            return {
              ...q,
              question: q.Problem,
              answer: ['a','b','c','d','e'][newCorrectIndex],
              options: displayOptions,
              explanation: q.Rationale || '',
            };
          });
        } else if (selectedSubject.toLowerCase() === 'computer science') {
          // Fetch Computer Science questions from the new API endpoint
          const res = await fetch(`https://a-istudy-lab.vercel.app/api/quiz?subject=Computer Science&limit=100`);
          data = await res.json();
          // Transform Computer Science questions to match quiz format
          data.questions = data.questions.map(q => ({
            ...q,
            question: q.question,
            answer: q.answer, // Already in A, B, C, D format
            options: q.options, // Already an array of options
            explanation: q.explanation || '',
          }));
        } else {
          const res = await fetch(`https://a-istudy-lab.vercel.app/api/quiz?subject=${encodeURIComponent(selectedSubject)}`);
          data = await res.json();
        }
        setQuestions(data.questions);
        
        // Load saved progress for this subject after questions are set
        setTimeout(() => {
          loadSavedProgress();
        }, 100);
        
        setCurrent(0);
        setSelected(null);
        setSubmitted(false);
      } catch (err) {
        setError('Failed to load quiz questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedSubject]);

  const handleSubmit = () => {
    if (selected === null) return;
    
    const selectedAnswer = questions[current].options[selected];
    let isCorrect = false;
    let explanation = questions[current].explanation || '';
    let correctAnswerText = '';
    
    if (selectedSubject && selectedSubject.toLowerCase() === 'science') {
      // For science, answer is the correct letter (a/b/c/d)
      const selectedLetter = ['a', 'b', 'c', 'd'][selected];
      isCorrect = selectedLetter === questions[current].answer;
      const correctIndex = ['a', 'b', 'c', 'd'].indexOf(questions[current].answer);
      correctAnswerText = questions[current].options[correctIndex];
    } else if (selectedSubject && selectedSubject.toLowerCase() === 'computer science') {
      // For Computer Science, answer is the correct letter (A/B/C/D)
      const selectedLetter = ['A', 'B', 'C', 'D'][selected];
      isCorrect = selectedLetter === questions[current].answer;
      const correctIndex = ['A', 'B', 'C', 'D'].indexOf(questions[current].answer);
      correctAnswerText = questions[current].options[correctIndex];
    } else if (questions[current].answer && questions[current].answer.length === 1) {
      // For math questions, the correct answer is just the letter (e.g., "e")
      const selectedLetter = selectedAnswer.trim().split(')')[0].trim();
      isCorrect = selectedLetter === questions[current].answer;
      const correctIndex = ['a', 'b', 'c', 'd', 'e'].indexOf(questions[current].answer.toLowerCase());
      correctAnswerText = questions[current].options[correctIndex];
    } else {
      isCorrect = selectedAnswer === questions[current].answer;
      correctAnswerText = questions[current].answer;
    }
    
    if (isCorrect) setScore(score + 1);
    
    // Mark current question as completed and track result
    setCompletedQuestions(prev => new Set([...prev, current]));
    setQuestionResults(prev => {
      const newResults = {
        ...prev,
        [current]: isCorrect
      };
      console.log('Setting question results:', newResults);
      return newResults;
    });
    
    // Save individual question progress to database
    saveQuestionProgress(current, isCorrect, selectedAnswer, correctAnswerText, explanation);
    
    setSubmitted(true);
    setFeedback(prev => {
      const newFeedback = [...prev];
      newFeedback[current] = {
      question: questions[current].question,
      selected: selectedAnswer,
      correct: correctAnswerText,
      isCorrect,
      explanation
      };
      return newFeedback;
    });
  };

  const handleAnswerSelect = (value) => {
    if (submitted) return;
    setSelected(value);
  };

  const recordProgress = async () => {
    try {
      const percentage = Math.round((score / questions.length) * 100);
      
      const progressData = {
        dailyProgress: percentage,
        quizzesCompleted: 1,
        studyTime: 15, // Estimated study time in minutes
        subjectsStudied: [selectedSubject],
        score: percentage,
        achievements: percentage >= 80 ? ['High Score'] : percentage >= 60 ? ['Good Performance'] : []
      };

      await apiPost('/progress/record', progressData);

    } catch (error) {
      console.error('Error recording progress:', error);
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setShowResults(true);
      // Record progress when quiz is completed
      recordProgress();
    }
  };

  const saveQuestionProgress = async (questionIndex, isCorrect, selectedAnswer, correctAnswer, explanation) => {
    try {
      const progressData = {
        dailyProgress: Math.round((completedQuestions.size / questions.length) * 100),
        quizzesCompleted: 1,
        studyTime: 5, // Estimated time per question in minutes
        subjectsStudied: [selectedSubject],
        score: isCorrect ? 100 : 0, // Score for this specific question
        achievements: isCorrect ? ['Correct Answer'] : ['Attempted'],
        questionDetails: {
          questionIndex,
          isCorrect,
          subject: selectedSubject,
          timestamp: new Date().toISOString(),
          selectedAnswer,
          correctAnswer,
          explanation
        }
      };

      await apiPost('/progress/record', progressData);
    } catch (error) {
      console.error('Error saving question progress:', error);
    }
  };

  const loadSavedProgress = async () => {
    try {
      setLoadingProgress(true);
      if (!selectedSubject) return;
      
      const data = await apiGet(`/progress/quiz-progress?subject=${encodeURIComponent(selectedSubject)}`);
      
      // Set completed questions
      setCompletedQuestions(new Set(data.data.completedQuestions));
      
      // Set question results
      console.log('Loading question results:', data.data.questionResults);
      setQuestionResults(data.data.questionResults);
      
      // Set score
      setScore(data.data.totalScore);
      
      // Create feedback array for completed questions
      const savedFeedback = [];
      data.data.completedQuestions.forEach(questionIndex => {
        const isCorrect = data.data.questionResults[questionIndex];
        const questionData = data.data.questionDetails?.[questionIndex] || {};
        savedFeedback[questionIndex] = {
          question: questions[questionIndex]?.question || `Question ${questionIndex + 1}`,
          selected: questionData.selectedAnswer || '',
          correct: questionData.correctAnswer || '',
          isCorrect: isCorrect,
          explanation: questionData.explanation || ''
        };
      });
      setFeedback(savedFeedback);
    } catch (error) {
      console.error('Error loading saved progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleTabChange = (activeKey) => {
    const questionIndex = parseInt(activeKey);
    setCurrent(questionIndex);
    setSelected(null);
    setSubmitted(false);
  };

  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  if (error) return <Alert message={error} type="error" showIcon style={{ margin: '40px auto', maxWidth: 400 }} />;

  if (!selectedSubject) {
    return (
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Title style={{textAlign:'center'}} level={4}>Select a Subject to Start Quiz</Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginTop: 24 }}>
            {/* Available subjects */}
            {['History', 'Computer Science', ...subjects.filter(s => s.toLowerCase() !== 'history' && s.toLowerCase() !== 'computer science')].map((subject, idx) => (
              <Button
                key={subject}
                type="primary"
                size="middle"
                icon={subjectIcons[idx % subjectIcons.length]}
                style={{
                  background: subjectColors[idx % subjectColors.length],
                  borderColor: subjectColors[idx % subjectColors.length],
                  color: '#fff',
                  minWidth: 120,
                  fontWeight: 500,
                  fontSize: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), filter 0.18s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
                onClick={() => {
                  if (!isLoggedIn) {
                    onShowLoginModal();
                    return;
                  }
                  setSelectedSubject(subject);
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.filter = 'brightness(1.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                {subject}
              </Button>
            ))}
            
            {/* Coming Soon subjects */}
            {['Literature', 'Chemistry', 'Physics', 'Programming', 'Philosophy', 'Astronomy', 'Biology', 'Geography'].map((subject, idx) => (
              <Button
                key={`coming-soon-${subject}`}
                type="default"
                size="middle"
                icon={subjectIcons[(subjects.length + idx) % subjectIcons.length]}
                style={{
                  background: '#f5f5f5',
                  borderColor: '#d9d9d9',
                  color: '#8c8c8c',
                  minWidth: 120,
                  fontWeight: 500,
                  fontSize: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), filter 0.18s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'not-allowed',
                  opacity: 0.7
                }}
                disabled={true}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {subject}
                <span style={{ fontSize: 10, marginLeft: 4, color: '#bfbfbf' }}>(Coming Soon)</span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!questions.length) return <Alert message="No quiz questions available for this subject." type="info" showIcon style={{ margin: '40px auto', maxWidth: 400 }} />;

  const q = questions[current];
  const fb = feedback[current];

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      {/* Back Button */}
      <Button onClick={() => {
        setSelectedSubject(null);
        setQuestions([]);
        setCurrent(0);
        setSelected(null);
        setSubmitted(false);
        setScore(0);
        setFeedback([]);
        setShowResults(false);
        // Don't reset completed questions and results - they will be loaded when subject is selected again
      }} style={{ marginBottom: 16 }}>
        ← Back to Subjects
      </Button>
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Tag color="blue">{selectedSubject}</Tag>
          <span style={{ marginLeft: 16, color: '#666' }}>
            Score: {score} / {questions.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: 16 }}>
          {loadingProgress && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              marginBottom: 8,
              fontSize: 12,
              color: '#1890ff'
            }}>
              <Spin size="small" />
              Loading your previous progress...
            </div>
          )}
          <div style={{ 
            width: '100%', 
            height: 8, 
            backgroundColor: '#f0f0f0', 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(completedQuestions.size / questions.length) * 100}%`,
              height: '100%',
              backgroundColor: '#52c41a',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: 8, 
            fontSize: 12, 
            color: '#666' 
          }}>
            <span>Progress: {completedQuestions.size} / {questions.length} completed</span>
            <span>{Math.round((completedQuestions.size / questions.length) * 100)}%</span>
          </div>
        </div>

        {/* Question Tabs */}
        <Tabs
          activeKey={current.toString()}
          onChange={handleTabChange}
          type="card"
          style={{ marginBottom: 24 }}
          tabBarStyle={{ 
            marginBottom: 16,
            borderBottom: '1px solid #f0f0f0'
          }}
          items={questions.map((question, index) => ({
            key: index.toString(),
            label: (
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4,
                minWidth: 40,
                justifyContent: 'center',
                position: 'relative'
              }}>
                {completedQuestions.has(index) ? (
                  questionResults[index] === true ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} />
                  ) : questionResults[index] === false ? (
                    <CloseCircleOutlined style={{ color: '#f5222d', fontSize: 14 }} />
                  ) : (
                    <MinusCircleOutlined style={{ color: '#d9d9d9', fontSize: 14 }} />
                  )
                ) : (
                  <MinusCircleOutlined style={{ color: '#d9d9d9', fontSize: 14 }} />
                )}
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: current === index ? 600 : 500,
                  color: current === index ? '#1890ff' : 'inherit'
                }}>
                  {index + 1}
                </span>
                {current === index && (
                  <div style={{
                    position: 'absolute',
                    bottom: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderBottom: '4px solid #1890ff'
                  }} />
                )}
              </span>
            ),
            children: (
              <div style={{ padding: '16px 0' }}>
                <Title level={4}>Question {index + 1}</Title>
                <p>{question.question}</p>
        <Radio.Group
          onChange={e => handleAnswerSelect(e.target.value)}
          value={selected}
          disabled={submitted}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
                  {Array.isArray(question.options) ? (
                    question.options.map((opt, optIndex) => (
              <Radio
                key={opt}
                        value={optIndex}
                disabled={submitted}
              >
                {opt}
              </Radio>
            ))
          ) : (
            <div style={{ color: 'red' }}>No options available for this question.</div>
          )}
        </Radio.Group>
        <div style={{ marginTop: 16 }}>
          {!submitted ? (
            <Button type="primary" onClick={handleSubmit} disabled={selected === null || submitting} loading={submitting}>
                      Submit Answer
            </Button>
          ) : (
            <>
                      {feedback[index] && feedback[index].isCorrect ? (
                        <Alert message="Correct!" description={feedback[index].explanation} type="success" showIcon />
              ) : (
                <Alert 
                  message={
                    <>
                      Incorrect answer.<br />
                              Correct answer: {feedback[index]?.correct || 'Not available'}
                    </>
                  }
                          description={`You selected: ${feedback[index]?.selected || 'Not available'}`}
                  type="error" 
                  showIcon 
                />
              )}
                      <div style={{ marginTop: 16 }}>
                        <Button 
                          onClick={handleNext} 
                          disabled={index === questions.length - 1}
                          style={{ marginRight: 8 }}
                        >
                          Next Question
                        </Button>
                        {index < questions.length - 1 && (
                          <Button 
                            onClick={() => {
                              setCurrent(index + 1);
                              setSelected(null);
                              setSubmitted(false);
                            }}
                          >
                            Skip to Next
              </Button>
                        )}
                      </div>
            </>
          )}
        </div>
                {submitted && index === questions.length - 1 && (
          <div style={{ marginTop: 24 }}>
            <Alert message={`Quiz Complete! Your score: ${score} / ${questions.length}`} type="info" showIcon />
          </div>
        )}
              </div>
            )
          }))}
        />
      </Card>
    </div>
  );
};

export default Quiz; 