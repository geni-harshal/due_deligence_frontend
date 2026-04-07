import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Space, Tag, Spin, message, Tabs } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function OperationsRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [refreshModalVisible, setRefreshModalVisible] = useState(false);
  const [form] = Form.useForm();

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/api/v1/operations/comprehensive-requests?page=1&limit=20`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      setRequests(response.data.data || []);
    } catch (error) {
      message.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async (requestId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/v1/operations/comprehensive-requests/${requestId}/audit`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      setAuditLogs(response.data || []);
    } catch (error) {
      message.error('Failed to fetch audit logs');
    }
  };

  const handleRefreshRequest = async (values) => {
    try {
      await axios.post(
        `${API_BASE}/api/v1/operations/comprehensive-requests/${selectedRequest.requestId}/refresh`,
        { refresh_reason: values.refreshReason, priority: values.priority },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      message.success('Request refreshed');
      setRefreshModalVisible(false);
      fetchRequests();
    } catch (error) {
      message.error('Failed to refresh');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const columns = [
    { title: 'Company CIN', dataIndex: 'companyCin', key: 'companyCin' },
    { title: 'Company Name', dataIndex: 'companyName', key: 'companyName' },
    {
      title: 'Status',
      dataIndex: 'requestStatus',
      key: 'requestStatus',
      render: (status) => {
        const colors = { PENDING: 'blue', FETCHING: 'processing', FETCHED: 'success', FAILED: 'error' };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    { title: 'Client', dataIndex: 'createdByEmail', key: 'createdByEmail' },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => {
            setSelectedRequest(record);
            fetchAuditLogs(record.requestId);
          }}>Details</Button>
          <Button size="small" onClick={() => {
            setSelectedRequest(record);
            setRefreshModalVisible(true);
          }}>Refresh</Button>
        </Space>
      )
    }
  ];

  return (
    <Card title="Operations Dashboard" style={{ marginTop: 20 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={fetchRequests} loading={loading}>Refresh</Button>
      </Space>

      <Spin spinning={loading}>
        <Table columns={columns} dataSource={requests} rowKey="requestId" pagination={{ pageSize: 20 }} />
      </Spin>

      <Modal title="Details & Audit" open={!!selectedRequest} onCancel={() => setSelectedRequest(null)} width={900} footer={null}>
        {selectedRequest && (
          <Tabs>
            <Tabs.TabPane tab="Details" key="details">
              <p><strong>Request ID:</strong> {selectedRequest.requestId}</p>
              <p><strong>Company CIN:</strong> {selectedRequest.companyCin}</p>
              <p><strong>Status:</strong> {selectedRequest.requestStatus}</p>
              <p><strong>Created By:</strong> {selectedRequest.createdByEmail}</p>
              <p><strong>Response Count:</strong> {selectedRequest.responseCount}</p>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Audit Logs" key="audit">
              <Table columns={[
                { title: 'Action', dataIndex: 'auditAction', key: 'auditAction' },
                { title: 'Actor', dataIndex: 'actorEmail', key: 'actorEmail' },
                { title: 'Role', dataIndex: 'actorRole', key: 'actorRole' },
                {
                  title: 'Timestamp',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: (date) => new Date(date).toLocaleString()
                }
              ]} dataSource={auditLogs} pagination={false} size="small" />
            </Tabs.TabPane>
          </Tabs>
        )}
      </Modal>

      <Modal title="Refresh Request" open={refreshModalVisible} onCancel={() => setRefreshModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleRefreshRequest} layout="vertical">
          <Form.Item label="Reason" name="refreshReason" rules={[{ required: true }]}>
            <textarea rows={4} />
          </Form.Item>
          <Form.Item label="Priority" name="priority" initialValue="NORMAL">
            <select>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}