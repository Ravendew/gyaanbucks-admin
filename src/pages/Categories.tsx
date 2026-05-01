import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

type Category = {
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
  createdAt: string;
};

const API_BASE_URL = 'https://gyaanbucks-backend-production.up.railway.app';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/category`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      icon: '📚',
      description: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      icon: category.icon,
      description: category.description || '',
      isActive: category.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        name: values.name,
        icon: values.icon || '📚',
        description: values.description || '',
        isActive: values.isActive ?? true,
      };

      const url = editingCategory
        ? `${API_BASE_URL}/category/${editingCategory.id}`
        : `${API_BASE_URL}/category`;

      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Save failed');
      }

      message.success(editingCategory ? 'Category updated' : 'Category added');
      setModalOpen(false);
      form.resetFields();
      loadCategories();
    } catch {
      message.error('Please check category details');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/category/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Delete failed');
      }

      message.success('Category deleted');
      loadCategories();
    } catch {
      message.error('Failed to delete category');
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      width: 90,
      render: (icon) => (
        <span style={{ fontSize: 24, lineHeight: 1 }}>{icon || '📚'}</span>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'name',
      render: (_, record) => (
        <div>
          <Typography.Text strong>{record.name}</Typography.Text>
          <br />
          <Typography.Text type="secondary">
            {record.description || 'No description added'}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 120,
      render: (isActive) =>
        isActive ? (
          <Typography.Text type="success">Active</Typography.Text>
        ) : (
          <Typography.Text type="danger">Inactive</Typography.Text>
        ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      width: 180,
      render: (createdAt) => new Date(createdAt).toLocaleDateString(),
    },
    {
      title: 'Actions',
      width: 190,
      render: (_, record) => (
        <Space>
          <Button onClick={() => openEditModal(record)}>Edit</Button>
          <Popconfirm
            title="Delete category?"
            description="This will remove this category."
            okText="Delete"
            cancelText="Cancel"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Categories
          </Typography.Title>
          <Typography.Text type="secondary">
            Manage quiz categories shown on frontend.
          </Typography.Text>
        </div>

        <Button type="primary" onClick={openAddModal}>
          Add Category
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={categories}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editingCategory ? 'Update' : 'Create'}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Category Name"
            name="name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="Example: General Knowledge" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={3}
              maxLength={140}
              showCount
              placeholder="Example: Improve your general knowledge with quick quizzes."
            />
          </Form.Item>

          <Form.Item label="Icon" name="icon">
            <Input placeholder="Example: 🧠" maxLength={4} />
          </Form.Item>

          <Form.Item
            label="Active"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
