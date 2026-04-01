import { useState, useEffect } from 'react';
import { Card, Modal, Form, Input, InputNumber, Select, DatePicker, Space, Button, Tooltip, message, Descriptions, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import PageHeader from '../../components/admin/PageHeader';
import StatusTag from '../../components/admin/StatusTag';
import './AdminPage.css';
import { formatDate, formatDateTime } from '../../utils/format';
import { getAllVoucher, createVoucher, updateVoucher, searchVoucher, getVoucherId } from '../../services/VoucherService';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const CouponsPage = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const [form] = Form.useForm();
  const pageSize = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllVoucher();
      const mapped = res.map((item) => ({
        id: item.id,
        code: item.maVoucher,
        name: item.tenMaGiamGia,
        value: item.giaTriGiam,
        minOrder: item.tienToiThieu,
        fromDate: item.ngayBatDau,
        toDate: item.ngayKetThuc,
        usedCount: 0,
        maxUsage: item.soLuong,
        status: item.trangThai,
        raw: item,
      }));
      setData(mapped);
    } catch (err) {
      message.error(err.message || "Lỗi lấy danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    if (!value) {
      fetchData();
      return;
    }
    try {
      setLoading(true);
      const res = await searchVoucher(value);
      const mapped = res.map((item) => ({
        id: item.id,
        code: item.maVoucher,
        name: item.tenMaGiamGia,
        value: item.giaTriGiam,
        minOrder: item.tienToiThieu,
        fromDate: item.ngayBatDau,
        toDate: item.ngayKetThuc,
        usedCount: 0,
        maxUsage: item.soLuong,
        status: item.trangThai,
        raw: item,
      }));
      setData(mapped);
      setCurrentPage(1);
    } catch (err) {
      message.error(err.message || "Lỗi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = search ? data : data;
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const openAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditingItem(r);
    form.setFieldsValue({
      name: r.name,
      value: r.value,
      minOrder: r.minOrder,
      maxUsage: r.maxUsage,
      dateRange: r.fromDate && r.toDate
        ? [dayjs(r.fromDate, 'DD-MM-YYYY HH:mm:ss'), dayjs(r.toDate, 'DD-MM-YYYY HH:mm:ss')]
        : null,
      status: r.status
    });
    setModalOpen(true);
  };

  const openDetail = async (id) => {
    try {
      setLoading(true);
      const res = await getVoucherId(id);
      setDetailItem(res);
      setDetailModalOpen(true);
    } catch (error) {
      message.error(error.message || "Lỗi khi lấy chi tiết voucher");
    } finally {
      setLoading(false);
    }
  };

  const formatPayloadDate = (d) => (d ? dayjs(d).format('DD-MM-YYYY HH:mm:00') : null);

  const validateDateRange = (_, range) => {
    if (!range || range.length !== 2 || !range[0] || !range[1]) {
      return Promise.reject(new Error('Vui lòng chọn thời gian'));
    }
    const start = dayjs(range[0]);
    const end = dayjs(range[1]);
    if (!start.isValid() || !end.isValid()) return Promise.reject(new Error('Thời gian không hợp lệ'));
    if (end.isBefore(start)) return Promise.reject(new Error('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu'));
    return Promise.resolve();
  };

  const handleSubmit = (values) => {
    confirm({
      title: editingItem ? 'Xác nhận cập nhật mã giảm giá?' : 'Xác nhận thêm mã giảm giá mới?',
      content: 'Bạn có chắc chắn với thông tin đã nhập?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const startDateStr = values.dateRange ? formatPayloadDate(values.dateRange[0]) : null;
          const endDateStr = values.dateRange ? formatPayloadDate(values.dateRange[1]) : null;

          const payload = {
            tenMaGiamGia: String(values.name || '').trim(),
            giaTriGiam: values.value,
            tienToiThieu: values.minOrder,
            ngayBatDau: startDateStr,
            ngayKetThuc: endDateStr,
            soLuong: values.maxUsage,
          };

          if (editingItem) {
            payload.trangThai = values.status;
            await updateVoucher(editingItem.id, payload);
            message.success("Cập nhật thành công");
          } else {
            await createVoucher(payload);
            message.success("Thêm thành công");
          }

          setModalOpen(false);
          fetchData();
        } catch (err) {
          message.error(err.message || 'Có lỗi xảy ra');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Mã giảm giá',
      dataIndex: 'code',
      key: 'code',
      render: (v) => <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{v}</code>,
    },
    {
      title: 'Tên mã',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá trị',
      key: 'value',
      render: (_, r) => <strong style={{ color: '#fa8c16' }}>{r.value.toLocaleString('vi-VN')}₫</strong>,
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrder',
      key: 'minOrder',
      render: (v) => `${v.toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'maxUsage',
      key: 'maxUsage',


    },
    { title: 'Từ ngày', dataIndex: 'fromDate', key: 'fromDate', render: (v) => formatDateTime(v) },
    { title: 'Đến ngày', dataIndex: 'toDate', key: 'toDate', render: (v) => formatDateTime(v) },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <StatusTag status={s} />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(r.id)} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <PageHeader title="Quản lý Mã giảm giá" onAdd={openAdd} />
      <Card bordered={false} className="admin-card">
        <div className="admin-toolbar">
          <SearchBar
            placeholder="Tìm theo mã hoặc tên giảm giá..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={handleSearch}
          />
          <Select defaultValue="" style={{ width: 160 }}>
            <Option value="">Tất cả trạng thái</Option>
            <Option value="HOAT_DONG">Đang hoạt động</Option>
            <Option value="NGUNG_HOAT_DONG">Ngừng hoạt động</Option>
            <Option value="CHUA_KICH_HOAT">Chưa kích hoạt</Option>
          </Select>
        </div>
        <DataTable
          loading={loading}
          columns={columns}
          dataSource={paged}
          total={filtered.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </Card>

      <Modal
        title={editingItem ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên mã giảm giá"
            rules={[
              { required: true, message: 'Vui lòng nhập tên mã giảm giá' },
              { whitespace: true, message: 'Tên mã giảm giá không được để trống' },
              { min: 3, message: 'Tên mã giảm giá phải có ít nhất 3 ký tự' },
              { max: 100, message: 'Tên mã giảm giá tối đa 100 ký tự' },
            ]}
          >
            <Input placeholder="" />
          </Form.Item>
          <Form.Item
            name="value"
            label="Giá trị giảm"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị giảm" },
              {
                validator: (_, val) => {
                  if (val === undefined || val === null) return Promise.resolve();
                  if (val <= 0) return Promise.reject(new Error("Giá trị phải lớn hơn 0"));
                  if (!Number.isFinite(val)) return Promise.reject(new Error("Giá trị không hợp lệ"));
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập giá trị"
              formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={value => value ? value.replace(/,/g, '') : ''}
            />
          </Form.Item>
          <Form.Item
            name="minOrder"
            label="Đơn tối thiểu"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị áp dụng" },
              {
                validator: (_, val) => {
                  if (val === undefined || val === null) return Promise.resolve();
                  if (val <= 0) return Promise.reject(new Error("Giá trị phải lớn hơn 0"));
                  if (!Number.isFinite(val)) return Promise.reject(new Error("Giá trị không hợp lệ"));
                  return Promise.resolve();
                }
              },
              ({ getFieldValue }) => ({
                validator: (_, val) => {
                  const v = getFieldValue('value');
                  if (val === undefined || val === null || v === undefined || v === null) return Promise.resolve();
                  if (!Number.isFinite(val) || !Number.isFinite(v)) return Promise.resolve();
                  if (Number(v) >= Number(val)) return Promise.reject(new Error('Đơn tối thiểu phải lớn hơn giá trị giảm'));
                  return Promise.resolve();
                }
              })
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập giá trị"
              formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={value => value ? value.replace(/,/g, '') : ''}
            />
          </Form.Item>
          <Form.Item
            name="maxUsage"
            label="Số lượng"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              {
                validator: (_, val) => {
                  if (val === undefined || val === null) return Promise.resolve();
                  if (!Number.isFinite(val)) return Promise.reject(new Error("Giá trị không hợp lệ"));
                  if (!Number.isInteger(val)) return Promise.reject(new Error("Số lượng phải là số nguyên"));
                  if (val <= 0) return Promise.reject(new Error("Số lượng phải lớn hơn 0"));
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập giá trị"
              formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={value => value ? value.replace(/,/g, '') : ''}
            />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Thời gian hiệu lực"
            rules={[{ validator: validateDateRange }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY HH:mm"
              showTime={{ format: "HH:mm" }}
            />
          </Form.Item>

        </Form>
      </Modal>

      <Modal
        title="Chi tiết mã giảm giá"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {detailItem && (
          <Descriptions bordered column={1} size="small" labelStyle={{ width: 150, fontWeight: 600 }}>
            <Descriptions.Item label="Mã voucher">{detailItem.maVoucher}</Descriptions.Item>
            <Descriptions.Item label="Tên chương trình">{detailItem.tenMaGiamGia}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <StatusTag status={detailItem.trangThai} />
            </Descriptions.Item>
            <Descriptions.Item label="Giá trị giảm">
              <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>
                {detailItem.giaTriGiam?.toLocaleString('vi-VN')}₫
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn tối thiểu">
              {detailItem.tienToiThieu?.toLocaleString('vi-VN')}₫
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng phát hành">
              {detailItem.soLuong}
            </Descriptions.Item>
            <Descriptions.Item label="Từ ngày">
              {formatDate(detailItem.ngayBatDau)}
            </Descriptions.Item>
            <Descriptions.Item label="Đến ngày">
              {formatDate(detailItem.ngayKetThuc)}
            </Descriptions.Item>

          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CouponsPage;