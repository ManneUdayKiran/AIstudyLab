import React, { useState } from 'react';
import { Card, List, Button, Input, DatePicker, Space, Typography, Checkbox, Modal, message, Tag, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BulbOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Example smart suggestions
const SMART_SUGGESTIONS = [
  "You struggled with Algebra yesterday. Practice 5 more problems today.",
  "Try this 2-minute video on Newton’s Laws.",
  "Review your notes on World War II for 10 minutes.",
  "Take a short quiz on Photosynthesis.",
  "Revise English grammar rules for 15 minutes.",
  "Practice coding a simple calculator in Python.",
];

// Example weekly plan
const WEEKLY_PLAN = [
  { day: 'Monday', suggestion: "Focus on Algebra and complete 3 practice problems." },
  { day: 'Tuesday', suggestion: "Watch a video on Newton's Laws and take notes." },
  { day: 'Wednesday', suggestion: "Revise World History and attempt a quiz." },
  { day: 'Thursday', suggestion: "Practice English essay writing for 20 minutes." },
  { day: 'Friday', suggestion: "Complete a coding challenge in Python." },
  { day: 'Saturday', suggestion: "Review all weak topics and make summary notes." },
  { day: 'Sunday', suggestion: "Rest and reflect on your week's progress." },
];

const StudyRecommendations = () => {
  // To-Do List State
  const [todos, setTodos] = useState([
    { id: 1, text: 'Practice 5 Algebra problems', deadline: dayjs().add(1, 'day'), completed: false },
    { id: 2, text: 'Watch Newton’s Laws video', deadline: dayjs().add(2, 'day'), completed: false },
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [newDeadline, setNewDeadline] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDeadline, setEditDeadline] = useState(null);

  // Smart suggestion (random)
  const [suggestion] = useState(SMART_SUGGESTIONS[Math.floor(Math.random() * SMART_SUGGESTIONS.length)]);

  // To-Do List Handlers
  const addTodo = () => {
    if (!newTodo) return message.warning('Please enter a task.');
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: newTodo,
        deadline: newDeadline,
        completed: false,
      },
    ]);
    setNewTodo('');
    setNewDeadline(null);
  };

  const startEdit = (todo) => {
    setEditing(todo.id);
    setEditText(todo.text);
    setEditDeadline(todo.deadline);
  };

  const saveEdit = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, text: editText, deadline: editDeadline } : todo));
    setEditing(null);
    setEditText('');
    setEditDeadline(null);
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
      <Col xs={24} md={12}>
        <Card title={<span><CalendarOutlined /> Personalized To-Do List</span>}>
          <List
            dataSource={todos}
            locale={{ emptyText: 'No tasks yet!' }}
            renderItem={item => (
              <List.Item
                actions={[
                  editing === item.id ? (
                    <>
                      <Button type="link" onClick={() => saveEdit(item.id)}>Save</Button>
                      <Button type="link" onClick={() => setEditing(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button icon={<EditOutlined />} type="link" onClick={() => startEdit(item)} />
                      <Button icon={<DeleteOutlined />} type="link" danger onClick={() => deleteTodo(item.id)} />
                    </>
                  )
                ]}
              >
                <Checkbox checked={item.completed} onChange={() => toggleComplete(item.id)} style={{ marginRight: 8 }} />
                {editing === item.id ? (
                  <Space>
                    <Input
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      style={{ width: 180 }}
                    />
                    <DatePicker
                      value={editDeadline}
                      onChange={setEditDeadline}
                      style={{ width: 130 }}
                    />
                  </Space>
                ) : (
                  <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
                    {item.text}
                    {item.deadline && (
                      <Tag color={dayjs(item.deadline).isBefore(dayjs(), 'day') ? 'red' : 'blue'} style={{ marginLeft: 8 }}>
                        {dayjs(item.deadline).format('MMM D')}
                      </Tag>
                    )}
                  </span>
                )}
              </List.Item>
            )}
          />
          <Space style={{ marginTop: 16 }}>
            <Input
              placeholder="Add a new task..."
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              style={{ width: 180 }}
              onPressEnter={addTodo}
            />
            <DatePicker
              value={newDeadline}
              onChange={setNewDeadline}
              style={{ width: 130 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={addTodo}>
              Add
            </Button>
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title={<span><BulbOutlined /> Smart AI Suggestions</span>}>
          <Text style={{ fontSize: 16 }}>{suggestion}</Text>
        </Card>
        <Card title={<span><CalendarOutlined /> Weekly Study Plan</span>} style={{ marginTop: 24 }}>
          <List
            dataSource={WEEKLY_PLAN}
            renderItem={item => (
              <List.Item>
                <Text strong>{item.day}:</Text> <span style={{ marginLeft: 8 }}>{item.suggestion}</span>
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StudyRecommendations; 