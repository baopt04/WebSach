import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Steps, Row, Col, Typography, Table, Spin, Button, message, Divider, Tag, Modal, Form, Input, Select, Timeline, Space } from 'antd';
import { ArrowLeftOutlined, FormOutlined, FileDoneOutlined, InboxOutlined, CarOutlined, CheckCircleOutlined, CreditCardFilled, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getHoaDonChiTiet, changeOrderStatus, updateHoaDon, getLichSuHoaDon } from '../../services/hoaDonService';
import { getProvinces, getDistricts, getWards, calculateShippingFee, calculateLeadTime } from '../../services/GhnApi';
import './OrderDetailAdmin.css';

const { Title, Text } = Typography;
const { Option } = Select;

const DANG_CHUAN_BI_HANG = 'DANG_CHUAN_BI_HANG';
const STATUSES_ALLOW_CANCEL = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', DANG_CHUAN_BI_HANG];

const SHOP_INFO = {
  name: 'Cửa hàng FPOLY',
  address: 'Trường cao đẳng FPOLY, đường Trịnh Văn Bô, phường Xuân Phương, TP. Hà Nội',
  phone: '04532323153',
};

const formatMoneyVnd = (n) => (Number(n) || 0).toLocaleString('vi-VN');

const OrderDetailAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [history, setHistory] = useState([]);
  const statusMap = {
    'CHO_XAC_NHAN': 'Chờ xác nhận',
    'DA_XAC_NHAN': 'Đã xác nhận',
    'DANG_CHUAN_BI_HANG': 'Đang chuẩn bị hàng',
    'DANG_GIAO': 'Đang giao',
    'DA_GIAO': 'Đã giao',
    'DA_HUY': 'Đã hủy',
    'TAO_HOA_DON': 'Tạo hóa đơn',
    'DA_THANH_TOAN': 'Đã thanh toán',
    'THANH_CONG': 'Thành công'
  };
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [statusForm] = Form.useForm();
  const [cancelForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const autoPrintSlipRef = useRef(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [detailRes, histRes] = await Promise.all([
        getHoaDonChiTiet(id),
        getLichSuHoaDon(id)
      ]);


      setOrderData(detailRes);
      setHistory(histRes || []);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải chi tiết hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    document.body.classList.add('admin-order-detail-print-root');
    return () => document.body.classList.remove('admin-order-detail-print-root');
  }, []);

  useEffect(() => {
    autoPrintSlipRef.current = false;
  }, [id]);

  /* Tự mở hộp thoại in (Ctrl+P) khi mở đơn DA_XAC_NHAN hoặc vừa chuyển sang trạng thái đó */
  useEffect(() => {
    if (loading || !orderData) return;
    if (orderData.hoaDon.trangThai !== 'DA_XAC_NHAN') return;
    if (autoPrintSlipRef.current) return;
    const t = setTimeout(() => {
      autoPrintSlipRef.current = true;
      window.print();
    }, 450);
    return () => clearTimeout(t);
  }, [loading, id, orderData?.hoaDon?.trangThai, orderData?.hoaDon?.maHoaDon]);

  useEffect(() => {
    if (isEditOpen) {
      getProvinces().then(res => setProvinces(res.data)).catch(console.error);

      const { hoaDon } = orderData;
      editForm.setFieldsValue({
        hoTenKhachHang: hoaDon.hoTenKhachHang,
        soDienThoai: hoaDon.soDienThoai,
        email: hoaDon.email,
        phiShip: typeof hoaDon.phiShip === 'number' ? hoaDon.phiShip.toLocaleString('vi-VN') : hoaDon.phiShip,
        ngayNhan: hoaDon.ngayNhan,
        ghiChu: hoaDon.ghiChu,
      });
    }
  }, [isEditOpen, orderData, editForm]);

  const handleProvinceChange = async (val, option) => {
    editForm.setFieldsValue({ quan: undefined, xa: undefined, provinceName: option.children });
    setWards([]);
    try {
      const res = await getDistricts(val);
      setDistricts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDistrictChange = async (val, option) => {
    editForm.setFieldsValue({ xa: undefined, districtName: option.children });
    try {
      const res = await getWards(val);
      setWards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWardChange = async (val, option) => {
    editForm.setFieldsValue({ wardName: option.children });

    const districtId = editForm.getFieldValue('quan');
    if (districtId && val) {
      try {
        const [feeRes, leadTimeRes] = await Promise.all([
          calculateShippingFee({
            toDistrictId: districtId,
            toWardCode: val,
          }),
          calculateLeadTime({
            toDistrictId: districtId,
            toWardCode: val,
          })
        ]);

        if (feeRes?.data?.total) {
          const roundedFee = Math.round(feeRes.data.total / 1000) * 1000;
          editForm.setFieldsValue({ phiShip: roundedFee.toLocaleString('vi-VN') });
        }

        if (leadTimeRes?.data?.leadtime) {
          const leadTimeStr = dayjs(leadTimeRes.data.leadtime * 1000).format('DD/MM/YYYY');
          editForm.setFieldsValue({ ngayNhan: leadTimeStr });
        }
      } catch (error) {
        console.error("Lỗi tính phí ship/leadtime", error);
        message.warning("Không thể tính phí vận chuyển tự động tính");
      }
    }
  };

  const handleChangeStatusSubmit = (values) => {
    if (!orderData) return;
    const current = orderData.hoaDon.trangThai;
    let nextStatus = '';
    if (current === 'CHO_XAC_NHAN') nextStatus = 'DA_XAC_NHAN';
    else if (current === 'DA_XAC_NHAN') nextStatus = 'DANG_CHUAN_BI_HANG';
    else if (current === DANG_CHUAN_BI_HANG) nextStatus = 'DANG_GIAO';
    else if (current === 'DANG_GIAO') nextStatus = 'DA_THANH_TOAN';
    else if (current === 'DA_THANH_TOAN') nextStatus = 'THANH_CONG';

    if (!nextStatus) {
      message.warning('Không có trạng thái tiếp theo hợp lệ');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận chuyển trạng thái',
      content: (
        <div>
          <p>
            Chuyển từ <strong>{statusMap[current] || current}</strong> sang{' '}
            <strong>{statusMap[nextStatus] || nextStatus}</strong>.
          </p>
          <p style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
            Ghi chú: {values.ghiChu}
          </p>
          <p style={{ marginTop: 12 }}>Bạn có chắc chắn muốn thực hiện?</p>
        </div>
      ),
      okText: 'Xác nhận',
      cancelText: 'Quay lại',
      onOk: async () => {
        try {
          await changeOrderStatus(id, { orderStatus: nextStatus, ghiChu: values.ghiChu });
          message.success('Chuyển trạng thái đơn hàng thành công');
          setIsStatusOpen(false);
          statusForm.resetFields();
          await fetchData();
        } catch (error) {
          message.error('Chuyển trạng thái thất bại');
          throw error;
        }
      },
    });
  };

  const handleCancelSubmit = (values) => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      content: (
        <div>
          <p>Hành động này không thể hoàn tác.</p>
          <p style={{ marginTop: 8 }}>
            Lý do đã nhập: <strong>{values.ghiChu}</strong>
          </p>
          <p style={{ marginTop: 12 }}>Bạn có chắc chắn muốn hủy đơn?</p>
        </div>
      ),
      okText: 'Hủy đơn',
      okButtonProps: { danger: true },
      cancelText: 'Quay lại',
      onOk: async () => {
        try {
          await changeOrderStatus(id, { orderStatus: 'DA_HUY', ghiChu: values.ghiChu });
          message.success('Hủy đơn hàng thành công');
          setIsCancelOpen(false);
          cancelForm.resetFields();
          await fetchData();
        } catch (error) {
          message.error('Hủy đơn hàng thất bại');
          throw error;
        }
      },
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      let diaChiGiaoHang = orderData.hoaDon.diaChiGiaoHang;
      if (values.provinceName && values.districtName && values.wardName) {
        let details = [];
        if (values.diaChiChiTiet) {
          details.push(values.diaChiChiTiet);
        }
        diaChiGiaoHang = `${details.length ? details[0] + ', ' : ''}${values.wardName}, ${values.districtName}, ${values.provinceName}`;
      } else if (values.diaChiChiTiet) {
        diaChiGiaoHang = values.diaChiChiTiet + ', ' + diaChiGiaoHang;
      }

      const rawPhiShip = values.phiShip ? String(values.phiShip).replace(/\D/g, '') : '0';

      const payload = {
        hoTen: values.hoTenKhachHang?.trim(),
        soDienThoai: values.soDienThoai?.trim(),
        email: values.email?.trim(),
        diaChiGiaoHang,
        phiShip: Number(rawPhiShip),
        ghiChu: values.ghiChu?.trim()
      };

      await updateHoaDon(id, payload);
      message.success('Cập nhật thông tin thành công');
      setIsEditOpen(false);
      editForm.resetFields()
      fetchData();
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  if (loading || !orderData) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  const { hoaDon, chiTiets } = orderData;
  const isCancelled = hoaDon.trangThai === 'DA_HUY';

  const timelineItems = history.map(h => ({
    color: h.trangThai === 'DA_HUY' ? 'red'
      : h.trangThai === 'DA_GIAO' ? 'green'
        : h.trangThai === 'DA_THANH_TOAN' ? 'blue'
          : 'gray',
    children: (
      <>
        <Text strong style={{ display: 'block' }}>{statusMap[h.trangThai] || h.trangThai}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(h.ngayTao).format('DD/MM/YYYY HH:mm')}
        </Text>
        {h.ghiChu && <div style={{ fontSize: 12, marginTop: 4 }}>GH: {h.ghiChu}</div>}
      </>
    )
  }));

  const statusList = [
    { key: 'CHO_XAC_NHAN', title: 'Chờ xác nhận', icon: <FormOutlined /> },
    { key: 'DA_XAC_NHAN', title: 'Đã xác nhận', icon: <FileDoneOutlined /> },
    { key: DANG_CHUAN_BI_HANG, title: 'Đang chuẩn bị hàng', icon: <InboxOutlined /> },
    { key: 'DANG_GIAO', title: 'Đang giao hàng', icon: <CarOutlined /> },
    { key: 'DA_THANH_TOAN', title: 'Đã thanh toán', icon: <CreditCardFilled /> },
    { key: 'THANH_CONG', title: 'Thành công', icon: <CheckCircleOutlined /> },
  ];

  let currentStep = statusList.findIndex((s) => s.key === hoaDon.trangThai);

  const stepsItems = statusList.map((step, index) => {
    const hist = history.find(h => h.trangThai === step.key);
    return {
      title: step.title,
      description: hist ? dayjs(hist.ngayTao).format('DD/MM/YYYY HH:mm') : '',
      icon: step.icon,
      status: isCancelled ? (index === 0 ? 'finish' : 'wait') : (index < currentStep ? 'finish' : index === currentStep ? 'process' : 'wait'),
    };
  });

  if (isCancelled) {
    stepsItems.push({
      title: 'Đã hủy',
      description: dayjs(history[history.length - 1]?.ngayTao).format('DD/MM/YYYY HH:mm'),
      status: 'error',
      icon: <CheckCircleOutlined />
    });
    currentStep = stepsItems.length - 1;
  }

  const columns = [
    { title: 'STT', width: 60, render: (_, __, i) => i + 1 },
    {
      title: 'Ảnh sản phẩm',
      dataIndex: 'hinhAnh',
      width: 100,
      render: (img) => <img src={img || 'https://via.placeholder.com/60'} alt="Sách" style={{ width: 60, height: 60, objectFit: 'cover' }} />
    },
    {
      title: 'Thông tin sản phẩm',
      render: (_, record) => (
        <div>
          <Text strong>{record.tenSach}</Text><br />
          <Text type="secondary" style={{ fontSize: 13 }}>Mã: {record.maSach}</Text>
        </div>
      ),
    },
    { title: 'Số lượng', dataIndex: 'soLuong', align: 'center', width: 100 },
    { title: 'Đơn giá', dataIndex: 'donGia', align: 'right', render: (val) => `${val?.toLocaleString('vi-VN')}₫` },
    {
      title: 'Thành tiền',
      align: 'right',
      render: (_, r) => <Text strong style={{ color: '#ff4d4f' }}>{((r.donGia || 0) * (r.soLuong || 0)).toLocaleString('vi-VN')}₫</Text>
    },
    // {
    //   title: 'Trạng thái',
    //   dataIndex: 'trangThai',
    //   align: 'center',
    //   render: (val) => val ? <Tag color="blue">{val}</Tag> : <Text type="secondary">--</Text>
    // },
  ];

  const totalPayment = (hoaDon.tongTienHang || 0) + (hoaDon.phiShip || 0) - (hoaDon.giamGia || 0);

  const showDeliverySlip = !isCancelled && hoaDon.trangThai === 'DA_XAC_NHAN';

  return (
    <div className="order-detail-admin-page-root" style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {showDeliverySlip && (
        <div
          id="admin-order-delivery-slip"
          className="admin-order-print-slip-host admin-order-delivery-slip-print"
          aria-hidden="true"
        >
          <div className="admin-order-delivery-slip-inner">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Title level={3} style={{ margin: '0 0 8px' }}>{SHOP_INFO.name}</Title>
              <Text strong>Mã hóa đơn: </Text>
              <Text>{hoaDon.maHoaDon}</Text>
              <span style={{ margin: '0 12px', color: '#d9d9d9' }}>|</span>
              <Text strong>Ngày đặt hàng: </Text>
              <Text>{hoaDon.ngayTao ? dayjs(hoaDon.ngayTao).format('DD/MM/YYYY HH:mm') : '--'}</Text>
            </div>

            <div className="slip-two-col" style={{ marginBottom: 20 }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Từ</Text>
                <div><Text strong>{SHOP_INFO.name}</Text></div>
                <div style={{ marginTop: 6 }}>{SHOP_INFO.address}</div>
                <div style={{ marginTop: 6 }}>SĐT shop: {SHOP_INFO.phone}</div>
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Đến</Text>
                <div><Text strong>{hoaDon.hoTenKhachHang || '—'}</Text></div>
                <div style={{ marginTop: 6 }}>{hoaDon.diaChiGiaoHang || 'Mua tại quầy'}</div>
                <div style={{ marginTop: 6 }}>Số điện thoại: {hoaDon.soDienThoai || '—'}</div>
              </div>
            </div>

            <Text strong style={{ display: 'block', marginBottom: 8 }}>Thông tin đơn hàng</Text>
            <div className="slip-items-row slip-items-head">
              <span>STT</span>
              <span>Tên sản phẩm</span>
              <span style={{ textAlign: 'right' }}>SL</span>
            </div>
            {(chiTiets || []).map((r, i) => (
              <div key={r.id ?? i} className="slip-items-row">
                <span>{i + 1}</span>
                <span>{r.tenSach}</span>
                <span style={{ textAlign: 'right' }}>{r.soLuong}</span>
              </div>
            ))}

            <div className="slip-two-col" style={{ marginTop: 24 }}>
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Tiền thu người nhận: </Text>
                  <Text strong style={{ fontSize: 16 }}>{formatMoneyVnd(totalPayment > 0 ? totalPayment : 0)}₫</Text>
                </div>
                <div>
                  <Text strong>Ghi chú: </Text>
                  <Text>{hoaDon.ghiChu?.trim() ? hoaDon.ghiChu : '—'}</Text>
                </div>
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Chữ ký người nhận</Text>
                <div className="slip-signature-box">
                  <div className="slip-signature-line" />
                  <div className="slip-signature-note">Xác nhận hàng nguyên vẹn, không móp méo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-order-no-print">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/orders')} style={{ marginBottom: 16 }}>
          Quay lại danh sách
        </Button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Mã đơn: {hoaDon.maHoaDon} </Title>
        <Space>
          {!(isCancelled || hoaDon.trangThai === 'THANH_CONG') && (
            <Button type="primary" onClick={() => setIsStatusOpen(true)}>
              Chuyển trạng thái
            </Button>
          )}
          {!isCancelled && STATUSES_ALLOW_CANCEL.includes(hoaDon.trangThai) && (
            <Button danger onClick={() => setIsCancelOpen(true)}>
              Hủy đơn
            </Button>
          )}
          {showDeliverySlip && (
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              In phiếu
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={18}>
          <Card bordered style={{ borderRadius: 8, marginBottom: 24, padding: '24px 0' }}>
            <Steps current={currentStep} items={stepsItems} labelPlacement="vertical" responsive={false} />
          </Card>

          <Card bordered style={{ borderRadius: 8, marginBottom: 24 }}
            title={<div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Thông tin đơn hàng</span>
              {
                ![
                  'DA_XAC_NHAN',
                  'DANG_CHUAN_BI_HANG',
                  'DANG_GIAO',
                  'DA_THANH_TOAN',
                  'THANH_CONG',
                  'DA_HUY'
                ].includes(hoaDon.trangThai) && (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => setIsEditOpen(true)}
                  >
                    Cập nhật
                  </Button>
                )
              }
            </div>}>
            <Row gutter={[32, 16]}>
              <Col span={12}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div><Text type="secondary">Loại hóa đơn: </Text> <Tag color={hoaDon.loaiHoaDon === 'ONLINE' ? 'green' : 'orange'}>{hoaDon.loaiHoaDon || 'TẠI QUẦY'}</Tag></div>
                  <div><Text type="secondary">Khách hàng: </Text> <Text strong>{hoaDon.hoTenKhachHang}</Text></div>
                  <div><Text type="secondary">Email: </Text> <Text>{hoaDon.email || '--'}</Text></div>
                  <div><Text type="secondary">Số điện thoại: </Text> <Text>{hoaDon.soDienThoai}</Text></div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div><Text type="secondary">Thời gian đặt hàng: </Text><Text>{hoaDon.ngayTao ? dayjs(hoaDon.ngayTao).format('DD/MM/YYYY HH:mm') : '--'}</Text></div>
                  <div><Text type="secondary">Thời gian dự kiến nhận: </Text><Text>{hoaDon.ngayNhan ? dayjs(hoaDon.ngayNhan).format('DD/MM/YYYY') : '--'}</Text></div>
                  <div><Text type="secondary">Địa chỉ giao hàng: </Text><Text>{hoaDon.diaChiGiaoHang || 'Mua tại quầy'}</Text></div>
                  <div><Text type="secondary">Ghi chú: </Text><Text italic>{hoaDon.ghiChu || 'Không có'}</Text></div>
                </div>
              </Col>
            </Row>
          </Card>

          <Card bordered style={{ borderRadius: 8 }}>
            <Title level={5}>Danh sách sản phẩm</Title>
            <Table columns={columns} dataSource={chiTiets} rowKey="id" pagination={false} bordered />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 300 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">Tổng tiền hàng:</Text><Text strong>{(hoaDon.tongTienHang || 0).toLocaleString('vi-VN')}₫</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">Phí vận chuyển:</Text><Text strong>{(hoaDon.phiShip || 0).toLocaleString('vi-VN')}₫</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">Phiếu giảm giá:</Text><Text strong style={{ color: '#52c41a' }}>-{(hoaDon.giamGia || 0).toLocaleString('vi-VN')}₫</Text>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Title level={5}>Tổng thanh toán:</Title>
                  <Title level={4} style={{ color: '#ff4d4f', margin: 0 }}>{totalPayment > 0 ? totalPayment.toLocaleString('vi-VN') : 0}₫</Title>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card bordered title="Lịch sử đơn hàng" style={{ borderRadius: 8, height: '100%' }}>
            <Timeline items={timelineItems} style={{ marginTop: 16 }} />
          </Card>
        </Col>
      </Row>
      </div>

      <Modal title="Cập nhật trạng thái đơn hàng" open={isStatusOpen} onCancel={() => setIsStatusOpen(false)} onOk={() => statusForm.submit()}>
        <Form form={statusForm} layout="vertical" onFinish={handleChangeStatusSubmit} scrollToFirstError>
          <div style={{ marginBottom: 16 }}>
          </div>
          <Form.Item 
            name="ghiChu" 
            label="Ghi chú " 
            rules={[
              { required: true, message: 'Vui lòng nhập ghi chú' },
              { whitespace: true, message: 'Ghi chú không được chỉ chứa khoảng trắng' },
              { max: 255, message: 'Ghi chú không được vượt quá 255 ký tự' }
            ]}
          >
            <Input.TextArea placeholder="Nhập yêu cầu để chuyển trạng thái." rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Xác nhận hủy đơn hàng" open={isCancelOpen} onCancel={() => setIsCancelOpen(false)} onOk={() => cancelForm.submit()} okButtonProps={{ danger: true }}>
        <Form form={cancelForm} layout="vertical" onFinish={handleCancelSubmit} scrollToFirstError>
          <Text style={{ display: 'block', marginBottom: 16 }}>Hành động này không thể hoàn tác. Bạn có chắc chắn muốn hủy đơn hàng này?</Text>
          <Form.Item 
            name="ghiChu" 
            label="Lý do hủy đơn" 
            rules={[
              { required: true, message: 'Vui lòng nhập lý do hủy' },
              { whitespace: true, message: 'Lý do không được chỉ chứa khoảng trắng' },
              { min: 5, message: 'Lý do hủy phải có ít nhất 5 ký tự' },
              { max: 255, message: 'Lý do hủy không được vượt quá 255 ký tự' }
            ]}
          >
            <Input.TextArea placeholder="Ví dụ: Khách gọi điện bảo hủy..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Cập nhật thông tin giao hàng" open={isEditOpen} onCancel={() => setIsEditOpen(false)} onOk={() => editForm.submit()} width={600}>
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit} scrollToFirstError>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="hoTenKhachHang" 
                label="Họ tên"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ tên' },
                  { whitespace: true, message: 'Họ tên không được chỉ chứa khoảng trắng' },
                  { max: 100, message: 'Họ tên không được vượt quá 100 ký tự' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="soDienThoai" 
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^(0[3|5|7|8|9])+([0-9]{8})\b$/, message: 'Số điện thoại không hợp lệ (Bắt đầu bằng 03,05,07,08,09 và tổng 10 số)' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="email" 
                label="Email"
                rules={[
                  { type: 'email', message: 'Email không đúng định dạng' },
                  { max: 255, message: 'Email không được vượt quá 255 ký tự' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="tinh" 
                label="Tỉnh / Thành phố"
                dependencies={['quan', 'xa']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const q = getFieldValue('quan');
                      const x = getFieldValue('xa');
                      if ((q || x) && !value) return Promise.reject(new Error('Vui lòng chọn Tỉnh'));
                      return Promise.resolve();
                    }
                  })
                ]}
              >
                <Select placeholder="Chọn tỉnh" onChange={handleProvinceChange}>
                  {provinces.map(p => <Option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="provinceName" hidden><Input /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="quan" 
                label="Quận / Huyện"
                dependencies={['tinh', 'xa']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const t = getFieldValue('tinh');
                      const x = getFieldValue('xa');
                      if ((t || x) && !value) return Promise.reject(new Error('Vui lòng chọn Quận/Huyện'));
                      return Promise.resolve();
                    }
                  })
                ]}
              >
                <Select placeholder="Chọn quận" disabled={!districts.length} onChange={handleDistrictChange}>
                  {districts.map(d => <Option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="districtName" hidden><Input /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="xa" 
                label="Phường / Xã"
                dependencies={['tinh', 'quan']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const t = getFieldValue('tinh');
                      const q = getFieldValue('quan');
                      if ((t || q) && !value) return Promise.reject(new Error('Vui lòng chọn Phường/Xã'));
                      return Promise.resolve();
                    }
                  })
                ]}
              >
                <Select placeholder="Chọn xã" disabled={!wards.length} onChange={handleWardChange}>
                  {wards.map(w => <Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="wardName" hidden><Input /></Form.Item>
            </Col>
          </Row>
          <Form.Item 
            name="diaChiChiTiet" 
            label="Địa chỉ chi tiết"
            rules={[
              { whitespace: true, message: 'Địa chỉ không được chỉ chứa khoảng trắng' },
              { max: 255, message: 'Địa chỉ không được vượt quá 255 ký tự' }
            ]}
          >
            <Input placeholder="Số nhà, đường... " />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="phiShip" label="Phí vận chuyển"><Input disabled /></Form.Item></Col>
            <Col span={12}><Form.Item name="ngayNhan" label="Ngày nhận hàng"><Input disabled /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="ghiChu" 
                label="Ghi chú"
                rules={[
                  { whitespace: true, message: 'Ghi chú không được chỉ chứa khoảng trắng' },
                  { max: 255, message: 'Ghi chú không được vượt quá 255 ký tự' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

    </div>
  );
};

export default OrderDetailAdmin;
