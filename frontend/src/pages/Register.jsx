import React, { useState } from 'react';
import { Form, Input, Button, Alert, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Register = ({ onRegister }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      message.success('Registration successful! Redirecting to login...');
      if (onRegister) onRegister(values);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2 style={{color:'white'}}>Register</h2>
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item name="name" label={<span style={{ color: 'white' }}>Name</span>} rules={[{ required: true }]}> 
          <Input placeholder="Name" />
        </Form.Item>
        <Form.Item name="email" label={<span style={{ color: 'white' }}>Email</span>} rules={[{ required: true, type: 'email' }]}> 
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" label={<span style={{ color: 'white' }}>Password</span>} rules={[{ required: true, min: 6 }]}> 
          <Input.Password placeholder="Password (min 6 chars)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Register</Button>
        </Form.Item>
        {error && <Alert message={error} type="error" showIcon />}
      </Form>
      {loading && <Spin style={{ marginTop: 16 }} />}
    </div>
  );
};

export default Register; 