import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/api';

const { Title, Text } = Typography;

export default function Questions() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const [editing, setEditing] = useState<any>(null);
  const [bulkText, setBulkText] = useState('');

  const [form] = Form.useForm();

  const loadQuiz = async () => {
    const res = await api.get('/quiz');
    const found = res.data.find((q: any) => q.id === quizId);
    setQuiz(found);
  };

  const loadQuestions = async () => {
    if (!quizId) return;

    setLoading(true);
    const res = await api.get(`/question/quiz/${quizId}`);
    setQuestions(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadQuiz();
    loadQuestions();
  }, [quizId]);

  const startAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const startEdit = (record: any) => {
    setEditing(record);
    setOpen(true);

    form.setFieldsValue(record);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await api.patch(`/question/${editing.id}`, values);
        message.success('Updated');
      } else {
        await api.post('/question', {
          quizId,
          ...values,
        });
        message.success('Added');
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
      loadQuestions();
    } catch {
      message.error('Failed');
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/question/${id}`);
    message.success('Deleted');
    loadQuestions();
  };

  // 🔥 BULK PARSER
  const parseBulk = () => {
    const lines = bulkText.split('\n');

    return lines
      .map((line) => {
        const parts = line.split('|').map((p) => p.trim());

        if (parts.length !== 6) return null;

        return {
          question: parts[0],
          optionA: parts[1],
          optionB: parts[2],
          optionC: parts[3],
          optionD: parts[4],
          correctOptionId: parts[5].toLowerCase(),
        };
      })
      .filter(Boolean);
  };

  const handleBulkAdd = async () => {
    const parsed = parseBulk();

    if (parsed.length === 0) {
      message.error('Invalid format');
      return;
    }

    const res = await api.post('/question/bulk', {
      quizId,
      questions: parsed,
    });

    message.success(`${res.data.count} questions added`);
    setBulkText('');
    setBulkOpen(false);
    loadQuestions();
  };

  const renderOption = (key: string) => {
    return (text: string, record: any) =>
      record.correctOptionId === key ? (
        <b style={{ color: '#16A34A' }}>{text} ✅</b>
      ) : (
        text
      );
  };

  const columns = [
    { title: 'Question', dataIndex: 'question' },
    { title: 'A', dataIndex: 'optionA', render: renderOption('a') },
    { title: 'B', dataIndex: 'optionB', render: renderOption('b') },
    { title: 'C', dataIndex: 'optionC', render: renderOption('c') },
    { title: 'D', dataIndex: 'optionD', render: renderOption('d') },
    {
      title: 'Actions',
      render: (_: any, record: any) => (
        <Space>
          <Button onClick={() => startEdit(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/quizzes')}
        >
          Back
        </Button>

        <Title level={3}>{quiz?.title}</Title>
        <Text>Category: {quiz?.category}</Text>

        <Space>
          <Button type="primary" onClick={startAdd}>
            Add Question
          </Button>

          <Button onClick={() => setBulkOpen(true)}>Bulk Add</Button>
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={questions}
          loading={loading}
        />
      </Space>

      {/* NORMAL MODAL */}
      <Modal open={open} onCancel={() => setOpen(false)} footer={null}>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="optionA"
            label="Option A"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="optionB"
            label="Option B"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="optionC"
            label="Option C"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="optionD"
            label="Option D"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="correctOptionId" label="Correct">
            <Select
              options={[
                { label: 'A', value: 'a' },
                { label: 'B', value: 'b' },
                { label: 'C', value: 'c' },
                { label: 'D', value: 'd' },
              ]}
            />
          </Form.Item>

          <Button htmlType="submit" type="primary" block>
            Save
          </Button>
        </Form>
      </Modal>

      {/* BULK MODAL */}
      <Modal
        title="Bulk Add Questions"
        open={bulkOpen}
        onCancel={() => setBulkOpen(false)}
        onOk={handleBulkAdd}
      >
        <Text>Format: Question | A | B | C | D | correct</Text>

        <Input.TextArea
          rows={10}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder={`What is capital of India? | Hyderabad | Delhi | Mumbai | Chennai | b`}
        />
      </Modal>
    </Card>
  );
}
