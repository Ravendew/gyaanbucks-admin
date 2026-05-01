import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import axios from 'axios';

const Login = () => {
  const [loading, setLoading] = useState(false);

  // 🔒 Already logged-in check
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      window.location.href = '/';
    }
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const res = await axios.post(
        'http://localhost:5000/admin-auth/login',
        values,
      );

      const data = res.data;

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.admin));

      message.success('Login Successful');

      window.location.href = '/';
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5',
      }}
    >
      <Card title="Admin Login" style={{ width: 350 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
