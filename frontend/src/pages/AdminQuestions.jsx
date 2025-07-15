import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Tag, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title } = Typography;
const apiUrl = 'https://aistudylab.onrender.com/api/admin/questions';
const defaultForm = { question: '', options: ['', '', '', ''], answer: '', explanation: '' };

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      setQuestions(data.questions);
    } catch {
      message.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleAdd = () => {
    setEditing(null);
    form.setFieldsValue(defaultForm);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({ ...record });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      message.success('Question deleted');
      fetchQuestions();
    } catch {
      message.error('Delete failed');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await fetch(`${apiUrl}/${editing._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success('Question updated');
      } else {
        await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success('Question added');
      }
      setModalOpen(false);
      fetchQuestions();
    } catch {
      message.error('Save failed');
    }
  };

  const columns = [
    { title: 'Question', dataIndex: 'question', key: 'question', render: q => <span><FileTextOutlined style={{ color: '#1890ff', marginRight: 6 }} />{q}</span> },
    { title: 'Options', dataIndex: 'options', key: 'options', render: opts => opts.map((o, i) => <Tag key={i} color="blue">{o}</Tag>) },
    { title: 'Answer', dataIndex: 'answer', key: 'answer', render: a => <Tag color="green">{a}</Tag> },
    { title: 'Explanation', dataIndex: 'explanation', key: 'explanation', render: e => e ? <span style={{ color: '#888' }}>{e}</span> : <span style={{ color: '#ccc' }}>—</span> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)} type="link" icon={<EditOutlined />}>
            Edit
          </Button>
          <Popconfirm title="Delete this question?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
            <Button danger type="link" icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32 }}>
      <Card bordered style={{ boxShadow: '0 2px 16px #f0f1f2' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Admin: Manage Quiz Questions</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">Add Question</Button>
        </div>
        <Table columns={columns} dataSource={questions} rowKey="_id" loading={loading} bordered pagination={{ pageSize: 8 }} />
      </Card>
      <Modal
        title={editing ? 'Edit Question' : 'Add Question'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        okText={editing ? 'Update' : 'Add'}
      >
        <Form form={form} layout="vertical" initialValues={defaultForm}>
          <Form.Item name="question" label="Question" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item label="Options">
            <Form.List name="options" initialValue={['', '', '', '']}>
              {(fields) => (
                <>
                  {fields.map((field, idx) => (
                    <Form.Item {...field} key={field.key} rules={[{ required: true, message: 'Option required' }]}
                      label={`Option ${idx + 1}`}
                    >
                      <Input />
                    </Form.Item>
                  ))}
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item name="answer" label="Correct Answer" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="explanation" label="Explanation"> <Input.TextArea autoSize /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminQuestions; 