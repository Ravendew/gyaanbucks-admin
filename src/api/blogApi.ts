import api from './api';

export type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string | null;
  category: string;
  tags?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BlogPayload = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  category: string;
  tags?: string;
  metaTitle?: string;
  metaDesc?: string;
  isPublished: boolean;
};

export async function getBlogs() {
  const res = await api.get<Blog[]>('/blog');
  return res.data;
}

export async function createBlog(payload: BlogPayload) {
  const res = await api.post<Blog>('/blog', payload);
  return res.data;
}

export async function updateBlog(id: string, payload: BlogPayload) {
  const res = await api.patch<Blog>(`/blog/${id}`, payload);
  return res.data;
}

export async function deleteBlog(id: string) {
  const res = await api.delete<Blog>(`/blog/${id}`);
  return res.data;
}
