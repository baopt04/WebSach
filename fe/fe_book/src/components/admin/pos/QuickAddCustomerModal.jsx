import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { createTaiKhoan } from '../../../services/AccountService';

const QuickAddCustomerModal = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Mocking creation for POS quick add
            // In a real app, you might need more fields, but for quick add, we'll send name and phone
            const payload = {
                hoten: values.hoten,
                sodienthoai: values.sdt,
                email: `${values.sdt}@pos-quick-add.com`, // dummy email if required by backend
                matkhau: '123456', // default password
                vaitro: 'CUSTOMER'
            };

            await createTaiKhoan(payload);
            message.success("Thêm khách hàng thành công!");
            onSuccess();
            form.resetFields();
        } catch (error) {
            console.error("Lỗi thêm khách hàng:", error);
            message.error("Không thể thêm khách hàng nhanh");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Thêm nhanh khách hàng"
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Thêm"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="hoten"
                    label="Tên khách hàng"
                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                >
                    <Input placeholder="Nhập họ tên" />
                </Form.Item>
                <Form.Item
                    name="sdt"
                    label="Số điện thoại"
                    rules={[
                        { required: true, message: 'Vui lòng nhập SĐT' },
                        { pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' }
                    ]}
                >
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default QuickAddCustomerModal;
