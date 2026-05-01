import {
  Button,
  Card,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Upload,
} from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import {
  createBlog,
  deleteBlog,
  getBlogs,
  updateBlog,
  type Blog,
  type BlogPayload,
} from '../api/blogApi';

function makeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type UploadResponse = {
  filename: string;
  url: string;
};

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const [form] = Form.useForm<BlogPayload>();

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const data = await getBlogs();
      setBlogs(data);
    } catch {
      message.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const openCreate = () => {
    setEditingBlog(null);
    setPreviewImage('');
    form.resetFields();
    form.setFieldsValue({
      imageUrl: '',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setPreviewImage(blog.imageUrl || '');

    form.setFieldsValue({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      imageUrl: blog.imageUrl || '',
      category: blog.category,
      tags: blog.tags || '',
      metaTitle: blog.metaTitle || '',
      metaDesc: blog.metaDesc || '',
      isPublished: blog.isPublished,
    });

    setModalOpen(true);
  };

  const handleUploadChange = (
    info: UploadChangeParam<UploadFile<UploadResponse>>,
  ) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }

    if (info.file.status === 'done') {
      const uploadedUrl = info.file.response?.url;

      if (!uploadedUrl) {
        setUploading(false);
        message.error('Image upload completed but URL missing');
        return;
      }

      form.setFieldsValue({
        imageUrl: uploadedUrl,
      });

      setPreviewImage(uploadedUrl);
      setUploading(false);
      message.success('Image uploaded successfully');
      return;
    }

    if (info.file.status === 'error') {
      setUploading(false);
      message.error('Image upload failed');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload: BlogPayload = {
        ...values,
        slug: values.slug?.trim() || makeSlug(values.title),
        imageUrl: values.imageUrl || '',
        tags: values.tags || '',
        metaTitle: values.metaTitle || values.title,
        metaDesc: values.metaDesc || values.excerpt,
        isPublished: values.isPublished ?? true,
      };

      setSaving(true);

      if (editingBlog) {
        await updateBlog(editingBlog.id, payload);
        message.success('Blog updated successfully');
      } else {
        await createBlog(payload);
        message.success('Blog created successfully');
      }

      setModalOpen(false);
      setPreviewImage('');
      form.resetFields();
      await loadBlogs();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBlog(id);
      message.success('Blog deleted successfully');
      await loadBlogs();
    } catch {
      message.error('Failed to delete blog');
    }
  };

  const columns: ColumnsType<Blog> = useMemo(
    () => [
      {
        title: 'Image',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        width: 100,
        render: (value: string | null) =>
          value ? (
            <Image
              src={value}
              alt="Blog"
              width={64}
              height={44}
              style={{ objectFit: 'cover', borderRadius: 10 }}
            />
          ) : (
            <Tag>No Image</Tag>
          ),
      },
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (_, record) => (
          <div>
            <strong>{record.title}</strong>
            <div style={{ color: '#6b7280', fontSize: 12 }}>
              /blog/{record.slug}
            </div>
          </div>
        ),
      },
      {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        render: (value) => <Tag color="green">{value}</Tag>,
      },
      {
        title: 'Published',
        dataIndex: 'isPublished',
        key: 'isPublished',
        render: (value) =>
          value ? <Tag color="success">Published</Tag> : <Tag>Draft</Tag>,
      },
      {
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value) => new Date(value).toLocaleDateString(),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => openEdit(record)}>
              Edit
            </Button>

            <Popconfirm
              title="Delete blog?"
              description="This action cannot be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <Card
      title="Blogs"
      extra={
        <Button type="primary" onClick={openCreate}>
          Add Blog
        </Button>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={blogs}
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editingBlog ? 'Edit Blog' : 'Add Blog'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setPreviewImage('');
        }}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingBlog ? 'Update Blog' : 'Create Blog'}
        width={900}
        destroyOnHidden
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Blog Title"
            name="title"
            rules={[{ required: true, message: 'Please enter blog title' }]}
          >
            <Input placeholder="Example: How to earn points from quizzes" />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="Auto generated if empty" />
          </Form.Item>

          <Form.Item
            label="Excerpt"
            name="excerpt"
            rules={[{ required: true, message: 'Please enter short excerpt' }]}
          >
            <Input.TextArea rows={3} placeholder="Short SEO-friendly summary" />
          </Form.Item>

          <Form.Item
            label="Content"
            name="content"
            rules={[{ required: true, message: 'Please enter blog content' }]}
            extra="Markdown supported: use [link text](https://example.com), ## Heading, bullet lists, and paragraphs."
          >
            <Input.TextArea rows={10} placeholder="Full blog content" />
          </Form.Item>

          <Form.Item label="Blog Image">
            <Space direction="vertical" size={12}>
              <Upload
                name="file"
                action="http://localhost:5000/upload/image"
                showUploadList={false}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleUploadChange}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Upload Image
                </Button>
              </Upload>

              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Blog preview"
                  width={180}
                  height={100}
                  style={{ objectFit: 'cover', borderRadius: 12 }}
                />
              ) : null}
            </Space>
          </Form.Item>

          <Form.Item name="imageUrl" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please enter category' }]}
          >
            <Input placeholder="Example: Quiz Rewards" />
          </Form.Item>

          <Form.Item label="Tags" name="tags">
            <Input placeholder="quiz, rewards, earning, learning" />
          </Form.Item>

          <Form.Item label="Meta Title" name="metaTitle">
            <Input placeholder="SEO title. If empty, blog title will be used." />
          </Form.Item>

          <Form.Item label="Meta Description" name="metaDesc">
            <Input.TextArea
              rows={3}
              placeholder="SEO description. If empty, excerpt will be used."
            />
          </Form.Item>

          <Form.Item label="Publish" name="isPublished" valuePropName="checked">
            <Switch checkedChildren="Published" unCheckedChildren="Draft" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
