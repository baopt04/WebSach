import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const SearchBar = ({
  placeholder = 'Tìm kiếm...',
  onSearch,
  value,
  onChange,
  width = 320,
  loading = false,
}) => {
  return (
    <Input.Search
      placeholder={placeholder}
      onSearch={onSearch}
      value={value}
      onChange={onChange}
      loading={loading}
      allowClear
      enterButton={<SearchOutlined />}
      style={{ width }}
    />
  );
};

export default SearchBar;
