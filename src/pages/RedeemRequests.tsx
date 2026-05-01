import { useEffect, useState } from 'react';
import { Button, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const API_BASE = 'https://gyaanbucks-backend-production.up.railway.app';

type RedeemRequest = {
  id: string;
  points: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    name: string;
    mobile: string;
  };
};

export default function RedeemRequests() {
  const [data, setData] = useState<RedeemRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/redeem`);
      const json = await res.json();
      setData(json);
    } catch {
      message.error('Failed to load redeem requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${API_BASE}/redeem/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();

      if (!res.ok) {
        message.error(json.message || 'Action failed');
        return;
      }

      message.success(json.message);
      fetchData();
    } catch {
      message.error('Something went wrong');
    }
  };

  const columns: ColumnsType<RedeemRequest> = [
    {
      title: 'User',
      render: (_, record) => (
        <>
          <strong>{record.user.name}</strong>
          <div>{record.user.mobile}</div>
        </>
      ),
    },
    {
      title: 'Points',
      dataIndex: 'points',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (val) => `₹${val}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        if (status === 'PENDING') return <Tag color="orange">PENDING</Tag>;
        if (status === 'APPROVED') return <Tag color="green">APPROVED</Tag>;
        return <Tag color="red">REJECTED</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      title: 'Action',
      render: (_, record) =>
        record.status === 'PENDING' && (
          <>
            <Button
              type="primary"
              size="small"
              onClick={() => updateStatus(record.id, 'APPROVED')}
              style={{ marginRight: 8 }}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              onClick={() => updateStatus(record.id, 'REJECTED')}
            >
              Reject
            </Button>
          </>
        ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Redeem Requests</h2>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
      />
    </div>
  );
}
