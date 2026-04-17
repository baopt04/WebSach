import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Button, message, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getValidVouchers, searchVoucher } from '../../../services/VoucherService';

const VoucherSelectModal = ({ visible, onCancel, onSelect, minAmount = 0 }) => {
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (visible) {
            fetchVouchers();
        }
    }, [visible, minAmount]);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const data = await getValidVouchers(minAmount);
            setVouchers(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            message.error("Lỗi tải danh sách mã giảm giá hợp lệ");
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
        { title: 'Mã', dataIndex: 'maVoucher', key: 'maVoucher' },
        { title: 'Tên khuyến mãi', dataIndex: 'tenMaGiamGia', key: 'tenMaGiamGia' },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'tienToiThieu',
            key: 'tienToiThieu',
            render: (val) => `${val?.toLocaleString('vi-VN')}₫`,
        },
        {
            title: 'Giá trị giảm',
            dataIndex: 'giaTriGiam',
            key: 'giaTriGiam',
            render: (val) => val <= 100 ? `${val}%` : `${val?.toLocaleString('vi-VN')}₫`,
        },
        {
            title: "Số lượng sử dụng",
            dataIndex: "soLuong",
            key: "soLuong",
            render: (val) => <Tag color="blue">{val}</Tag>
        },
        {
            title: 'Hạn dùng',
            dataIndex: 'ngayKetThuc',
            key: 'ngayKetThuc',
            render: (d) => d ? new Date(d).toLocaleDateString('vi-VN') : 'Không thời hạn'
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => onSelect(record)}
                    disabled={minAmount < record.tienToiThieu}
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
