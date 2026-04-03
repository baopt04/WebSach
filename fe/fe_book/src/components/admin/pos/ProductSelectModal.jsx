// import React, { useState, useEffect } from 'react';
// import { Modal, Table, Input, Select, Tag, Space, Button, message } from 'antd';
// import { SearchOutlined } from '@ant-design/icons';
// import SachService from '../../../services/SachService';
// import TheLoaiService from '../../../services/TheLoaiService';

// const { Option } = Select;

// const ProductSelectModal = ({ visible, onCancel, onSelect }) => {
//     const [loading, setLoading] = useState(false);
//     const [products, setProducts] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [searchText, setSearchText] = useState('');
//     const [selectedCategory, setSelectedCategory] = useState(null);

//     useEffect(() => {
//         if (visible) {
//             fetchProducts();
//             fetchCategories();
//         }
//     }, [visible]);

//     const fetchProducts = async () => {
//         setLoading(true);
//         try {
//             const res = await SachService.getAll();
//             setProducts(res.data || []);
//         } catch (error) {
//             message.error("Không thể tải danh sách sản phẩm");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchCategories = async () => {
//         try {
//             const res = await TheLoaiService.getAll();
//             setCategories(res.data || []);
//         } catch (error) {
//             console.error("Lỗi tải thể loại:", error);
//         }
//     };

//     const handleSearch = async () => {
//         setLoading(true);
//         try {
//             const res = await SachService.search(searchText);
//             setProducts(res.data || []);
//         } catch (error) {
//             message.error("Lỗi tìm kiếm sản phẩm");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const columns = [
//         {
//             title: 'STT',
//             key: 'stt',
//             render: (text, record, index) => index + 1,
//             width: 60,
//         },
//         {
//             title: 'Ảnh',
//             dataIndex: 'hinhanh',
//             key: 'hinhanh',
//             render: (url) => <img src={url} alt="book" style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 4 }} />,
//             width: 80,
//         },
//         {
//             title: 'Tên sách',
//             dataIndex: 'tensach',
//             key: 'tensach',
//         },
//         {
//             title: 'Giá',
//             dataIndex: 'gia',
//             key: 'gia',
//             render: (val) => `${val?.toLocaleString('vi-VN')}₫`,
//         },
//         {
//             title: 'Số lượng tồn',
//             dataIndex: 'soluong',
//             key: 'soluong',
//         },
//         {
//             title: 'Trạng thái',
//             dataIndex: 'trangthai',
//             key: 'trangthai',
//             render: (status) => (
//                 <Tag color={status === 'HOAT_DONG' ? 'green' : 'red'}>
//                     {status === 'HOAT_DONG' ? 'Kinh doanh' : 'Ngừng kinh doanh'}
//                 </Tag>
//             ),
//         },
//         {
//             title: 'Hành động',
//             key: 'action',
//             render: (_, record) => (
//                 <Button 
//                     type="primary" 
//                     size="small" 
//                     onClick={() => onSelect(record)}
//                     disabled={record.soluong <= 0}
//                 >
//                     Chọn
//                 </Button>
//             ),
//         },
//     ];

//     return (
//         <Modal
//             title="Danh sách sản phẩm"
//             open={visible}
//             onCancel={onCancel}
//             width={1000}
//             footer={null}
//         >
//             <Space style={{ marginBottom: 16 }}>
//                 <Input
//                     placeholder="Tìm theo tên, tác giả..."
//                     value={searchText}
//                     onChange={e => setSearchText(e.target.value)}
//                     onPressEnter={handleSearch}
//                     style={{ width: 250 }}
//                     suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: 'pointer' }} />}
//                 />
//                 <Select
//                     placeholder="Thể loại"
//                     style={{ width: 150 }}
//                     allowClear
//                     onChange={val => setSelectedCategory(val)}
//                 >
//                     {categories.map(c => (
//                         <Option key={c.id} value={c.id}>{c.tentheloai}</Option>
//                     ))}
//                 </Select>
//                 <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
//             </Space>

//             <Table
//                 dataSource={products}
//                 columns={columns}
//                 rowKey="id"
//                 loading={loading}
//                 pagination={{ pageSize: 6 }}
//             />
//         </Modal>
//     );
// };

// export default ProductSelectModal;
