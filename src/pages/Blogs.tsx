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
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useEffect, useMemo, useState } from 'react';
import {
  createBlog,
  deleteBlog,
  getBlogs,
  updateBlog,
  type Blog,
  type BlogPayload,
} from '../api/blogApi';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://gyaanbucks-backend-production.up.railway.app';

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

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'blockquote'],
    ['clean'],
  ],
};

const editorFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'list',
  'link',
  'blockquote',
];

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
    void loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const openCreate = () => {
    setEditingBlog(null);
    setPreviewImage('');
    form.resetFields();

    form.setFieldsValue({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      category: '',
      tags: '',
      metaTitle: '',
      metaDesc: '',
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

      form.setFieldsValue({ imageUrl: uploadedUrl });
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

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
    const currentSlug = form.getFieldValue('slug');

    if (!editingBlog && !currentSlug) {
      form.setFieldsValue({ slug: makeSlug(title) });
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const cleanContent = values.content
        ?.replace(/<p><br><\/p>/g, '')
        .replace(/<p><\/p>/g, '')
        .trim();

      if (!cleanContent) {
        message.error('Please add blog content');
        return;
      }

      const payload: BlogPayload = {
        ...values,
        slug: values.slug?.trim() || makeSlug(values.title),
        content: cleanContent,
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
              cancelText="Cancel"
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
      <style>
        {`
          .blog-editor-box .ql-toolbar {
            position: sticky;
            top: 0;
            z-index: 10;
            background: #ffffff;
            border-radius: 6px 6px 0 0;
          }

          .blog-editor-box .ql-container {
            height: 560px;
            background: #ffffff;
            border-radius: 0 0 6px 6px;
          }

          .blog-editor-box .ql-editor {
            min-height: 560px;
            font-size: 15px;
            line-height: 1.7;
          }
        `}
      </style>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={blogs}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBlog ? 'Edit Blog' : 'Add Blog'}
        open={modalOpen}
        width={1000}
        onCancel={() => {
          setModalOpen(false);
          setPreviewImage('');
          form.resetFields();
        }}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingBlog ? 'Update Blog' : 'Create Blog'}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark
          initialValues={{ isPublished: true }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter blog title' }]}
          >
            <Input
              placeholder="Blog title"
              onChange={handleTitleChange}
              maxLength={120}
            />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Please enter blog slug' }]}
          >
            <Input placeholder="example-blog-slug" />
          </Form.Item>

          <Form.Item
            label="Excerpt"
            name="excerpt"
            rules={[{ required: true, message: 'Please enter short excerpt' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Short blog summary for cards and SEO"
              maxLength={300}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Content"
            name="content"
            rules={[{ required: true, message: 'Please add blog content' }]}
          >
            <ReactQuill
              className="blog-editor-box"
              theme="snow"
              modules={editorModules}
              formats={editorFormats}
              placeholder="Write your full blog content here..."
            />
          </Form.Item>

          <Form.Item label="Featured Image" name="imageUrl">
            <Input placeholder="Image URL will appear here after upload" />
          </Form.Item>

          <Upload
            name="file"
            action={`${API_BASE_URL}/upload`}
            showUploadList={false}
            accept="image/*"
            onChange={handleUploadChange}
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              Upload Blog Image
            </Button>
          </Upload>

          {previewImage && (
            <div style={{ marginTop: 16 }}>
              <Image
                src={previewImage}
                alt="Preview"
                width={220}
                height={130}
                style={{ objectFit: 'cover', borderRadius: 12 }}
              />
            </div>
          )}

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please enter category' }]}
            style={{ marginTop: 18 }}
          >
            <Input placeholder="Example: Education" />
          </Form.Item>

          <Form.Item label="Tags" name="tags">
            <Input placeholder="general knowledge, GK tips, quiz learning" />
          </Form.Item>

          <Form.Item label="Meta Title" name="metaTitle">
            <Input placeholder="SEO title" maxLength={70} showCount />
          </Form.Item>

          <Form.Item label="Meta Description" name="metaDesc">
            <Input.TextArea
              rows={3}
              placeholder="SEO meta description"
              maxLength={160}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Published"
            name="isPublished"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
