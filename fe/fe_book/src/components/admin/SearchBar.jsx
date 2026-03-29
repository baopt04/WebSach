import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

/**
 * SearchBar - Ô tìm kiếm dùng chung
 *
 * Props:
 * - placeholder: string
 * - onSearch: (value) => void — khi nhấn Enter hoặc icon search
 * - value: string (controlled)
 * - onChange: (e) => void
 * - width: number | string (default '320px')
 * - loading: boolean
 */
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
