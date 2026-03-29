import { Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PageHeader.css';

const { Title } = Typography;

/**
 * PageHeader - Tiêu đề trang + nút Thêm mới
 *
 * Props:
 * - title: string
 * - onAdd: () => void — callback khi nhấn nút thêm
 * - addLabel: string (default 'Thêm mới')
 * - extra: ReactNode — node tùy chỉnh thay thế nút thêm mới
 * - showAdd: boolean (default true)
 */
const PageHeader = ({
  title,
  onAdd,
  addLabel = 'Thêm mới',
  extra,
  showAdd = true,
}) => {
  return (
    <div className="admin-page-header">
      <Title level={4} className="admin-page-title">
        {title}
      </Title>
      <div className="admin-page-header-actions">
        {extra}
        {showAdd && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
            className="admin-add-btn"
          >
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
