import { useState, useEffect, useCallback } from 'react';
import { Card, Modal, Form, Input, InputNumber, Select, Switch, Space, Button, Image, Tooltip, message, } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, } from '@ant-design/icons';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import StatusTag from '../../components/admin/StatusTag';
import SachService from '../../services/SachService';
import './AdminPage.css';

import TheLoaiService from '../../services/TheLoaiService';
import NhaXuatBanService from '../../services/NhaXuatBanService';


const { Option } = Select;
const { TextArea } = Input;

    const ProductsPage = () => {
      const [data, setData] = useState([]);
      const [loading, setLoading] = useState(false);
      const [search, setSearch] = useState('');

const [theLoaiList, setTheLoaiList] = useState([]);
const [nxbList, setNxbList] = useState([]);

      const [searchTimer, setSearchTimer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    const pageSize = 10;

      const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
          const res = await SachService.getAll();
          setData(res.data);
        }
        catch {
          message.error('Không thể tải danh sách sách!');
        }
        finally {
          setLoading(false);
        } }, []);

      useEffect(() => {
        fetchAll();
        }, [fetchAll]);

useEffect(() => {
  const fetchDropdown = async () => {
    try {
      const tl = await TheLoaiService.getAll();
      const nxb = await NhaXuatBanService.getAll();

      setTheLoaiList(tl.data);
      setNxbList(nxb.data);
    } catch {
      message.error('Không tải được dữ liệu dropdown');
    }
  };

  fetchDropdown();
}, []);

      // search debounce
      const handleSearch = (val) => {
        setSearch(val);
        setCurrentPage(1);
        if (searchTimer) clearTimeout(searchTimer);
        if (!val.trim()) {
          fetchAll();
          return;
        }

        const t = setTimeout(async () => {
          try { setLoading(true);
            const res = await SachService.search(val.trim());
            setData(res.data); }
          catch {
            message.error('Tìm kiếm thất bại!');
          } finally {
            setLoading(false);
          } }, 400);
        setSearchTimer(t);
        };
// paging
    const paged = data.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );
    // open add
    const openAdd = () => {
      setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
    };
