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
import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';

type Category = {
  id: string;
  name: string;
  icon: string;
  description: string;
  position: number;
  isActive: boolean;
  createdAt: string;
};

const PAGE_KEY = 'gyaanbucks_categories_page';
const PAGE_SIZE_KEY = 'gyaanbucks_categories_page_size';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(localStorage.getItem(PAGE_KEY) || 1);
  });
  const [pageSize, setPageSize] = useState(() => {
    return Number(localStorage.getItem(PAGE_SIZE_KEY) || 10);
  });
  const [form] = Form.useForm();

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const posA = Number(a.position || 0);
      const posB = Number(b.position || 0);

      if (posA !== posB) return posA - posB;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [categories]);

  const normalizePositions = (list: Category[]) => {
    return list.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/category');
      setCategories(Array.isArray(res.data) ? res.data : []);
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

      if (editingCategory) {
        await api.patch(`/category/${editingCategory.id}`, payload);
      } else {
        await api.post('/category', payload);
      }

      message.success(editingCategory ? 'Category updated' : 'Category added');
      setModalOpen(false);
      setEditingCategory(null);
      form.resetFields();
      loadCategories();
    } catch {
      message.error('Please check category details');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/category/${id}`);
      message.success('Category deleted');
      loadCategories();
    } catch {
      message.error('Failed to delete category');
    }
  };

  const moveCategory = (dragId: string, dropId: string) => {
    if (dragId === dropId) return;

    const currentList = [...sortedCategories];
    const dragIndex = currentList.findIndex((item) => item.id === dragId);
    const dropIndex = currentList.findIndex((item) => item.id === dropId);

    if (dragIndex === -1 || dropIndex === -1) return;

    const [draggedItem] = currentList.splice(dragIndex, 1);
    currentList.splice(dropIndex, 0, draggedItem);

    setCategories(normalizePositions(currentList));
  };

  const moveToTop = (record: Category) => {
    const list = sortedCategories.filter((item) => item.id !== record.id);
    setCategories(normalizePositions([record, ...list]));
    setCurrentPage(1);
    localStorage.setItem(PAGE_KEY, '1');
  };

  const moveUp = (record: Category) => {
    const list = [...sortedCategories];
    const index = list.findIndex((item) => item.id === record.id);

    if (index <= 0) return;

    [list[index - 1], list[index]] = [list[index], list[index - 1]];
    setCategories(normalizePositions(list));

    const newPage = Math.ceil(index / pageSize);
    setCurrentPage(newPage);
    localStorage.setItem(PAGE_KEY, String(newPage));
  };

  const moveDown = (record: Category) => {
    const list = [...sortedCategories];
    const index = list.findIndex((item) => item.id === record.id);

    if (index === -1 || index >= list.length - 1) return;

    [list[index], list[index + 1]] = [list[index + 1], list[index]];
    setCategories(normalizePositions(list));

    const newPage = Math.ceil((index + 2) / pageSize);
    setCurrentPage(newPage);
    localStorage.setItem(PAGE_KEY, String(newPage));
  };

  const handleSaveOrder = async () => {
    try {
      setSavingOrder(true);

      const items = sortedCategories.map((category, index) => ({
        id: category.id,
        position: index + 1,
      }));

      await api.post('/category/reorder', { items });

      message.success('Category order saved');
      loadCategories();
    } catch {
      message.error('Failed to save category order');
    } finally {
      setSavingOrder(false);
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'Order',
      width: 90,
      render: (_, __, index) => (
        <Typography.Text type="secondary">
          #{(currentPage - 1) * pageSize + index + 1}
        </Typography.Text>
      ),
    },
    {
      title: 'Drag',
      width: 80,
      render: () => (
        <Typography.Text
          style={{
            cursor: 'grab',
            fontSize: 20,
            color: '#999',
            userSelect: 'none',
          }}
        >
          ☰
        </Typography.Text>
      ),
    },
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
      width: 160,
      render: (createdAt) => new Date(createdAt).toLocaleDateString(),
    },
    {
      title: 'Reorder',
      width: 230,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => moveToTop(record)}>
            Top
          </Button>
          <Button size="small" onClick={() => moveUp(record)}>
            Up
          </Button>
          <Button size="small" onClick={() => moveDown(record)}>
            Down
          </Button>
        </Space>
      ),
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
            Drag rows, use Top/Up/Down, then save order.
          </Typography.Text>
        </div>

        <Space>
          <Button onClick={handleSaveOrder} loading={savingOrder}>
            Save Order
          </Button>

          <Button type="primary" onClick={openAddModal}>
            Add Category
          </Button>
        </Space>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={sortedCategories}
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
        onRow={(record) => ({
          draggable: true,
          onDragStart: () => {
            setDraggedId(record.id);
          },
          onDragOver: (event) => {
            event.preventDefault();
          },
          onDrop: () => {
            if (draggedId) {
              moveCategory(draggedId, record.id);
            }
            setDraggedId(null);
          },
          onDragEnd: () => {
            setDraggedId(null);
          },
          style: {
            cursor: 'move',
          },
        })}
      />

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingCategory(null);
          form.resetFields();
        }}
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
            <Input placeholder="Example: General" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={3}
              maxLength={140}
              showCount
              placeholder="Example: Test your overall knowledge."
            />
          </Form.Item>

          <Form.Item label="Icon" name="icon">
            <Input placeholder="Example: 📚" maxLength={4} />
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
