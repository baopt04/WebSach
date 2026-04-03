import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Button, message, Space } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { getAllTaiKhoan, searchTaiKhoan } from '../../../services/AccountService';
import QuickAddCustomerModal from './QuickAddCustomerModal';

const CustomerSelectModal = ({ visible, onCancel, onSelect }) => {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchCustomers();
        }
    }, [visible]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await getAllTaiKhoan();
            // Assuming data is an array or has a property containing the array
            setCustomers(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            message.error("Lỗi tải danh sách khách hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await searchTaiKhoan(searchText);
            setCustomers(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            message.error("Lỗi tìm kiếm khách hàng");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'STT', key: 'stt', render: (t, r, idx) => idx + 1, width: 60 },
        { title: 'Tên khách hàng', dataIndex: 'hoten', key: 'hoten' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'SĐT', dataIndex: 'sodienthoai', key: 'sodienthoai' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button type="primary" size="small" onClick={() => onSelect(record)}>Chọn</Button>
            ),
        }
    ];

    return (
        <>
            <Modal
                title="Chọn khách hàng"
                open={visible}
                onCancel={onCancel}
                width={800}
                footer={[
                    <Button key="cancel" onClick={onCancel}>Hủy</Button>,
                    <Button 
                        key="quickAdd" 
                        type="primary" 
                        icon={<UserAddOutlined />} 
                        onClick={() => setIsQuickAddOpen(true)}
                    >
                        Thêm nhanh khách hàng
                    </Button>
                ]}
            >
                <div style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="Tìm theo tên, SĐT, Email..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: 'pointer' }} />}
                    />
                </div>
                <Table
                    dataSource={customers}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 6 }}
                />
            </Modal>

            <QuickAddCustomerModal
                visible={isQuickAddOpen}
                onCancel={() => setIsQuickAddOpen(false)}
                onSuccess={() => {
                    setIsQuickAddOpen(false);
                    fetchCustomers();
                }}
            />
        </>
    );
};

export default CustomerSelectModal;
