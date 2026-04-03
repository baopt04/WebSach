import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  Space,
  message,
  Typography,
  Divider,
  Row,
  Modal,
  Col,
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  getSachById,
  createSachMultipart,
  updateSachMultipart,
  getSachImages,
  deleteSachImage
} from '../../services/SachService';
import { getAllTheLoai } from '../../services/TheLoaiService';
import { getAllNhaXuatBan } from '../../services/NhaXuatBanService';
import { getAllTacGia } from '../../services/TacGiaService';
import './AdminPage.css';

const { Title } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

const ProductFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [theLoaiList, setTheLoaiList] = useState([]);
  const [nxbList, setNxbList] = useState([]);
  const [tacGiaList, setTacGiaList] = useState([]);

  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchDropdownData();
    if (isEdit) {
      fetchProductDetail();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [tlRes, nxbRes, tgRes] = await Promise.all([
        getAllTheLoai(),
        getAllNhaXuatBan(),
        getAllTacGia()
      ]);
      setTheLoaiList(Array.isArray(tlRes) ? tlRes : (tlRes?.data || []));
      setNxbList(Array.isArray(nxbRes) ? nxbRes : (nxbRes?.data || []));
      setTacGiaList(Array.isArray(tgRes) ? tgRes : (tgRes?.data || []));
    } catch (error) {
      console.error('Lỗi tải dropdown:', error);
      message.error('Không thể tải dữ liệu Thể loại/NXB/Tác giả');
    }
  };

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const product = await getSachById(id);
      form.setFieldsValue({
        tenSach: product.tenSach,
        giaBan: product.giaBan,
        soLuong: product.soLuong,
        idTheLoai: product.idTheLoai,
        idNxb: product.idNxb,
        idTacGia: product.idTacGia,
        soTrang: product.soTrang,
        ngonNgu: product.ngonNgu,
        namXuatBan: product.namXuatBan ? dayjs(`${product.namXuatBan}-01-01`) : null,
        kichThuoc: product.kichThuoc,
        moTa: product.moTa,
        trangThai: product.trangThai,
      });

      // Load images
      const images = await getSachImages(id);
      const formattedImages = images.map(img => ({
        uid: img.id,
        name: img.tenAnh || `image-${img.id}`,
        status: 'done',
        url: img.duongDan,
      }));
      setFileList(formattedImages);

    } catch (error) {
      message.error('Không thể tải thông tin sản phẩm');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const handleRemove = async (file) => {
    // Nếu là ảnh đã có trên server (có uid từ database)
    if (isEdit && typeof file.uid === 'number') {
      // Gọi API xóa ở background, không chờ
      deleteSachImage(id, file.uid)
        .then(() => message.success('Đã xóa ảnh trên máy chủ'))
        .catch(() => message.error('Lỗi khi xóa ảnh trên máy chủ'));
    }
    // Trả về true để xóa khỏi UI ngay lập tức
    return true;
  };

  const onFinish = (values) => {
    confirm({
      title: isEdit ? 'Xác nhận cập nhật sản phẩm?' : 'Xác nhận thêm sản phẩm mới?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hãy kiểm tra kỹ thông tin trước khi xác nhận.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        setSubmitting(true);
        try {
          // Chuẩn bị dữ liệu JSON
          const productData = { 
            ...values,
            namXuatBan: values.namXuatBan ? values.namXuatBan.year() : null
          };

          // Lọc ra các file mới (chưa có url/không phải từ server)
          const newImages = fileList
            .filter(file => !file.url)
            .map(file => file.originFileObj);

          if (isEdit) {
            await updateSachMultipart(id, productData, newImages);
            message.success('Cập nhật sản phẩm thành công');
          } else {
            await createSachMultipart(productData, newImages);
            message.success('Thêm sản phẩm mới thành công');
          }
          navigate('/admin/products');
        } catch (error) {
          console.error('Lỗi lưu sản phẩm:', error);
          message.error('Lỗi: ' + (error.message || 'Không thể lưu thông tin'));
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  return (
    <div className="admin-page">
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/products')}
        >
          Quay lại danh sách
        </Button>
      </div>

      <Card loading={loading}>
        <Title level={4}>{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</Title>
        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ trangThai: true }}
          requiredMark="optional"
        >
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="tenSach"
                    label="Tên sách"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sách' }]}
                  >
                    <Input placeholder="Ví dụ: Đắc Nhân Tâm" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="giaBan"
                    label="Giá bán (VND)"
                    rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="soLuong"
                    label="Số lượng tồn kho"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                  >
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name="idTacGia"
                    label="Tác giả"
                    rules={[{ required: true, message: 'Vui lòng chọn tác giả' }]}
                  >
                    <Select placeholder="Chọn tác giả" showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} options={tacGiaList.map(tg => ({ value: tg.id, label: tg.tenTacGia }))} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name="idTheLoai"
                    label="Thể loại"
                    rules={[{ required: true, message: 'Vui lòng chọn thể loại' }]}
                  >
                    <Select placeholder="Chọn thể loại" showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} options={theLoaiList.map(tl => ({ value: tl.id, label: tl.tenTheLoai }))} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name="idNxb"
                    label="Nhà xuất bản"
                    rules={[{ required: true, message: 'Vui lòng chọn nhà xuất bản' }]}
                  >
                    <Select placeholder="Chọn NXB" showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} options={nxbList.map(nxb => ({ value: nxb.id, label: nxb.tenNxb }))} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item name="soTrang" label="Số trang">
                    <InputNumber style={{ width: '100%' }} min={1} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item name="namXuatBan" label="Năm xuất bản">
                    <DatePicker 
                      picker="year" 
                      style={{ width: '100%' }} 
                      placeholder="Chọn năm"
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item name="ngonNgu" label="Ngôn ngữ">
                    <Input placeholder="Tiếng Việt" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="kichThuoc" label="Kích thước">
                    <Input placeholder="14 x 20 cm" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item 
                    name="trangThai" 
                    label="Trạng thái kinh doanh"
                  >
                    <Select placeholder="Chọn trạng thái" disabled={!isEdit}>
                      <Select.Option value={true}>Đang kinh doanh</Select.Option>
                      <Select.Option value={false}>Ngừng kinh doanh</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name="moTa" label="Mô tả sản phẩm">
                    <TextArea rows={4} placeholder="Nhập mô tả chi tiết về cuốn sách..." />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col xs={24} lg={8}>
              <Form.Item label="Hình ảnh sản phẩm">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={handlePreview}
                  onChange={handleChange}
                  onRemove={handleRemove}
                  beforeUpload={() => false} // Không upload tự động
                  multiple
                  maxCount={5}
                >
                  {fileList.length >= 5 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                * Bạn có thể chọn tối đa 5 ảnh. Ảnh đầu tiên sẽ là ảnh chính.
              </Typography.Text>
            </Col>
          </Row>

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate('/admin/products')}>Hủy bỏ</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
              >
                {isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      <Modal
        open={previewOpen}
        title="Xem trước ảnh"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default ProductFormPage;
