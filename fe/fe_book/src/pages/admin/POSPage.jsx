import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Input, Button, InputNumber, Select, Divider, Typography,
    Table, Tabs, Space, Tag, Switch, Form, Empty, message, Popconfirm
} from 'antd';
import {
    PlusOutlined, SearchOutlined, DeleteOutlined,
    QrcodeOutlined, ShoppingCartOutlined, UserOutlined,
    CarOutlined, CheckCircleOutlined, CloseOutlined
} from '@ant-design/icons';
import PageHeader from '../../components/admin/PageHeader';
import { getProvinces, getDistricts, getWards, calculateShippingFee, calculateLeadTime } from '../../services/GhnApi';

import ProductSelectModal from '../../components/admin/pos/ProductSelectModal';
import CustomerSelectModal from '../../components/admin/pos/CustomerSelectModal';
import VoucherSelectModal from '../../components/admin/pos/VoucherSelectModal';
import QRScannerModal from '../../components/admin/pos/QRScannerModal';

import './AdminPage.css';
import './POSPage.css';
import { getSachByMaVach as getSachByMaVachService } from '../../services/PosSerivce';
import {
    getAllHoaDon,
    createHoaDon,
    addSachToHoaDon,
    deleteChiTietHoaDon,
    giamSoLuongChiTiet,
    thanhToanHoaDon
} from '../../services/PosSerivce';
import { Modal } from 'antd';

const { Text, Title } = Typography;
const { Option } = Select;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const SHIP_ROUNDING_STEP = 10000;
const roundCurrency = (value) => Math.round((Number(value) || 0) / SHIP_ROUNDING_STEP) * SHIP_ROUNDING_STEP;

const randomDiscountFromMax = (maxDiscount, subtotal, seed = Math.random()) => {
    const max = Math.floor(Number(maxDiscount || 0));
    const maxAllowed = Math.max(0, max - 1); // luôn nhỏ hơn mức trần
    if (maxAllowed <= 0) return 0;

    // Tổng tiền càng cao thì khoảng random càng nghiêng về mức giảm cao hơn
    const tier = clamp(subtotal / 1000000, 0, 1);
    const minFactor = 0.25 + (0.35 * tier); // 25% -> 60%
    const maxFactor = 0.55 + (0.44 * tier); // 55% -> 99%
    const boundedSeed = clamp(seed, 0, 1);
    const factor = minFactor + (boundedSeed * Math.max(0.01, maxFactor - minFactor));
    const discount = Math.floor(maxAllowed * factor);

    return clamp(discount, 1, maxAllowed);
};

const INITIAL_BILL = (id, index) => ({
    id: `bill-${id}`,
    label: index > 0 ? `Hóa đơn ${index}` : "Hóa đơn mới",
    cartItems: [],
    customer: { hoTen: 'Khách lẻ', id: null },
    voucher: null,
    phuongThucThanhToan: 'TIEN_MAT',
    tienKhachDua: null,
    ghiChu: '',
    isDelivery: false,
    shippingInfo: {
        fullname: '', email: '', phone: '',
        province: null, provinceName: '',
        district: null, districtName: '',
        ward: null, wardName: '',
        addressDetail: '',
        shippingFee: 0,
        leadTime: null
    }
});

