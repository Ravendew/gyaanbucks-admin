import { Button, Card, Form, InputNumber, message, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api/api';

const { Title, Text } = Typography;

type RedeemSetting = {
  id: string;
  minimumPoints: number;
  allowedDayOfMonth: number;
};

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form] = Form.useForm<{
    minimumPoints: number;
    allowedDayOfMonth: number;
  }>();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get<RedeemSetting>('/redeem-setting');

      form.setFieldsValue({
        minimumPoints: res.data.minimumPoints,
        allowedDayOfMonth: res.data.allowedDayOfMonth,
      });
    } catch {
      message.error('Failed to load redeem settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: {
    minimumPoints: number;
    allowedDayOfMonth: number;
  }) => {
    try {
      setSaving(true);

      await api.patch('/redeem-setting', {
        minimumPoints: Number(values.minimumPoints),
        allowedDayOfMonth: Number(values.allowedDayOfMonth),
      });

      message.success('Redeem settings updated');
      fetchSettings();
    } catch {
      message.error('Failed to update redeem settings');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div>
      <Title level={2} style={{ marginBottom: 6 }}>
        Settings
      </Title>

      <Text type="secondary">
        Manage redeem rules used by frontend and backend validation.
      </Text>

      <Card
        loading={loading}
        style={{
          marginTop: 24,
          maxWidth: 620,
          borderRadius: 18,
          boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Title level={4} style={{ marginTop: 0 }}>
          Redeem Settings
        </Title>

        <Text type="secondary">
          These values control when users can request redeem and the minimum
          points required.
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Minimum Redeem Points"
            name="minimumPoints"
            rules={[
              {
                required: true,
                message: 'Please enter minimum redeem points',
              },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Example: 5000"
            />
          </Form.Item>

          <Form.Item
            label="Allowed Redeem Day of Month"
            name="allowedDayOfMonth"
            rules={[
              {
                required: true,
                message: 'Please enter redeem day',
              },
              {
                type: 'number',
                min: 1,
                max: 31,
                message: 'Day must be between 1 and 31',
              },
            ]}
          >
            <InputNumber
              min={1}
              max={31}
              style={{ width: '100%' }}
              placeholder="Example: 5"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            style={{
              height: 42,
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            Save Settings
          </Button>
        </Form>
      </Card>
    </div>
  );
}
