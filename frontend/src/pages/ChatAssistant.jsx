import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List, Typography, Spin, Alert, Tooltip, Popconfirm, Avatar, Modal } from 'antd';
import { SendOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import Lottie from "lottie-react";
import botAnimation from "../assets/bot.json";

const { Text } = Typography;

const ChatAssistant = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const messagesEndRef = useRef(null);
  const listRef = useRef(null);

  // Fetch chat history on mount
  useEffect(() => {
    if (!user.email) return;
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/chat/history?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch {
        setMessages([{ sender: 'ai', text: ' ' }]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [user.email]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!user.email) {
      setShowLoginModal(true);
      return;
    }
    if (!input.trim()) return;
    const userMessage = input;
    setInput('');
    setMessages(prev => ([...prev, { sender: 'user', text: userMessage }]));
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, email: user.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI error');
      setMessages(prev => ([...prev, { sender: 'ai', text: data.reply }]));
    } catch (err) {
      setError(err.message);
      setMessages(prev => ([...prev, { sender: 'ai', text: 'Sorry, I could not process your request.' }]));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    if (!user.email) {
      setShowLoginModal(true);
      return;
    }
    setInput(e.target.value);
  };

  const handleClear = async () => {
    if (!user.email) return;
    setLoading(true);
    setError(null);
    try {
      await fetch('http://localhost:3000/api/chat/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      setMessages([{ sender: 'ai', text: 'Hi! I am your study assistant. How can I help you today?' }]);
    } catch (err) {
      setError('Failed to clear messages.');
    } finally {
      setLoading(false);
    }
  };

  if (!user.email) {
    // Not logged in: show bot animation and greeting
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <Card title="AI Chat Assistant" bordered={false}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Lottie
              animationData={botAnimation}
              loop
              autoplay
              style={{ height: 180, width: 180, margin: '0 auto' }}
            />
            <Typography.Title level={5} style={{ marginTop: 8, color: '#1890ff' }}>
              Hi! I am your study assistant. Please log in to use the chat assistant.
            </Typography.Title>
          </div>
          <Input.Group compact style={{ marginTop: 16, display: 'flex' }}>
            <Input
              style={{ width: '100%', borderRadius: '5px' }}
              value={input}
              onChange={handleInputChange}
              onPressEnter={handleSend}
              placeholder="Type your question..."
              disabled={false}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} disabled={!input.trim()} />
          </Input.Group>
          <Modal
            open={showLoginModal}
            onCancel={() => setShowLoginModal(false)}
            footer={null}
            centered
          >
            <Typography.Title level={5} style={{ textAlign: 'center', marginBottom: 16 }}>
              Please log in to use the chat assistant.
            </Typography.Title>
          </Modal>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <Card title="AI Chat Assistant" bordered={false}>
        {historyLoading ? (
          <Spin style={{ display: 'block', margin: '40px auto' }} />
        ) : (
          <>
            {/* Show bot animation and greeting if chat is empty or only has the initial greeting */}
            {messages.length === 0 || (messages.length === 1 && messages[0].sender === 'ai') ? (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Lottie
                  animationData={botAnimation}
                  loop
                  autoplay
                  style={{ height: 180, width: 180, margin: '0 auto' }}
                />
                {/* <Typography.Title level={5} style={{ marginTop: 8, color: '#1890ff' }}>
                  Hi! I am your study assistant. How can I help you today?
                </Typography.Title> */}
              </div>
            ) : null}
            <div
              ref={listRef}
              style={{ maxHeight: 350, overflowY: 'auto', marginBottom: 16, background: '#fafafa', borderRadius: 8, padding: 8 }}
            >
              <List
                dataSource={messages}
                renderItem={msg => (
                  <List.Item style={{ justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
                    {msg.sender === 'ai' && (
                      <div style={{ marginRight: 8, minWidth: 36 }}>
                        <Lottie
                          animationData={botAnimation}
                          loop
                          autoplay
                          style={{ height: 36, width: 36 }}
                        />
                      </div>
                    )}
                    <Text type={msg.sender === 'ai' ? 'primary' : undefined} style={{ background: '#f5f5f5', borderRadius: 8, padding: '6px 12px' }}>
                      {msg.text}
                    </Text>
                    {msg.sender === 'user' && (
                      <div style={{ marginLeft: 8, minWidth: 36 }}>
                        <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                      </div>
                    )}
                  </List.Item>
                )}
              />
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
        <Input.Group compact style={{ marginTop: 16, display: 'flex' }}>
          <Popconfirm
            title="Clear all chat messages?"
            description="This will permanently remove your chat history. Are you sure?"
            onConfirm={handleClear}
            okText="Yes, clear"
            cancelText="Cancel"
            placement="topLeft"
          >
            <Tooltip title="Clear Messages">
              <Button
                disabled={loading}
                icon={<DeleteOutlined />}
                style={{ marginRight: 8, background: '#fffbe6', color: '#faad14', borderColor: '#ffe58f', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Tooltip>
          </Popconfirm>
          <Input
            style={{ width: 'calc(100% - 70px)',borderRadius: '5px' }}
            value={input}
            onChange={handleInputChange}
            onPressEnter={handleSend}
            placeholder="Type your question..."
            disabled={loading}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSend} disabled={loading || !input.trim()} />
        </Input.Group>
        {loading && <Spin style={{ marginTop: 16 }} />}
        {error && <Alert message={error} type="error" showIcon style={{ marginTop: 16 }} />}
      </Card>
    </div>
  );
};

export default ChatAssistant;