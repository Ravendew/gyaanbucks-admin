import {
  Button,
  Card,
  Form,
  Grid,
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

const { useBreakpoint } = Grid;

export default function Categories() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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

  const pagedMobileCategories = sortedCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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
        <div style={{ minWidth: 220 }}>
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
      return (
        <Typography.Text type="secondary">
          Loading categories...
        </Typography.Text>
      );
    }

    if (sortedCategories.length === 0) {
      return (
        <Typography.Text type="secondary">No categories found.</Typography.Text>
      );
    }

    return (
      <Space direction="vertical" size={14} style={{ width: '100%' }}>
        {pagedMobileCategories.map((category, index) => {
          const realIndex = (currentPage - 1) * pageSize + index + 1;

          return (
            <Card
              key={category.id}
              style={{
                borderRadius: 18,
                boxShadow: '0 12px 34px rgba(6, 95, 70, 0.08)',
              }}
              styles={{ body: { padding: 16 } }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Space align="start" style={{ width: '100%' }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 14,
                      background: '#ECFDF5',
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {category.icon || '📚'}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Typography.Text type="secondary">
                      #{realIndex}
                    </Typography.Text>
                    <br />
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      {category.name}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary">
                      {category.description || 'No description added'}
                    </Typography.Text>
                  </div>
                </Space>

                <Space wrap>
                  {category.isActive ? (
                    <Typography.Text type="success">Active</Typography.Text>
                  ) : (
                    <Typography.Text type="danger">Inactive</Typography.Text>
                  )}

                  <Typography.Text type="secondary">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </Typography.Text>
                </Space>

                <Space wrap>
                  <Button size="small" onClick={() => moveToTop(category)}>
                    Top
                  </Button>
                  <Button size="small" onClick={() => moveUp(category)}>
                    Up
                  </Button>
                  <Button size="small" onClick={() => moveDown(category)}>
                    Down
                  </Button>
                </Space>

                <Space wrap>
                  <Button onClick={() => openEditModal(category)}>Edit</Button>

                  <Popconfirm
                    title="Delete category?"
                    description="This will remove this category."
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDelete(category.id)}
                  >
                    <Button danger>Delete</Button>
                  </Popconfirm>
                </Space>
              </Space>
            </Card>
          );
        })}

        {sortedCategories.length > pageSize && (
          <Space wrap style={{ justifyContent: 'center', width: '100%' }}>
            <Button
              disabled={currentPage <= 1}
              onClick={() => {
                const page = currentPage - 1;
                setCurrentPage(page);
                localStorage.setItem(PAGE_KEY, String(page));
              }}
            >
              Previous
            </Button>

            <Typography.Text strong>
              Page {currentPage} of{' '}
              {Math.ceil(sortedCategories.length / pageSize)}
            </Typography.Text>

            <Button
              disabled={
                currentPage >= Math.ceil(sortedCategories.length / pageSize)
              }
              onClick={() => {
                const page = currentPage + 1;
                setCurrentPage(page);
                localStorage.setItem(PAGE_KEY, String(page));
              }}
            >
              Next
            </Button>
          </Space>
        )}
      </Space>
    );
  };

  return (
    <Card
      style={{
        borderRadius: isMobile ? 18 : 24,
      }}
      styles={{
        body: {
          padding: isMobile ? 16 : 24,
        },
      }}
    >
      <Space
        direction={isMobile ? 'vertical' : 'horizontal'}
        style={{
          width: '100%',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <Typography.Title
            level={3}
            style={{ margin: 0, fontSize: isMobile ? 24 : 26 }}
          >
            Categories
          </Typography.Title>
          <Typography.Text type="secondary">
            Drag rows on desktop, or use Top/Up/Down, then save order.
          </Typography.Text>
        </div>

        <Space
          direction={isMobile ? 'vertical' : 'horizontal'}
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          <Button
            onClick={handleSaveOrder}
            loading={savingOrder}
            block={isMobile}
          >
            Save Order
          </Button>

          <Button type="primary" onClick={openAddModal} block={isMobile}>
            Add Category
          </Button>
        </Space>
      </Space>

      {isMobile ? (
        renderMobileCards()
      ) : (
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={sortedCategories}
          scroll={{ x: 1150 }}
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
      )}

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
        width={isMobile ? 'calc(100vw - 24px)' : 520}
        centered
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
              placeholder="Example: Practice useful questions and improve your knowledge."
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
