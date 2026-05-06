import {
  Button,
  Card,
  Form,
  Grid,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
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
const { useBreakpoint } = Grid;

const PAGE_KEY = 'gyaanbucks_quizzes_page';
const PAGE_SIZE_KEY = 'gyaanbucks_quizzes_page_size';

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
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(localStorage.getItem(PAGE_KEY) || 1);
  });
  const [pageSize, setPageSize] = useState(() => {
    return Number(localStorage.getItem(PAGE_SIZE_KEY) || 10);
  });

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
      setQuizzes(Array.isArray(res.data) ? res.data : []);
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
        <div style={{ minWidth: 220 }}>
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

          <Popconfirm
            title="Delete quiz?"
            description="This action cannot be undone."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderMobileCards = () => {
    if (loading) {
      return <Text type="secondary">Loading quizzes...</Text>;
    }

    if (quizzes.length === 0) {
      return <Text type="secondary">No quizzes found.</Text>;
    }

    return (
      <div style={{ display: 'grid', gap: 14 }}>
        {quizzes.map((quiz) => {
          const count = quiz.questions?.length || 0;

          return (
            <Card
              key={quiz.id}
              style={{
                borderRadius: 18,
                boxShadow: '0 12px 34px rgba(6, 95, 70, 0.08)',
              }}
              styles={{ body: { padding: 16 } }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div>
                  <Text strong style={{ fontSize: 16 }}>
                    {quiz.title}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    /{quiz.slug}
                  </Text>
                </div>

                <Space wrap>
                  <Tag color="green">{quiz.category}</Tag>
                  {quiz.isActive ? (
                    <Tag color="success">Active</Tag>
                  ) : (
                    <Tag color="error">Inactive</Tag>
                  )}
                </Space>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  <div>
                    <Text type="secondary">Points</Text>
                    <br />
                    <Text strong style={{ color: '#16A34A' }}>
                      +{quiz.reward}
                    </Text>
                  </div>

                  <div>
                    <Text type="secondary">Time</Text>
                    <br />
                    <Text strong>{Math.floor(quiz.timeLimit / 60)} min</Text>
                  </div>

                  <div>
                    <Text type="secondary">Attempts</Text>
                    <br />
                    <Text strong>{quiz.attemptsPerDay} / day</Text>
                  </div>

                  <div>
                    <Text type="secondary">Questions</Text>
                    <br />
                    <Text strong>{count}</Text>
                  </div>
                </div>

                <Space wrap style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                  >
                    Manage Questions
                  </Button>

                  <Button onClick={() => openEditModal(quiz)}>Edit</Button>

                  <Popconfirm
                    title="Delete quiz?"
                    description="This action cannot be undone."
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDelete(quiz.id)}
                  >
                    <Button danger>Delete</Button>
                  </Popconfirm>
                </Space>
              </Space>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: isMobile ? 18 : 24 }}>
        <Title
          level={2}
          style={{ marginBottom: 4, fontSize: isMobile ? 26 : 30 }}
        >
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
          borderRadius: isMobile ? 18 : 24,
          padding: isMobile ? 16 : 28,
          boxShadow: '0 20px 60px rgba(6, 95, 70, 0.08)',
        }}
      >
        <Space
          direction={isMobile ? 'vertical' : 'horizontal'}
          style={{
            width: '100%',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            marginBottom: 18,
          }}
        >
          <Title level={3} style={{ margin: 0, fontSize: isMobile ? 22 : 24 }}>
            All Quizzes
          </Title>

          <Button
            type="primary"
            onClick={openAddModal}
            block={isMobile}
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

        {isMobile ? (
          renderMobileCards()
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={quizzes}
            loading={loading}
            scroll={{ x: 1050 }}
            pagination={{
              current: currentPage,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
                localStorage.setItem(PAGE_KEY, String(page));
                localStorage.setItem(PAGE_SIZE_KEY, String(size));
              },
            }}
          />
        )}
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
        width={isMobile ? 'calc(100vw - 24px)' : 520}
        centered
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Quiz Title"
            name="title"
            rules={[{ required: true, message: 'Please enter quiz title' }]}
          >
            <Input
              placeholder="Example: General Knowledge Practice Quiz"
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
            <Input placeholder="general-knowledge-practice-quiz" />
          </Form.Item>

          <Form.Item
            label="Subtitle"
            name="subtitle"
            rules={[{ required: true, message: 'Please enter subtitle' }]}
          >
            <Input placeholder="Practice your knowledge with useful quiz questions" />
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
            label="Learning Points"
            name="reward"
            rules={[{ required: true, message: 'Please enter points' }]}
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
