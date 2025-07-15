import React, { useState } from 'react';
import { Form, Input, Button, Alert, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../App.css';
const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      // Add a timeout for the fetch request (10 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      let res, data;
      try {
        res = await fetch('https://aistudylab.onrender.com/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        data = await res.json();
      } catch (fetchErr) {
        if (fetchErr.name === 'AbortError') {
          throw new Error('Server is taking too long to respond. If it failed to load, please try again.');
        } else {
          throw fetchErr;
        }
      }
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (onLogin) onLogin(true, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{color:'white'}}>
      <h2 style={{color:'white'}}>Login</h2>
      <Form style={{ color: 'white' }} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="email"
          label={<span style={{ color: 'white' }}>Email</span>}
          rules={[{ required: true, type: 'email' }]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          label={<span style={{ color: 'white' }}>Password</span>}
          rules={[{ required: true }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
        {error && <Alert message={error} type="error" showIcon />}
      </Form>
      {/* {loading && <Spin style={{ marginTop: 16 }} />} */}
    </div>
  );
};

export default Login; 