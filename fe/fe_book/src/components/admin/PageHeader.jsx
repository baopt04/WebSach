import { Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PageHeader.css';

const { Title } = Typography;


const PageHeader = ({
  title,
  onAdd,
  addLabel = '', // fallback for older pages
  addText = '',  // fallback for newer pages
  extra,
  showAdd = false,
}) => {
  return (
    <div className="admin-page-header">
      <Title level={4} className="admin-page-title">
        {title}
      </Title>
      <div className="admin-page-header-actions">
        {extra}
        {(showAdd || onAdd) && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
            className="admin-add-btn"
          >
            {addLabel || addText || 'Thêm mới'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
