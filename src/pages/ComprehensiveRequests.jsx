import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Space, Tag, Spin, message } from 'antd';
import { PlusOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function ComprehensiveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedRequest, setSelectedRequest] = useState(null);

  const API_BASE = process.env.VITE_API_BASE || 'http://localhost:8080';

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/api/v1/client/comprehensive-requests?page=1&limit=20`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      setRequests(response.data.data || []);
    } catch (error) {
      message.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (values) => {
    try {
      await axios.post(
        `${API_BASE}/api/v1/client/comprehensive-requests`,
        {
          company_cin: values.companyCin,
          company_name: values.companyName,
          company_type: values.companyType,
          request_notes: values.requestNotes
        },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      message.success('Request created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchRequests();
    } catch (error) {
      message.error('Failed to create request');
    }
  };

  const handleViewRequest = async (requestId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/v1/client/comprehensive-requests/${requestId}/response`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      setSelectedRequest(response.data);
    } catch (error) {
      message.error('Failed to fetch details');
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
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    { title: 'Responses', dataIndex: 'responseCount', key: 'responseCount' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleViewRequest(record.requestId)}>View</Button>
      )
    }
  ];

  return (
    <Card title="Comprehensive Requests" style={{ marginTop: 20 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>Create</Button>
        <Button icon={<ReloadOutlined />} onClick={fetchRequests} loading={loading}>Refresh</Button>
      </Space>

      <Spin spinning={loading}>
        <Table columns={columns} dataSource={requests} rowKey="requestId" pagination={{ pageSize: 20 }} />
      </Spin>

      <Modal title="Create Request" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleCreateRequest} layout="vertical">
          <Form.Item label="Company CIN" name="companyCin" rules={[
            { required: true, message: 'CIN required' },
            { pattern: /^[A-Z0-9]{21}$/, message: 'Invalid CIN' }
          ]}>
            <input placeholder="e.g., U15549PN1992FTC065522" />
          </Form.Item>
          <Form.Item label="Company Name" name="companyName" rules={[{ required: true }]}>
            <input />
          </Form.Item>
          <Form.Item label="Company Type" name="companyType">
            <select defaultValue="Company">
              <option value="Company">Company</option>
              <option value="Partnership">Partnership</option>
            </select>
          </Form.Item>
          <Form.Item label="Notes" name="requestNotes">
            <textarea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Details" open={!!selectedRequest} onCancel={() => setSelectedRequest(null)} footer={null}>
        {selectedRequest && (
          <div>
            <p><strong>Status:</strong> {selectedRequest.isSuccess ? '✓ Success' : '✗ Failed'}</p>
            <p><strong>HTTP Code:</strong> {selectedRequest.httpStatusCode}</p>
            <p><strong>Response Time:</strong> {selectedRequest.responseTimeMs}ms</p>
            <pre style={{ background: '#f5f5f5', padding: 12 }}>
              {JSON.stringify(selectedRequest.responsePayload, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </Card>
  );
}