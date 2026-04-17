import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, message, Upload, Divider, Input, Space } from 'antd';
import { Html5Qrcode } from 'html5-qrcode';
import { UploadOutlined, CameraOutlined, QrcodeOutlined } from '@ant-design/icons';

const QRScannerModal = ({ visible, onCancel, onScanSuccess }) => {
    const html5QrCode = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [lastScanned, setLastScanned] = useState('');

    useEffect(() => {
        if (visible) {
            setManualCode('');
            setLastScanned('');
            const startScanner = async () => {
                try {
                    html5QrCode.current = new Html5Qrcode("reader");
                    const config = {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    };
                    setScanning(true);
                    await html5QrCode.current.start(
                        { facingMode: "environment" },
                        config,
                        (decodedText) => {
                            console.log('[QR Scanner] Đã quét được:', decodedText);
                            setLastScanned(decodedText);
                            onScanSuccess(decodedText);
                        },
                        () => { }
                    );
                } catch (err) {
                    console.error("Unable to start scanning.", err);
                    message.warning("Không thể khởi động camera. Bạn có thể dùng tính năng Upload ảnh QR bên dưới.");
                    setScanning(false);
                }
            };

            const timer = setTimeout(startScanner, 300);
            return () => {
                clearTimeout(timer);
                stopScanner();
            };
        } else {
            stopScanner();
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
        setScanning(false);
    };

    // Quét QR từ file ảnh upload
    const handleFileUpload = async (file) => {
        try {
            const scanner = new Html5Qrcode("qr-file-reader");
            const result = await scanner.scanFile(file, true);
            console.log('[QR Upload] Đã đọc được:', result);
            scanner.clear();
            message.success(`Đã đọc mã: ${result}`);
            setLastScanned(result);
            onScanSuccess(result);
        } catch (err) {
            console.error('[QR Upload] Lỗi:', err);
            message.error('Không thể đọc mã QR từ ảnh. Hãy thử ảnh khác hoặc nhập thủ công.');
        }
        return false; // Ngăn upload tự động của antd
    };

    const handleManualSubmit = () => {
        const code = manualCode.trim();
        if (!code) {
            message.warning('Vui lòng nhập mã vạch');
            return;
        }
        console.log('[QR Manual] Nhập thủ công:', code);
        onScanSuccess(code);
        setManualCode('');
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
            width={480}
            centered
        >
            {/* Camera scanner */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#1677ff', fontWeight: 500 }}>
                    <CameraOutlined /> Camera
                </div>
                <div id="reader" style={{ width: '100%', overflow: 'hidden', borderRadius: '8px' }}></div>
                <div style={{ marginTop: 8, textAlign: 'center', color: '#666', fontSize: '13px' }}>
                    Đưa mã vào khung hình để quét tự động
                </div>
                {lastScanned && (
                    <div style={{ marginTop: 8, padding: '6px 12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, fontSize: 13, color: '#389e0d' }}>
                        ✅ Đã đọc: <strong>{lastScanned}</strong>
                    </div>
                )}
            </div>

            <Divider>Hoặc</Divider>

            {/* Upload file QR */}
            {/* <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#722ed1', fontWeight: 500 }}>
                    Upload ảnh QR để quét
                </div>
                <div id="qr-file-reader" style={{ display: 'none' }}></div>
                <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={handleFileUpload}
                >
                    <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                        Chọn ảnh QR
                    </Button>
                </Upload>
                <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
                    Dùng khi camera không quét được QR
                </div>
            </div> */}

            <Divider>Nhập QR thủ công</Divider>

            <div>

                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        id="barcode-manual-input"
                        placeholder="Nhập mã vạch sản phẩm thủ công"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        onPressEnter={handleManualSubmit}
                        autoFocus
                        allowClear
                    />
                    <Button type="primary" onClick={handleManualSubmit}>Thêm</Button>
                </Space.Compact>

            </div>
        </Modal>
    );
};

export default QRScannerModal;

