import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Select, Tag, Space, Button, message, Image } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getAllSach, searchSach } from '../../../services/SachService';
import { getAllTheLoai } from '../../../services/TheLoaiService';

const { Option } = Select;

const ProductSelectModal = ({ visible, onCancel, onSelect }) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (visible) {
            fetchProducts();
            fetchCategories();
        }
    }, [visible]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getAllSach();
            const list = Array.isArray(data) ? data : (data.data || []);
            const sortedList = list
                .filter(p => p.trangThai === true)
                .sort((a, b) => new Date(b.ngayCapNhat) - new Date(a.ngayCapNhat));
            setProducts(sortedList);
        } catch (error) {
            message.error("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getAllTheLoai();
            setCategories(Array.isArray(data) ? data : (data.data || []));
        } catch (error) {
            console.error("Lỗi tải thể loại:", error);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await searchSach(searchText);
            const list = Array.isArray(data) ? data : (data.data || []);
            const filteredAndSortedList = list
                .filter(p => p.trangThai === true)
                .sort((a, b) => new Date(b.ngayCapNhat) - new Date(a.ngayCapNhat));
            setProducts(filteredAndSortedList);
        } catch (error) {
            message.error("Lỗi tìm kiếm sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            render: (text, record, index) => index + 1,
            width: 60,
        },
        {
            title: 'Ảnh',
            dataIndex: 'duongDanAnh',
            key: 'duongDanAnh',
            render: (url) => (
                <Image
                    src={url}
                    alt="book"
                    width={40}
                    height={50}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                    fallback="https://via.placeholder.com/40x50?text=No+Img"
                />
            ),
            width: 80,
        },
        {
            title: 'Tên sách',
            dataIndex: 'tenSach',
            key: 'tenSach',
        },
        {
            title: 'Giá bán',
            dataIndex: 'giaBan',
            key: 'giaBan',
            render: (val) => `${Number(val)?.toLocaleString('vi-VN')}₫`,
        },
        {
            title: 'Số lượng',
            dataIndex: 'soLuong',
            key: 'soLuong',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            key: 'trangThai',
            render: (status) => (
                <Tag color={status ? 'green' : 'red'}>
                    {status ? 'Kinh doanh' : 'Ngừng kinh doanh'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => onSelect(record)}
                    disabled={record.soLuong <= 0}
                >
                    Chọn
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title="Danh sách sản phẩm"
            open={visible}
            onCancel={onCancel}
            width={1000}
            footer={null}
        >
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Tìm theo tên, mã vạch..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ width: 250 }}
                    suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: 'pointer' }} />}
                />
                <Select
                    placeholder="Thể loại"
                    style={{ width: 150 }}
                    allowClear
                    onChange={val => setSelectedCategory(val)}
                >
                    {categories.map(c => (
                        <Option key={c.id} value={c.id}>{c.tenTheLoai}</Option>
                    ))}
                </Select>
                <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
            </Space>

            <Table
                dataSource={products}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 5 }}
            />
        </Modal>
    );
};

export default ProductSelectModal;
