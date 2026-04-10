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
  const [statusFilter, setStatusFilter] = useState('');
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
        voucherType: item.voucherType,
        giamToiDa: item.giamToiDa,
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
        voucherType: item.voucherType,
        giamToiDa: item.giamToiDa,
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

  const filtered = data.filter((item) => {
    if (statusFilter && item.status !== statusFilter) {
      return false;
    }
    return true;
  });
  
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
      voucherType: r.voucherType || 'GIAM_THEO_TIEN',
      value: r.value,
      giamToiDa: r.giamToiDa,
      minOrder: r.minOrder,
      maxUsage: r.maxUsage,
      dateRange: r.fromDate && r.toDate
        ? [dayjs(r.fromDate, 'DD-MM-YYYY HH:mm:ss'), dayjs(r.toDate, 'DD-MM-YYYY HH:mm:ss')]
        : null,
      status: r.status === 'HOAT_DONG'
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
      return Promise.reject(new Error('Vui lòng chọn thời gian hiệu lực'));
    }
    const start = dayjs(range[0]);
    const end = dayjs(range[1]);
    const now = dayjs();

    if (!start.isValid() || !end.isValid()) {
      return Promise.reject(new Error('Thời gian không hợp lệ'));
    }

    if (end.isBefore(start) || end.isSame(start)) {
      return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
    }

    // Chỉ kiểm tra thời gian tương lai khi thêm mới
    if (!editingItem) {
      if (start.isBefore(now.subtract(1, 'minute'))) {
        return Promise.reject(new Error('Ngày bắt đầu không được ở trong quá khứ'));
      }
      if (end.isBefore(now)) {
        return Promise.reject(new Error('Ngày kết thúc phải ở trong tương lai'));
      }
    }

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
            voucherType: values.voucherType,
            giaTriGiam: values.value,
            giamToiDa: values.voucherType === 'GIAM_THEO_PHAN_TRAM' ? values.giamToiDa : null,
            tienToiThieu: values.minOrder,
            ngayBatDau: startDateStr,
            ngayKetThuc: endDateStr,
            soLuong: values.maxUsage,
          };

          if (editingItem) {
            payload.trangThai = values.status ? 'HOAT_DONG' : 'NGUNG_HOAT_DONG';
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
      render: (_, r) => <strong style={{ color: '#fa8c16' }}>{r.voucherType === 'GIAM_THEO_PHAN_TRAM' ? `${r.value}%` : `${r.value?.toLocaleString('vi-VN')}₫`}</strong>,
    },
    {
      title: 'Giảm tối đa',
      key: 'giamToiDa',
      render: (_, r) => r.voucherType === 'GIAM_THEO_PHAN_TRAM' && r.giamToiDa ? `${r.giamToiDa?.toLocaleString('vi-VN')}₫` : '-',
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
          <Select 
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }} 
            style={{ width: 160 }}
          >
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
            <Input placeholder="Ví dụ: Giảm giá mùa hè 2024" />
          </Form.Item>
          <Form.Item
            name="voucherType"
            label="Loại giảm giá"
            rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
            initialValue="GIAM_THEO_TIEN"
          >
            <Select onChange={() => form.validateFields(['value', 'giamToiDa', 'minOrder'])}>
              <Option value="GIAM_THEO_TIEN">Giảm theo số tiền</Option>
              <Option value="GIAM_THEO_PHAN_TRAM">Giảm theo phần trăm</Option>
            </Select>
          </Form.Item>
          <Form.Item noStyle dependencies={['voucherType']}>
            {({ getFieldValue }) => {
              const isPercent = getFieldValue('voucherType') === 'GIAM_THEO_PHAN_TRAM';
              return (
                <Form.Item
                  name="value"
                  label={isPercent ? "Giá trị giảm (%)" : "Giá trị giảm (₫)"}
                  rules={[
                    { required: true, message: "Vui lòng nhập giá trị giảm" },
                    isPercent ? { type: 'number', min: 1, max: 100, message: 'Từ 1% đến 100%' } : { type: 'number', min: 1000, message: 'Từ 1,000₫' },
                    !isPercent ? { type: 'number', max: 50000000, message: 'Không được quá 50,000,000₫' } : {}
                  ].filter(rule => Object.keys(rule).length > 0)}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={isPercent ? 1 : 1000}
                    max={isPercent ? 100 : undefined}
                    placeholder={isPercent ? "Nhập % giảm" : "Nhập số tiền giảm"}
                    formatter={value => isPercent ? `${value}` : value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={value => isPercent ? value : value ? value.replace(/,/g, '') : ''}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item noStyle dependencies={['voucherType']}>
            {({ getFieldValue }) => {
              if (getFieldValue('voucherType') === 'GIAM_THEO_PHAN_TRAM') {
                return (
                  <Form.Item
                    name="giamToiDa"
                    label="Giảm tối đa (₫)"
                    rules={[
                      { required: true, message: "Vui lòng nhập mức giảm tối đa" },
                      { type: 'number', min: 1000, message: 'Tối thiểu 1,000₫' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      placeholder="Nhập mức giảm tối đa"
                      formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      parser={value => value ? value.replace(/,/g, '') : ''}
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
          <Form.Item
            name="minOrder"
            label="Đơn tối thiểu (₫)"
            dependencies={['value', 'voucherType']}
            rules={[
              { required: true, message: "Vui lòng nhập đơn tối thiểu áp dụng" },
              ({ getFieldValue }) => ({
                validator: (_, val) => {
                  const giftValue = getFieldValue('value');
                  const vType = getFieldValue('voucherType');
                  if (!val || !giftValue) return Promise.resolve();
                  if (vType === 'GIAM_THEO_TIEN' && val <= giftValue) {
                    return Promise.reject(new Error('Đơn tối thiểu phải lớn hơn giá trị giảm'));
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập giá trị đơn hàng tối thiểu"
              formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={value => value ? value.replace(/,/g, '') : ''}
            />
          </Form.Item>
          <Form.Item
            name="maxUsage"
            label="Số lượng phát hành"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: 'integer', min: 1, message: 'Số lượng phải là số nguyên dương' },
              { type: 'number', max: 1000000, message: 'Số lượng không được quá 1,000,000' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder="Nhập số lượng voucher"
            />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Thời gian hiệu lực"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }, { validator: validateDateRange }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY HH:mm"
              showTime={{ format: "HH:mm" }}
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Form.Item>
          {editingItem && (
            <Form.Item name="status" label="Trạng thái hoạt động" valuePropName="checked">
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          )}

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
                {detailItem.voucherType === 'GIAM_THEO_PHAN_TRAM' ? `${detailItem.giaTriGiam}%` : `${detailItem.giaTriGiam?.toLocaleString('vi-VN')}₫`}
              </span>
            </Descriptions.Item>
            {detailItem.voucherType === 'GIAM_THEO_PHAN_TRAM' && (
              <Descriptions.Item label="Giảm tối đa">
                {detailItem.giamToiDa?.toLocaleString('vi-VN')}₫
              </Descriptions.Item>
            )}
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