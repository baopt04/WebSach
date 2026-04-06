import React, { useEffect, useRef } from 'react';
import { Modal, Button, message } from 'antd';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerModal = ({ visible, onCancel, onScanSuccess }) => {
    const html5QrCode = useRef(null);

    useEffect(() => {
        if (visible) {
            const startScanner = async () => {
                try {
                    html5QrCode.current = new Html5Qrcode("reader");
                    const config = {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    };

                    await html5QrCode.current.start(
                        { facingMode: "environment" },
                        config,
                        (decodedText) => {
                            onScanSuccess(decodedText);
                        },
                        (errorMessage) => {
                        }
                    );
                } catch (err) {
                    console.error("Unable to start scanning.", err);
                    message.error("Không thể khởi động camera. Vui lòng cấp quyền truy cập camera.");
                    onCancel();
                }
            };

            const timer = setTimeout(startScanner, 300);
            return () => {
                clearTimeout(timer);
                stopScanner();
            };
        }
    }, [visible]);

    const stopScanner = async () => {
        if (html5QrCode.current && html5QrCode.current.isScanning) {
            try {
                await html5QrCode.current.stop();
                html5QrCode.current.clear();
            } catch (err) {
                console.error("Error stopping scanner", err);
            }
        }
    };

    return (
        <Modal
            title="Quét mã QR / Mã vạch sản phẩm"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>Đóng</Button>
            ]}
            destroyOnClose
            width={450}
            centered
        >
            <div id="reader" style={{ width: '100%', overflow: 'hidden', borderRadius: '8px' }}></div>
            <div style={{ marginTop: 16, textAlign: 'center', color: '#666', fontSize: '14px' }}>
                <p>Vui lòng đưa mã vạch hoặc mã QR vào khung hình</p>
                <p style={{ fontSize: '12px' }}>(Đảm bảo đủ ánh sáng và camera rõ nét)</p>
            </div>
        </Modal>
    );
};

export default QRScannerModal;
