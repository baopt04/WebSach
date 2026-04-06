import { Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './PageHeader.css';

const { Title } = Typography;


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
