import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';

const { Title, Text } = Typography;

type Quiz = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  reward: number;
  timeLimit: number;
  attemptsPerDay: number;
  onlinePlayers: number;
  isActive: boolean;
  questions?: any[];
};

type Category = {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
};

export default function Quizzes() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const [form] = Form.useForm();

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quiz');
      setQuizzes(res.data);
    } catch {
      message.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/category/active');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      message.error('Failed to load categories');
    }
  };

  useEffect(() => {
    loadQuizzes();
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingQuiz(null);
    form.resetFields();

    form.setFieldsValue({
      reward: 100,
      timeLimit: 300,
      attemptsPerDay: 2,
      onlinePlayers: 100,
      isActive: true,
    });

    setOpen(true);
  };

  const openEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);

    form.setFieldsValue({
      title: quiz.title,
      slug: quiz.slug,
      subtitle: quiz.subtitle,
      category: quiz.category,
      reward: quiz.reward,
      timeLimit: quiz.timeLimit,
      attemptsPerDay: quiz.attemptsPerDay,
      onlinePlayers: quiz.onlinePlayers,
      isActive: quiz.isActive,
    });

    setOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        slug: values.slug || createSlug(values.title),
      };

      if (editingQuiz) {
        await api.patch(`/quiz/${editingQuiz.id}`, payload);
        message.success('Quiz updated successfully');
      } else {
        await api.post('/quiz', payload);
        message.success('Quiz added successfully');
      }

      setOpen(false);
      setEditingQuiz(null);
      form.resetFields();
      loadQuizzes();
    } catch {
      message.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/quiz/${id}`);
      message.success('Quiz deleted successfully');
      loadQuizzes();
    } catch {
      message.error('Delete failed');
    }
  };

  const columns: ColumnsType<Quiz> = [
    {
      title: 'Quiz',
      dataIndex: 'title',
      render: (_: string, record) => (
        <div>
          <b>{record.title}</b>
          <br />
          <Text type="secondary">/{record.slug}</Text>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      render: (value: string) => (
        <Tag color="green" style={{ fontWeight: 700 }}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Points',
      dataIndex: 'reward',
      render: (value: number) => <b style={{ color: '#16A34A' }}>+{value}</b>,
    },
    {
      title: 'Time',
      dataIndex: 'timeLimit',
      render: (value: number) => `${Math.floor(value / 60)} min`,
    },
    {
      title: 'Attempts',
      dataIndex: 'attemptsPerDay',
      render: (value: number) => `${value} / day`,
    },
    {
      title: 'Online',
      dataIndex: 'onlinePlayers',
      render: (value: number) => (
        <Tag color="gold" style={{ fontWeight: 700 }}>
          {value} players
        </Tag>
      ),
    },
    {
      title: 'Questions',
      render: (_, record) => {
        const count = record.questions?.length || 0;

        return (
          <Space direction="vertical" size={4}>
            <Text strong>{count} Questions</Text>

            <Button
              size="small"
              type="primary"
              onClick={() => navigate(`/quizzes/${record.id}/questions`)}
            >
              Manage
            </Button>
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      render: (value: boolean) =>
        value ? (
          <Tag color="success">Active</Tag>
        ) : (
          <Tag color="error">Inactive</Tag>
        ),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button onClick={() => openEditModal(record)}>Edit</Button>

          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Quizzes
        </Title>
        <Text type="secondary">
          Manage quiz content, points, timer, attempts, questions, and online
          players.
        </Text>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 20px 60px rgba(6, 95, 70, 0.08)',
        }}
      >
        <Space
          style={{
            width: '100%',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            All Quizzes
          </Title>

          <Button
            type="primary"
            onClick={openAddModal}
            style={{
              background: '#16A34A',
              borderColor: '#16A34A',
              fontWeight: 700,
              borderRadius: 999,
            }}
          >
            + Add Quiz
          </Button>
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={quizzes}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={editingQuiz ? 'Edit Quiz' : 'Add Quiz'}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingQuiz(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Quiz Title"
            name="title"
            rules={[{ required: true, message: 'Please enter quiz title' }]}
          >
            <Input
              placeholder="Example: Virat Hardcore Fans"
              onChange={(e) => {
                if (!editingQuiz) {
                  form.setFieldValue('slug', createSlug(e.target.value));
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Slug is required' }]}
          >
            <Input placeholder="virat-hardcore-fans" />
          </Form.Item>

          <Form.Item
            label="Subtitle"
            name="subtitle"
            rules={[{ required: true, message: 'Please enter subtitle' }]}
          >
            <Input placeholder="Test your knowledge and earn rewards" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select
              placeholder="Select category"
              showSearch
              optionFilterProp="label"
              options={categories.map((category) => ({
                value: category.name,
                label: `${category.icon || '📚'} ${category.name}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Reward Points"
            name="reward"
            rules={[{ required: true, message: 'Please enter reward points' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Time Limit Seconds"
            name="timeLimit"
            rules={[{ required: true, message: 'Please enter time limit' }]}
          >
            <InputNumber min={30} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Attempts Per Day"
            name="attemptsPerDay"
            rules={[{ required: true, message: 'Please enter attempts' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Online Players"
            name="onlinePlayers"
            rules={[{ required: true, message: 'Please enter online players' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            {editingQuiz ? 'Update Quiz' : 'Save Quiz'}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
