import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Avatar, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Option } = Select;

const OnboardingModal = ({ visible, onFinish, loading, initialValues }) => {
  const [form] = Form.useForm();
  const [selectedAvatar, setSelectedAvatar] = useState(initialValues?.avatar || '');

  const avatars = [
    '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👦', '👧', '🧑‍🎓', '👩‍💻', '👨‍💻'
  ];

  const grades = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',"class 11",'class 12','B.Tech/B.E'
  ];

  const subjects = [
    'Mathematics', 'Science', 'History', 'English', 'Geography',
    'Computer Science', 'General Knowledge', 'Space', 'Coding'
  ];

  const moods = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '🤔', label: 'Thoughtful' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '😤', label: 'Determined' },
    { emoji: '😎', label: 'Confident' }
  ];

  const handleSubmit = async (values) => {
    const profileData = {
      ...values,
      avatar: selectedAvatar || '👨‍🎓'
    };
    await onFinish(profileData);
  };

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        dailyStudyTime: initialValues.dailyStudyTime || 60,
        mood: initialValues.mood || '😊',
      });
      setSelectedAvatar(initialValues.avatar || '');
    } else {
      form.resetFields();
      setSelectedAvatar('');
    }
  }, [initialValues, form]);

  return (
    <Modal
      title={initialValues ? "Edit Profile" : "Welcome! Let's set up your profile"}
      open={visible}
      footer={null}
      closable={false}
      maskClosable={false}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          dailyStudyTime: 60,
          mood: '😊',
          ...initialValues
        }}
      >
        <Form.Item label="Choose your avatar">
          <Space wrap>
            {avatars.map((avatar, index) => (
              <Avatar
                key={index}
                size={64}
                style={{
                  cursor: 'pointer',
                  border: selectedAvatar === avatar ? '3px solid #1890ff' : '2px solid #d9d9d9',
                  fontSize: '24px'
                }}
                onClick={() => setSelectedAvatar(avatar)}
              >
                {avatar}
              </Avatar>
            ))}
          </Space>
        </Form.Item>

        <Form.Item
          name="grade"
          label="What grade are you in?"
          rules={[{ required: true, message: 'Please select your grade' }]}
        >
          <Select placeholder="Select your grade">
            {grades.map(grade => (
              <Option key={grade} value={grade}>{grade}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="currentFocus"
          label="What subject are you currently focusing on?"
          rules={[{ required: true, message: 'Please select your current focus' }]}
        >
          <Select placeholder="Select your current focus">
            {subjects.map(subject => (
              <Option key={subject} value={subject}>{subject}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="dailyStudyTime"
          label="How many minutes do you study daily?"
          rules={[{ required: true, message: 'Please enter your daily study time' }]}
        >
          <InputNumber
            min={15}
            max={480}
            step={15}
            style={{ width: '100%' }}
            placeholder="Enter minutes"
          />
        </Form.Item>

        <Form.Item
          name="mood"
          label="How are you feeling today?"
          rules={[{ required: true, message: 'Please select your mood' }]}
        >
          <Select placeholder="Select your mood">
            {moods.map(mood => (
              <Option key={mood.emoji} value={mood.emoji}>
                <Space>
                  <span style={{ fontSize: '18px' }}>{mood.emoji}</span>
                  <span>{mood.label}</span>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Complete Setup
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OnboardingModal; 