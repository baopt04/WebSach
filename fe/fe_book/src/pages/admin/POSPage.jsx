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
import { getProvinces, getDistricts, getWards } from '../../services/GhnApi';

// New Sub-components
// import ProductSelectModal from '../../components/admin/pos/ProductSelectModal';
import CustomerSelectModal from '../../components/admin/pos/CustomerSelectModal';
import VoucherSelectModal from '../../components/admin/pos/VoucherSelectModal';

import './AdminPage.css';
import './POSPage.css';

const { Text, Title } = Typography;
const { Option } = Select;

const INITIAL_BILL = (id, index) => ({
    id: `bill-${id}`,
    label: `Hóa đơn ${index}`,
    cartItems: [],
    customer: { hoten: 'Khách lẻ', id: null },
    voucher: null,
    isDelivery: false,
    shippingInfo: {
        fullname: '', email: '', phone: '',
        province: null, district: null, ward: null,
        addressDetail: ''
    }
});

const POSPage = () => {
    const [bills, setBills] = useState([INITIAL_BILL(Date.now(), 1)]);
    const [activeTabKey, setActiveTabKey] = useState(bills[0].id);
    const [idCounter, setIdCounter] = useState(2);

    // Modal States
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

    // Delivery API Data
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
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
        setBills(prev => prev.map(b => b.id === activeTabKey ? { ...b, ...updates } : b));
    };

    const addBill = () => {
        if (bills.length >= 10) {
            message.warning("Chỉ được tạo tối đa 10 hóa đơn");
            return;
        }
        const newBill = INITIAL_BILL(Date.now(), idCounter);
        setBills([...bills, newBill]);
        setActiveTabKey(newBill.id);
        setIdCounter(idCounter + 1);
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
        const currentCart = [...activeBill.cartItems];
        const existing = currentCart.find(item => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            currentCart.push({ ...product, qty: 1 });
        }
        updateActiveBill({ cartItems: currentCart });
        setIsProductModalOpen(false);
        message.success(`Đã thêm ${product.tensach} vào giỏ`);
    };

    const removeProduct = (id) => {
        updateActiveBill({ cartItems: activeBill.cartItems.filter(item => item.id !== id) });
    };

    const updateProductQty = (id, qty) => {
        if (qty < 1) return;
        updateActiveBill({
            cartItems: activeBill.cartItems.map(item => item.id === id ? { ...item, qty } : item)
        });
    };

    const handleProvinceChange = async (val) => {
        updateActiveBill({ shippingInfo: { ...activeBill.shippingInfo, province: val, district: null, ward: null } });
        try {
            const data = await getDistricts(val);
            setDistricts(data.data || []);
            setWards([]);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDistrictChange = async (val) => {
        updateActiveBill({ shippingInfo: { ...activeBill.shippingInfo, district: val, ward: null } });
        try {
            const data = await getWards(val);
            setWards(data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const cartColumns = [
        { title: 'STT', key: 'stt', render: (t, r, idx) => idx + 1, width: 50 },
        { title: 'Ảnh', dataIndex: 'hinhanh', key: 'hinhanh', render: (url) => <img src={url} alt="book" style={{ width: 40, height: 50, objectFit: 'cover' }} />, width: 80 },
        { title: 'Tên sản phẩm', dataIndex: 'tensach', key: 'tensach' },
        {
            title: 'Số lượng',
            dataIndex: 'qty',
            key: 'qty',
            render: (qty, record) => (
                <InputNumber min={1} value={qty} onChange={(val) => updateProductQty(record.id, val)} />
            ),
            width: 100
        },
        {
            title: 'Tổng tiền',
            key: 'total',
            render: (_, record) => `${(record.gia * record.qty).toLocaleString('vi-VN')}₫`,
            width: 120
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => removeProduct(record.id)}>
                    <Button danger type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
            width: 80
        },
    ];

    const subtotal = activeBill.cartItems.reduce((sum, item) => sum + item.gia * item.qty, 0);
    const discount = activeBill.voucher ? activeBill.voucher.giatrigiam : 0;
    const finalTotal = Math.max(0, subtotal - discount);

    const handleConfirmPayment = () => {
        if (activeBill.cartItems.length === 0) {
            message.error("Giỏ hàng trống!");
            return;
        }
        message.success("Thanh toán thành công cho " + activeBill.label);
        removeBill(activeBill.id);
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
                    closable: bills.length > 1,
                    children: (
                        <Row gutter={16}>
                            <Col xs={24} lg={16}>
                                <Card
                                    title="Thông tin sản phẩm"
                                    extra={
                                        <Space>
                                            <Button icon={<QrcodeOutlined />}>QR Code</Button>
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
                                    <Row justify="space-between" align="middle">
                                        <Col>
                                            <Space>
                                                <UserOutlined />
                                                <Text>Khách hàng: <b>{bill.customer.hoten}</b></Text>
                                            </Space>
                                        </Col>
                                        <Col>
                                            <Button onClick={() => setIsCustomerModalOpen(true)}>Chọn tài khoản</Button>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            <Col xs={24} lg={8}>
                                <Card title="Thông tin thanh toán">
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                                <Select
                                                    placeholder="Chọn mã giảm giá"
                                                    style={{ flex: 1 }}
                                                    value={bill.voucher?.id}
                                                    allowClear
                                                    onClear={() => updateActiveBill({ voucher: null })}
                                                >
                                                    {bill.voucher && <Option value={bill.voucher.id}>{bill.voucher.tenma}</Option>}
                                                </Select>
                                                <Button onClick={() => setIsVoucherModalOpen(true)}>Chọn mã</Button>
                                            </div>

                                            <Space style={{ marginBottom: 16 }}>
                                                <Switch
                                                    checked={bill.isDelivery}
                                                    onChange={(val) => updateActiveBill({ isDelivery: val })}
                                                />
                                                <Text><CarOutlined /> Giao hàng</Text>
                                            </Space>

                                            {bill.isDelivery && (
                                                <div className="delivery-form">
                                                    <Form layout="vertical">
                                                        <Form.Item label="Họ tên người nhận">
                                                            <Input
                                                                value={bill.shippingInfo.fullname}
                                                                onChange={e => updateActiveBill({ shippingInfo: { ...bill.shippingInfo, fullname: e.target.value } })}
                                                            />
                                                        </Form.Item>
                                                        <Row gutter={8}>
                                                            <Col span={12}>
                                                                <Form.Item label="Số điện thoại">
                                                                    <Input
                                                                        value={bill.shippingInfo.phone}
                                                                        onChange={e => updateActiveBill({ shippingInfo: { ...bill.shippingInfo, phone: e.target.value } })}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Form.Item label="Email">
                                                                    <Input
                                                                        value={bill.shippingInfo.email}
                                                                        onChange={e => updateActiveBill({ shippingInfo: { ...bill.shippingInfo, email: e.target.value } })}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                        <Form.Item label="Tỉnh/Thành phố">
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
                                                                <Form.Item label="Quận/Huyện">
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
                                                                <Form.Item label="Phường/Xã">
                                                                    <Select
                                                                        value={bill.shippingInfo.ward}
                                                                        onChange={(val) => updateActiveBill({ shippingInfo: { ...bill.shippingInfo, ward: val } })}
                                                                        placeholder="Chọn phường/xã"
                                                                    >
                                                                        {wards.map(w => (
                                                                            <Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Option>
                                                                        ))}
                                                                    </Select>
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                        <Form.Item label="Địa chỉ chi tiết">
                                                            <Input.TextArea
                                                                rows={2}
                                                                value={bill.shippingInfo.addressDetail}
                                                                onChange={e => updateActiveBill({ shippingInfo: { ...bill.shippingInfo, addressDetail: e.target.value } })}
                                                            />
                                                        </Form.Item>
                                                    </Form>
                                                </div>
                                            )}
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <div className="pos-summary">
                                        <Row justify="space-between">
                                            <Text>Tiền hàng:</Text>
                                            <Text>{subtotal.toLocaleString('vi-VN')}₫</Text>
                                        </Row>
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

                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        style={{ marginTop: 16 }}
                                        icon={<CheckCircleOutlined />}
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

            {/* <ProductSelectModal
                visible={isProductModalOpen}
                onCancel={() => setIsProductModalOpen(false)}
                onSelect={addToCart}
            /> */}

            <CustomerSelectModal
                visible={isCustomerModalOpen}
                onCancel={() => setIsCustomerModalOpen(false)}
                onSelect={(customer) => {
                    updateActiveBill({ customer });
                    setIsCustomerModalOpen(false);
                }}
            />

            <VoucherSelectModal
                visible={isVoucherModalOpen}
                onCancel={() => setIsVoucherModalOpen(false)}
                onSelect={(voucher) => {
                    updateActiveBill({ voucher });
                    setIsVoucherModalOpen(false);
                }}
                minAmount={subtotal}
            />
        </div>
    );
};

export default POSPage;