const POSPage = () => {
    const [bills, setBills] = useState([]);
    const [activeTabKey, setActiveTabKey] = useState(null);
    const [loading, setLoading] = useState(false);

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [isQRScannerModalOpen, setIsQRScannerModalOpen] = useState(false);

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const fetchInvoices = async (selectNewest = false) => {
        setLoading(true);
        try {
            const data = await getAllHoaDon();
            const formattedBills = data.map((item, index) => ({
                ...INITIAL_BILL(item.id, index),
                id: item.id.toString(),
                label: `Hóa đơn ${index + 1}`,
                cartItems: item.chiTiets || [], // Đồng bộ danh sách sản phẩm từ backend
                apiData: item
            }));
            setBills(formattedBills);

            if (formattedBills.length > 0) {
                if (selectNewest) {
                    setActiveTabKey(formattedBills[0].id);
                } else if (!activeTabKey || !formattedBills.find(b => b.id === activeTabKey)) {
                    setActiveTabKey(formattedBills[0].id);
                }
            }
        } catch (error) {
            message.error("Lỗi tải danh sách hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();

        const fetchProvinces = async () => {
            try {
                const data = await getProvinces();
                setProvinces(data.data || []);
            } catch (error) {
                console.error("Lỗi tải tỉnh thành:", error);
            }
        };
        fetchProvinces();
    }, []);

    const activeBill = bills.find(b => b.id === activeTabKey) || bills[0];

    const updateActiveBill = (updates) => {
        if (!activeTabKey) return;
        setBills(prev => prev.map(b => b.id === activeTabKey ? { ...b, ...updates } : b));
    };

    const addBill = async () => {
        if (bills.length >= 10) {
            message.warning("Không thể tạo quá 10 hóa đơn");
            return;
        }
        try {
            await createHoaDon();
            message.success("Tạo hóa đơn mới thành công");
            await fetchInvoices(true);
        } catch (error) {
            message.error("Không thể tạo thêm hóa đơn");
        }
    };
    const removeBill = (targetKey) => {
        if (bills.length === 1) return;
        const newBills = bills.filter(b => b.id !== targetKey);
        setBills(newBills);
        if (activeTabKey === targetKey) {
            setActiveTabKey(newBills[0].id);
        }
    };

    const addToCart = (product) => {
        if (!activeBill) return;

        let quantity = 1;
        Modal.confirm({
            title: `Chọn số lượng cho "${product.tenSach || product.tensach}"`,
            content: (
                <div style={{ marginTop: 16 }}>
                    <Text>Số lượng tồn: <b>{product.soLuong}</b></Text>
                    <div style={{ marginTop: 8 }}>
                        <InputNumber
                            min={1}
                            max={product.soLuong}
                            defaultValue={1}
                            style={{ width: '100%' }}
                            onChange={(val) => quantity = val}
                        />
                    </div>
                    {product.soLuong <= 0 && <Text type="danger">Sản phẩm đã hết hàng!</Text>}
                </div>
            ),
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                if (!quantity || quantity < 1) {
                    message.error("Số lượng phải lớn hơn 0");
                    return Promise.reject();
                }
                if (quantity > product.soLuong) {
                    message.error("Số lượng vượt quá tồn kho!");
                    return Promise.reject();
                }
                try {
                    setLoading(true);
                    await addSachToHoaDon(activeBill.id, {
                        idSach: product.id,
                        soLuong: quantity
                    });
                    message.success("Đã thêm sản phẩm vào hóa đơn");
                    await fetchInvoices();
                } catch (error) {
                    message.error("Không thể thêm sản phẩm");
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleScanQRCode = () => {
        if (!activeBill) return;
        setIsQRScannerModalOpen(true);
    };

    const normalizeScannedCode = (rawCode) => {
        const value = String(rawCode || '').trim();
        if (!value) return '';

        // Hỗ trợ trường hợp QR chứa URL có tham số mã vạch
        if (/^https?:\/\//i.test(value)) {
            try {
                const url = new URL(value);
                const candidate = url.searchParams.get('maVach') || url.searchParams.get('barcode') || url.searchParams.get('code');
                return (candidate || value).trim();
            } catch {
                return value;
            }
        }
        return value;
    };

    const handleScanSuccess = async (code) => {
        setIsQRScannerModalOpen(false);
        try {
            setLoading(true);
            const normalizedCode = normalizeScannedCode(code);
            if (!normalizedCode) {
                message.error("Mã quét được đang rỗng hoặc không hợp lệ");
                return;
            }

            const product = await getSachByMaVachService(normalizedCode);
            if (product) {
                await addSachToHoaDon(activeBill.id, {
                    idSach: product.id,
                    soLuong: 1
                });
                message.success(`Đã thêm "${product.tenSach}" vào hóa đơn`);
                await fetchInvoices();
            } else {
                message.error("Không tìm thấy sản phẩm có mã: " + normalizedCode);
            }
        } catch (error) {
            message.error("Lỗi khi quét hoặc thêm sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const removeProduct = (record) => {
        if (!activeBill) return;
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc muốn xóa "${record.tenSach}" khỏi hóa đơn?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    setLoading(true);
                    await deleteChiTietHoaDon(activeBill.id, record.id);
                    message.success("Đã xóa sản phẩm");
                    await fetchInvoices();
                } catch (error) {
                    message.error("Lỗi khi xóa sản phẩm");
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const updateProductQty = async (record, val) => {
        if (!activeBill || val == null) return;
        const qty = Number(val);
        if (!Number.isFinite(qty) || qty < 1 || qty === record.soLuong) return;

        try {
            setLoading(true);
            if (qty > record.soLuong) {
                const delta = qty - record.soLuong;
                await addSachToHoaDon(activeBill.id, {
                    idSach: record.idSach,
                    soLuong: delta
                });
            } else {
                const soLuongGiam = record.soLuong - qty;
                await giamSoLuongChiTiet(activeBill.id, record.id, soLuongGiam);
            }
            await fetchInvoices();
        } catch (error) {
            message.error(
                qty > record.soLuong
                    ? "Lỗi tăng số lượng. Có thể do vượt quá tồn kho."
                    : "Lỗi giảm số lượng."
            );
            await fetchInvoices();
        } finally {
            setLoading(false);
        }
    };

    const handleProvinceChange = async (val) => {
        const province = provinces.find(p => p.ProvinceID === val);
        updateActiveBill({
            shippingInfo: {
                ...activeBill.shippingInfo,
                province: val,
                provinceName: province?.ProvinceName || '',
                district: null,
                districtName: '',
                ward: null,
                wardName: ''
            }
        });
        try {
            const data = await getDistricts(val);
            setDistricts(data.data || []);
            setWards([]);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDistrictChange = async (val) => {
        const district = districts.find(d => d.DistrictID === val);
        updateActiveBill({
            shippingInfo: {
                ...activeBill.shippingInfo,
                district: val,
                districtName: district?.DistrictName || '',
                ward: null,
                wardName: '',
                shippingFee: 0,
                leadTime: null
            }
        });
        try {
            const data = await getWards(val);
            setWards(data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleWardChange = async (val) => {
        const ward = wards.find(w => w.WardCode === val);
        updateActiveBill({
            shippingInfo: {
                ...activeBill.shippingInfo,
                ward: val,
                wardName: ward?.WardName || ''
            }
        });

        try {
            const [feeRes, leadTimeRes] = await Promise.all([
                calculateShippingFee({
                    toDistrictId: activeBill.shippingInfo.district,
                    toWardCode: val
                }),
                calculateLeadTime({
                    toDistrictId: activeBill.shippingInfo.district,
                    toWardCode: val
                })
            ]);

            updateActiveBill({
                shippingInfo: {
                    ...activeBill.shippingInfo,
                    ward: val,
                    wardName: ward?.WardName || '',
                    shippingFee: roundCurrency(feeRes.data.total),
                    leadTime: leadTimeRes.data.leadtime
                }
            });
            message.success("Đã cập nhật phí vận chuyển và ngày giao dự kiến");
        } catch (error) {
            console.error("Lỗi GHN:", error);
            message.error("Không thể tính phí vận chuyển");
        }
    };

    const cartColumns = [
        { title: 'STT', key: 'stt', render: (t, r, idx) => idx + 1, width: 50 },
        {
            title: 'Ảnh',
            dataIndex: 'hinhAnh',
            key: 'hinhAnh',
            render: (url) => <img src={url} alt="book" style={{ width: 40, height: 50, objectFit: 'cover' }} />,
            width: 80
        },
        { title: 'Tên sản phẩm', dataIndex: 'tenSach', key: 'tenSach' },
        {
            title: 'Số lượng',
            dataIndex: 'soLuong',
            key: 'soLuong',
            render: (soLuong, record) => (
                <InputNumber min={1} value={soLuong} onChange={(val) => updateProductQty(record, val)} />
            ),
            width: 100
        },
        {
            title: 'Tổng tiền',
            key: 'total',
            render: (_, record) => `${(record.donGia * record.soLuong).toLocaleString('vi-VN')}₫`,
            width: 120
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeProduct(record)}
                />
            ),
            width: 80
        },
    ];

    const subtotal = activeBill?.cartItems?.reduce((sum, item) => sum + item.donGia * item.soLuong, 0) || 0;

    let discount = 0;
    if (activeBill?.voucher) {
        if (activeBill.voucher.giaTriGiam <= 100) {
            const p = activeBill.voucher.giaTriGiam / 100;
            let calculated = subtotal * p;
            if (activeBill.voucher.giamToiDa) {
                calculated = Math.min(calculated, activeBill.voucher.giamToiDa);
            }
            discount = randomDiscountFromMax(calculated, subtotal, activeBill.voucherSeed);
        } else {
            discount = activeBill.voucher.giaTriGiam;
        }
    }

    const shippingFee = activeBill?.isDelivery ? roundCurrency(activeBill.shippingInfo.shippingFee) : 0;
    const finalTotal = Math.max(0, subtotal + shippingFee - discount);
    const tienKhachDua = Number(activeBill?.tienKhachDua || 0);
    const tienThua = Math.max(0, tienKhachDua - finalTotal);

    const resetCustomer = () => {
        if (!activeBill) return;
        updateActiveBill({
            customer: { hoTen: 'Khách lẻ', id: null },
            shippingInfo: {
                ...activeBill.shippingInfo,
                fullname: '',
                phone: '',
                email: ''
            }
        });
        message.info("Đã quay về khách lẻ");
    };

    const handleConfirmPayment = async () => {
        if (!activeBill || activeBill.cartItems.length === 0) {
            message.error("Giỏ hàng trống!");
            return;
        }

        const { shippingInfo, customer, voucher, phuongThucThanhToan, ghiChu, isDelivery } = activeBill;

        if (ghiChu && ghiChu.length > 255) {
            message.error("Ghi chú không được vượt quá 255 ký tự");
            return;
        }

        if (phuongThucThanhToan === 'TIEN_MAT') {
            const soTienKhachDua = Number(activeBill.tienKhachDua);
            if (!Number.isFinite(soTienKhachDua) || soTienKhachDua <= 0) {
                message.error("Vui lòng nhập số tiền khách đưa");
                return;
            }
            if (soTienKhachDua < finalTotal) {
                message.error("Số tiền khách đưa không được nhỏ hơn tổng tiền đơn hàng");
                return;
            }
        }

        if (isDelivery) {
            if (!shippingInfo.fullname || !shippingInfo.fullname.trim()) {
                message.error("Vui lòng nhập họ tên người nhận");
                return;
            }
            if (!shippingInfo.phone || !shippingInfo.phone.trim()) {
                message.error("Vui lòng nhập số điện thoại");
                return;
            }
            const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b$/;
            if (!phoneRegex.test(shippingInfo.phone.trim())) {
                message.error("Số điện thoại không hợp lệ (Bắt đầu bằng 03,05,07,08,09 và đủ 10 số)");
                return;
            }
            if (shippingInfo.email && shippingInfo.email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(shippingInfo.email.trim())) {
                    message.error("Email không đúng định dạng");
                    return;
                }
            }
            if (!shippingInfo.province || !shippingInfo.district || !shippingInfo.ward) {
                message.error("Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã");
                return;
            }
            if (!shippingInfo.addressDetail || !shippingInfo.addressDetail.trim()) {
                message.error("Vui lòng nhập địa chỉ chi tiết");
                return;
            }
        }

        Modal.confirm({
            title: 'Xác nhận thanh toán',
            content: `Bạn có chắc chắn muốn thanh toán hóa đơn ${activeBill.label} không?`,
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    setLoading(true);

                    const requestData = {
                        phuongThucThanhToan: phuongThucThanhToan || 'TIEN_MAT',
                        ghiChu: ghiChu ? ghiChu.trim() : '',
                        hinhThucNhanHang: isDelivery ? 'GIAO_HANG' : 'TAI_QUAY',
                        maVoucher: voucher?.maVoucher || null,
                        soTienGiamVoucher: voucher ? discount : 0,
                        idKhachHang: customer?.id || null, // idKhachHang chỉ gửi nếu đã chọn khách hàng
                        hoTen: isDelivery ? shippingInfo.fullname.trim() : customer.hoTen,
                        soDienThoai: isDelivery ? shippingInfo.phone.trim() : customer.soDienThoai,
                        email: isDelivery ? (shippingInfo.email ? shippingInfo.email.trim() : '') : customer.email
                    };

                    if (isDelivery) {
                        const diaChiDayDu = `${shippingInfo.addressDetail.trim()}, ${shippingInfo.wardName}, ${shippingInfo.districtName}, ${shippingInfo.provinceName}`;
                        requestData.diaChiGiaoHang = diaChiDayDu;
                        requestData.phiShip = roundCurrency(shippingInfo.shippingFee);
                        if (shippingInfo.leadTime) {
                            const date = new Date(shippingInfo.leadTime * 1000);
                            requestData.ngayNhan = date.toISOString().split('T')[0];
                        }
                    }

                    await thanhToanHoaDon(activeBill.id, requestData);
                    message.success(
                        isDelivery
                            ? `Thanh toán hóa đơn thành công`
                            : `Thanh toán hóa đơn thành công!`
                    );
                    await fetchInvoices();
                } catch (error) {
                    message.error("Thanh toán thất bại: " + error.message);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <div className="admin-page">
            <PageHeader
                title="Quản lý bán hàng"
                showAdd={true}
                addText="Tạo hóa đơn"
                onAdd={addBill}
            />

            <Tabs
                type="editable-card"
                onChange={setActiveTabKey}
                activeKey={activeTabKey}
                onEdit={(targetKey, action) => {
                    if (action === 'remove') removeBill(targetKey);
                    else addBill();
                }}
                hideAdd={bills.length >= 10}
                items={bills.map(bill => ({
                    label: bill.label,
                    key: bill.id,
                    closable: false,
                    children: (
                        <Row gutter={16}>
                            <Col xs={24} lg={16}>
                                <Card
                                    title="Thông tin sản phẩm"
                                    extra={
                                        <Space>
                                            <Button icon={<QrcodeOutlined />} onClick={handleScanQRCode}>QR Code</Button>
                                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsProductModalOpen(true)}>
                                                Thêm sản phẩm
                                            </Button>
                                        </Space>
                                    }
                                >
                                    <Table
                                        dataSource={bill.cartItems}
                                        columns={cartColumns}
                                        rowKey="id"
                                        pagination={false}
                                        locale={{ emptyText: <Empty description="Chưa có sản phẩm nào" /> }}
                                    />
                                </Card>

                                <Card title="Tài khoản" style={{ marginTop: 16 }}>
                                    <Row justify="space-between" align="top">
                                        <Col flex="1">
                                            <Space direction="vertical" size={4}>
                                                <Space>
                                                    <UserOutlined />
                                                    <Text>Khách hàng: <b>{bill.customer.hoTen}</b></Text>
                                                    {bill.customer.id && <Tag color="blue">Thành viên</Tag>}
                                                </Space>
                                                {bill.customer.id && (
                                                    <div style={{ paddingLeft: 24, fontSize: '13px', color: '#666' }}>
                                                        <div>Số điện thoại: {bill.customer.soDienThoai}</div>
                                                        <div>Email: {bill.customer.email}</div>
                                                    </div>
                                                )}
                                            </Space>
                                        </Col>
                                        <Col>
                                            <Space>
                                                <Button type="primary" ghost onClick={() => setIsCustomerModalOpen(true)}>Chọn tài khoản</Button>
                                                {bill.customer.id && (
                                                    <Button danger onClick={resetCustomer}>Hủy</Button>
                                                )}
                                            </Space>
                                        </Col>
                                    </Row>
                                </Card>

                                {bill.isDelivery && (
                                    <Card title="Thông tin giao hàng" style={{ marginTop: 16 }}>
                                        <Form layout="vertical">
                                            <Form.Item label="Họ tên người nhận" required>
                                                <Input
                                                    maxLength={100}
                                                    value={bill.shippingInfo.fullname}
                                                    onChange={e => updateActiveBill({ shippingInfo: { ...bill.shippingInfo, fullname: e.target.value } })}
                                                />
                                            </Form.Item>
                                            <Row gutter={8}>
                                                <Col span={12}>
                                                    <Form.Item label="Số điện thoại" required>
                                                        <Input
                                                            maxLength={10}
                                                            value={bill.shippingInfo.phone}
                                                            onChange={e => updateActiveBill({ shippingInfo: { ...bill.shippingInfo, phone: e.target.value.replace(/\D/g, '') } })}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item label="Email">
                                                        <Input
                                                            maxLength={255}
                                                            type="email"
                                                            value={bill.shippingInfo.email}
                                                            onChange={e => updateActiveBill({ shippingInfo: { ...bill.shippingInfo, email: e.target.value } })}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Form.Item label="Tỉnh/Thành phố" required>
                                                <Select
                                                    value={bill.shippingInfo.province}
                                                    onChange={handleProvinceChange}
                                                    placeholder="Chọn tỉnh/thành"
                                                >
                                                    {provinces.map(p => (
                                                        <Option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Row gutter={8}>
                                                <Col span={12}>
                                                    <Form.Item label="Quận/Huyện" required>
                                                        <Select
                                                            value={bill.shippingInfo.district}
                                                            onChange={handleDistrictChange}
                                                            placeholder="Chọn quận/huyện"
                                                        >
                                                            {districts.map(d => (
                                                                <Option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={12}>
                                                    <Form.Item label="Phường/Xã" required>
                                                        <Select
                                                            value={bill.shippingInfo.ward}
                                                            onChange={handleWardChange}
                                                            placeholder="Chọn phường/xã"
                                                        >
                                                            {wards.map(w => (
                                                                <Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            {bill.shippingInfo.leadTime && (
                                                <div style={{ marginBottom: 16, color: '#1677ff', fontWeight: '500' }}>
                                                    <CheckCircleOutlined /> Ngày giao dự kiến: {new Date(bill.shippingInfo.leadTime * 1000).toLocaleDateString('vi-VN')}
                                                </div>
                                            )}
                                            <Form.Item label="Địa chỉ chi tiết" required>
                                                <Input.TextArea
                                                    rows={2}
                                                    maxLength={255}
                                                    value={bill.shippingInfo.addressDetail}
                                                    onChange={e => updateActiveBill({ shippingInfo: { ...bill.shippingInfo, addressDetail: e.target.value } })}
                                                />
                                            </Form.Item>
                                        </Form>
                                    </Card>
                                )}
                            </Col>

                            <Col xs={24} lg={8}>
                                <Card title="Thông tin thanh toán">
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            {/* <div style={{ marginBottom: 16 }}>
                                                <Text strong>Phương thức thanh toán</Text>
                                                <Select
                                                    style={{ width: '100%', marginTop: 8 }}
                                                    value={bill.phuongThucThanhToan}
                                                    onChange={val => updateActiveBill({ phuongThucThanhToan: val })}
                                                >
                                                    <Option value="TIEN_MAT">Tiền mặt</Option>
                                                    <Option value="CHUYEN_KHOAN">Chuyển khoản</Option>
                                                </Select>
                                            </div> */}

                                            <div style={{ marginBottom: 16 }}>
                                                <Text strong>Ghi chú đơn hàng</Text>
                                                <Input.TextArea
                                                    rows={2}
                                                    maxLength={255}
                                                    style={{ marginTop: 8 }}
                                                    placeholder="Nhập ghi chú cho hóa đơn..."
                                                    value={bill.ghiChu}
                                                    onChange={e => updateActiveBill({ ghiChu: e.target.value })}
                                                />
                                            </div>

                                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                                <Input
                                                    placeholder="Chọn mã giảm giá"
                                                    style={{ flex: 1, color: 'rgba(0, 0, 0, 0.85)' }}
                                                    value={bill.voucher?.tenMaGiamGia || ''}
                                                    disabled
                                                />
                                                {bill.voucher && (
                                                    <Button danger onClick={() => updateActiveBill({ voucher: null })}>Xóa</Button>
                                                )}
                                                <Button onClick={() => setIsVoucherModalOpen(true)}>Chọn mã</Button>
                                            </div>

                                            <Space style={{ marginBottom: 16 }}>
                                                <Switch
                                                    checked={bill.isDelivery}
                                                    onChange={(val) => updateActiveBill({ isDelivery: val })}
                                                />
                                                <Text><CarOutlined /> Giao hàng</Text>
                                            </Space>
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <div className="pos-summary">
                                        <Row justify="space-between">
                                            <Text>Tiền hàng:</Text>
                                            <Text>{subtotal.toLocaleString('vi-VN')}₫</Text>
                                        </Row>
                                        {activeBill.isDelivery && (
                                            <Row justify="space-between">
                                                <Text>Phí vận chuyển:</Text>
                                                <Text>{shippingFee.toLocaleString('vi-VN')}₫</Text>
                                            </Row>
                                        )}
                                        <Row justify="space-between">
                                            <Text>Giảm giá:</Text>
                                            <Text type="danger">-{discount.toLocaleString('vi-VN')}₫</Text>
                                        </Row>
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Row justify="space-between">
                                            <Title level={4} style={{ margin: 0 }}>Tổng tiền:</Title>
                                            <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
                                                {finalTotal.toLocaleString('vi-VN')}₫
                                            </Title>
                                        </Row>
                                    </div>

                                    {bill.phuongThucThanhToan === 'TIEN_MAT' && (
                                        <div style={{ marginTop: 16 }}>
                                            <Text strong>Tiền khách đưa</Text>
                                            <InputNumber
                                                style={{ width: '100%', marginTop: 8 }}
                                                min={0}
                                                step={1000}
                                                value={bill.tienKhachDua}
                                                placeholder="Nhập số tiền khách thanh toán"
                                                formatter={(value) => value ? `${Number(value).toLocaleString('vi-VN')}₫` : ''}
                                                parser={(value) => value ? value.replace(/[^\d]/g, '') : ''}
                                                onChange={(val) => updateActiveBill({ tienKhachDua: val == null ? null : Number(val) })}
                                            />
                                            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                                                <Text type="secondary">Tiền thừa trả khách:</Text>
                                                <Text strong style={{ color: '#1677ff' }}>
                                                    {(Math.max(0, Number(bill.tienKhachDua || 0) - finalTotal)).toLocaleString('vi-VN')}₫
                                                </Text>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        style={{ marginTop: 16 }}
                                        icon={<CheckCircleOutlined />}
                                        loading={loading}
                                        onClick={handleConfirmPayment}
                                    >
                                        Xác nhận thanh toán
                                    </Button>
                                </Card>
                            </Col>
                        </Row>
                    )
                }))}
            />

            <ProductSelectModal
                visible={isProductModalOpen}
                onCancel={() => setIsProductModalOpen(false)}
                onSelect={addToCart}
            />

            <CustomerSelectModal
                visible={isCustomerModalOpen}
                onCancel={() => setIsCustomerModalOpen(false)}
                onSelect={(customer) => {
                    if (!activeBill) return;
                    updateActiveBill({
                        customer,
                        shippingInfo: {
                            ...activeBill.shippingInfo,
                            fullname: customer.hoTen,
                            phone: customer.soDienThoai,
                            email: customer.email
                        }
                    });
                    setIsCustomerModalOpen(false);
                    message.success("Đã chọn khách hàng và tự động điền thông tin");
                }}
            />

            <VoucherSelectModal
                visible={isVoucherModalOpen}
                onCancel={() => setIsVoucherModalOpen(false)}
                onSelect={(voucher) => {
                    updateActiveBill({ voucher, voucherSeed: Math.random() });
                    setIsVoucherModalOpen(false);
                }}
                minAmount={subtotal}
            />

            <QRScannerModal
                visible={isQRScannerModalOpen}
                onCancel={() => setIsQRScannerModalOpen(false)}
                onScanSuccess={handleScanSuccess}
            />
        </div>
    );
};

export default POSPage;
