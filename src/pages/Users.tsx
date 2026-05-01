import { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const API_BASE = 'http://localhost:5000';

type UserRow = {
  id: string;
  name: string;
  mobile: string;
  countryCode: string;
  email: string | null;
  wallet: number;
  isActive: boolean;
  createdAt: string;
};

export default function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();

      if (!res.ok) {
        message.error(data.message || 'Failed to load users');
        return;
      }

      setUsers(data);
    } catch {
      message.error('Something went wrong while loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: ColumnsType<UserRow> = [
    {
      title: 'User',
      render: (_, record) => (
        <>
          <strong>{record.name}</strong>
          <div style={{ color: '#6B7280', fontSize: 13 }}>
            {record.email || 'No email'}
          </div>
        </>
      ),
    },
    {
      title: 'Mobile',
      render: (_, record) => `${record.countryCode || '+91'} ${record.mobile}`,
    },
    {
      title: 'Wallet Points',
      dataIndex: 'wallet',
      render: (value) => <strong>{value}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      render: (value) =>
        value ? (
          <Tag color="green">ACTIVE</Tag>
        ) : (
          <Tag color="red">INACTIVE</Tag>
        ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      render: (value) => new Date(value).toLocaleString(),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 20 }}>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Users
      </Typography.Title>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
      />
    </Card>
  );
}