// open edit
    const openEdit = async (record) => {
      try {
        const res = await SachService.detail(record.id);
        const d = res.data;
        setEditingItem(d);
        form.setFieldsValue({
          maSach: d.maSach,
          maVach: d.maVach,
          tenSach: d.tenSach,
          giaBan: d.giaBan,
          soLuong: d.soLuong,
          soTrang: d.soTrang,
          ngonNgu: d.ngonNgu,
          namXuatBan: d.namXuatBan,
          kichThuoc: d.kichThuoc,
          moTa: d.moTa,
          idTheLoai: d.idTheLoai,
          idNxb: d.idNxb,
          trangThai: d.trangThai !== false,
        });

        setModalOpen(true);
      } catch {
        message.error('Không thể tải dữ liệu sách!');
      } };

      const handleFinish = async (values) => {
        const payload = {
          maSach: values.maSach,
          maVach: values.maVach,
          tenSach: values.tenSach,
          giaBan: Number(values.giaBan),
          soLuong: Number(values.soLuong),
          soTrang: values.soTrang ? Number(values.soTrang) : null,
          ngonNgu: values.ngonNgu,
          namXuatBan: values.namXuatBan ? Number(values.namXuatBan) : null,
          kichThuoc: values.kichThuoc,
          moTa: values.moTa, idTheLoai: Number(values.idTheLoai),
          idNxb: Number(values.idNxb),
          trangThai: values.trangThai,
        };

        try {
          if (editingItem) {
            await SachService.update(editingItem.id, payload); message.success('Cập nhật sách thành công!');
          } else {
            await SachService.add(payload); message.success('Thêm sách thành công!');
          } setModalOpen(false);
          fetchAll();
        } catch (e) {
          const msg = e?.response?.data?.message || 'Có lỗi xảy ra!'; message.error(msg);
        }
      };

      const handleHidden = async (record) => {
        Modal.confirm({
          title: `Ẩn sách "${record.tenSach}"?`,
          okText: 'Xác nhận',
          cancelText: 'Hủy',
          okButtonProps: { danger: true },
          onOk: async () => {
            try {
              await SachService.hidden(record.id);
              message.success('Đã ẩn sách thành công!');
              fetchAll();
            } catch {
              message.error('Ẩn sách thất bại!');
            } },
        });
      };

      const columns = [ {
        title: 'Mã sách',
        dataIndex: 'maSach',
        key: 'maSach',
      }, {
        title: 'Tên sách',
        dataIndex: 'tenSach',
        key: 'tenSach',
      }, {
        title: 'Thể loại',
        dataIndex: 'tenTheLoai',
        key: 'tenTheLoai',
      }, {
        title: 'NXB',
        dataIndex: 'tenNxb',
        key: 'tenNxb',
      },{
        title: 'Giá bán',
        dataIndex: 'giaBan',
        key: 'giaBan',
        render: (v) => `${Number(v).toLocaleString('vi-VN')}₫`,
      },{
        title: 'Số lượng',
        dataIndex: 'soLuong',
        key: 'soLuong',
      }, {
        title: 'Trạng thái',
        dataIndex: 'trangThai',
        render: (s) => ( <StatusTag status={s ? 'active' : 'inactive'}
        />
        ),
      },
      {
        title: 'Thao tác',
            render: (_, record) => (
                <Space>
                  <Button
                      size="small"
                          icon={<EyeOutlined />}
                          onClick={() => openEdit(record)}
                  />
                  <Button
                      size="small"
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(record)}
                  />
                    <Button
                        size="small"
                        danger icon={<DeleteOutlined />}
                        onClick={() => handleHidden(record)}
                    />
                </Space>
        ),
      },
    ];
      return (
          <div className="admin-page">
            <PageHeader title="Quản lý Sản phẩm" onAdd={openAdd} />
            <Card bordered={false} className="admin-card">
              <div className="admin-toolbar">
                <SearchBar
                    placeholder="Tìm theo tên sách..."
                           value={search}
                           onChange={(e) => handleSearch(e.target.value)}
                /> </div>
              <DataTable columns={columns}
                         dataSource={paged}
                         loading={loading}
                         total={data.length}
                         currentPage={currentPage}
                         pageSize={pageSize}
                         onPageChange={(p) => setCurrentPage(p)}
              />
            </Card>
            <Modal
                title={editingItem ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()}
                width={700} >
              <Form form={form}
                    layout="vertical"
                    onFinish={handleFinish}>
                <Form.Item
                    name="maSach"
                    label="Mã sách"
                    rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item
                    name="maVach"
                    label="Mã vạch">
                  <Input />
                </Form.Item>
                <Form.Item
                    name="tenSach"
                    label="Tên sách"
                    rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item
                    name="giaBan"
                    label="Giá bán"
                    rules={[{ required: true }]}>
                  <InputNumber
                      style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    name="soLuong"
                    label="Số lượng"
                    rules={[{ required: true }]}>
                  <InputNumber
                      style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    name="idTheLoai"
                    label="Thể loại"
                    rules={[{ required: true }]}>
                  <Select placeholder="Chọn thể loại">
                    {theLoaiList.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.tenTheLoai}
                        </Option>
                    ))}
                  </Select>
                </Form.Item>
                ```jsx
                <Form.Item
                    name="idNxb"
                    label="Nhà xuất bản"
                    rules={[{ required: true }]}>
                  <Select placeholder="Chọn nhà xuất bản">
                    {nxbList.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.tenNxb}
                        </Option>
                    ))}
                  </Select>
                </Form.Item>
                ```

                <Form.Item
                    name="soTrang"
                    label="Số trang">
                  <InputNumber
                      style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    name="ngonNgu"
                    label="Ngôn ngữ">
                  <Input />
                </Form.Item>
                <Form.Item
                    name="namXuatBan"
                    label="Năm XB">
                  <InputNumber
                      style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  name="kichThuoc"
                  label="Kích thước">
                  <Input />
                </Form.Item>
                <Form.Item
                    name="moTa"
                    label="Mô tả">
                  <TextArea
                      rows={3} />
                </Form.Item>
                <Form.Item
                    name="trangThai"
                    label="Trạng thái"
                    valuePropName="checked"
                    initialValue={true} >
                  <Switch />
                </Form.Item>
              </Form>
            </Modal>
          </div>
      );
    };
    export default ProductsPage;