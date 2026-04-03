import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Button, message, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getAllVoucher, searchVoucher } from '../../../services/VoucherService';

const VoucherSelectModal = ({ visible, onCancel, onSelect, minAmount = 0 }) => {
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (visible) {
            fetchVouchers();
        }
    }, [visible]);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const data = await getAllVoucher();
            setVouchers(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            message.error("Lỗi tải danh sách mã giảm giá");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await searchVoucher(searchText);
            setVouchers(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            message.error("Lỗi tìm kiếm mã giảm giá");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'STT', key: 'stt', render: (t, r, idx) => idx + 1, width: 60 },
        { title: 'Tên mã', dataIndex: 'tenma', key: 'tenma' },
        { 
            title: 'Đơn tối thiểu', 
            dataIndex: 'giatritoithieu', 
            key: 'giatritoithieu',
            render: (val) => `${val?.toLocaleString('vi-VN')}₫`,
        },
        { 
            title: 'Giá trị giảm', 
            dataIndex: 'giatrigiam', 
            key: 'giatrigiam',
            render: (val) => `${val?.toLocaleString('vi-VN')}₫`,
        },
        { title: 'Ngày bắt đầu', dataIndex: 'ngaybatdau', key: 'ngaybatdau', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
        { title: 'Ngày kết thúc', dataIndex: 'ngayketthuc', key: 'ngayketthuc', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    size="small" 
                    onClick={() => onSelect(record)}
                    disabled={minAmount < record.giatritoithieu}
                >
                    Chọn
                </Button>
            ),
        }
    ];

    return (
        <Modal
            title="Chọn mã giảm giá"
            open={visible}
            onCancel={onCancel}
            width={900}
            footer={null}
        >
            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Tìm theo tên mã..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: 'pointer' }} />}
                />
            </div>
            <Table
                dataSource={vouchers}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 6 }}
            />
        </Modal>
    );
};

export default VoucherSelectModal;
