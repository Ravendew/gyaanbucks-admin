import { Card, Col, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';

const API_BASE = 'https://gyaanbucks-backend-production.up.railway.app';

type Stats = {
  totalQuizzes: number;
  activeQuizzes: number;
  totalUsers: number;
  totalPoints: number;
  pendingRedeems: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalUsers: 0,
    totalPoints: 0,
    pendingRedeems: 0,
  });

  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <>
      <div style={{ marginBottom: 22 }}>
        <Typography.Title level={3} style={{ margin: 0, fontWeight: 950 }}>
          Dashboard
        </Typography.Title>
        <Typography.Text style={{ color: '#6B7280', fontWeight: 700 }}>
          Manage quizzes, rewards, users, and platform activity.
        </Typography.Text>
      </div>

      <Row gutter={[18, 18]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 20 }} loading={loading}>
            <Typography.Text style={{ color: '#6B7280', fontWeight: 800 }}>
              Total Quizzes
            </Typography.Text>
            <Typography.Title
              level={2}
              style={{ margin: '8px 0 0', color: '#065F46' }}
            >
              {stats.totalQuizzes}
            </Typography.Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 20 }} loading={loading}>
            <Typography.Text style={{ color: '#6B7280', fontWeight: 800 }}>
              Active Quizzes
            </Typography.Text>
            <Typography.Title
              level={2}
              style={{ margin: '8px 0 0', color: '#16A34A' }}
            >
              {stats.activeQuizzes}
            </Typography.Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 20 }} loading={loading}>
            <Typography.Text style={{ color: '#6B7280', fontWeight: 800 }}>
              Total Users
            </Typography.Text>
            <Typography.Title
              level={2}
              style={{ margin: '8px 0 0', color: '#D4AF37' }}
            >
              {stats.totalUsers}
            </Typography.Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 20 }} loading={loading}>
            <Typography.Text style={{ color: '#6B7280', fontWeight: 800 }}>
              Reward Points
            </Typography.Text>
            <Typography.Title
              level={2}
              style={{ margin: '8px 0 0', color: '#F8C52C' }}
            >
              {stats.totalPoints}
            </Typography.Title>
          </Card>
        </Col>
      </Row>
    </>
  );
}
