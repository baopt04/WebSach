import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { createKhachHangNhanh } from '../../../services/PosSerivce';

const QuickAddCustomerModal = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            Modal.confirm({
                title: 'Xác nhận thêm khách hàng?',
                content: `Bạn có chắc chắn muốn thêm khách hàng ${values.hoten} với số điện thoại ${values.sdt}?`,
                okText: 'Xác nhận',
                cancelText: 'Hủy',
                onOk: async () => {
                    setLoading(true);
                    try {
                        const payload = {
                            hoTen: values.hoten,
                            soDienThoai: values.sdt
                        };

                        await createKhachHangNhanh(payload);
                        message.success("Thêm khách hàng thành công!");
                        onSuccess();
                        form.resetFields();
                    } catch (error) {
                        console.error("Lỗi thêm khách hàng:", error);
                        message.error("Không thể thêm khách hàng nhanh");
                    } finally {
                        setLoading(false);
                    }
                }
            });
        } catch (error) {
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
