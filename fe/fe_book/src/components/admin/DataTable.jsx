import { Table } from 'antd';

/**
 * DataTable - Bảng dữ liệu dùng chung
 * Tự động thêm cột STT, hỗ trợ phân trang
 *
 * Props:
 * - columns: cột dữ liệu (không cần thêm STT)
 * - dataSource: mảng dữ liệu (cần có key)
 * - loading: boolean
 * - total: tổng số bản ghi (cho phân trang)
 * - pageSize: số bản ghi mỗi trang (default 10)
 * - currentPage: trang hiện tại
 * - onPageChange: (page, pageSize) => void
 * - rowKey: key của mỗi row (default 'id')
 * - scroll: object cho scroll (vd: { x: 1200 })
 */
const DataTable = ({
  columns = [],
  dataSource = [],
  loading = false,
  total = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  rowKey = 'id',
  scroll,
  ...rest
}) => {
  const sttColumn = {
    title: 'STT',
    key: 'stt',
    width: 60,
    align: 'center',
    render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
  };

  const allColumns = [sttColumn, ...columns];

  return (
    <Table
      columns={allColumns}
      dataSource={dataSource}
      loading={loading}
      rowKey={rowKey}
      scroll={scroll || { x: 'max-content' }}
      pagination={
        total > 0
          ? {
              current: currentPage,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `Tổng ${t} bản ghi`,
              pageSizeOptions: ['10', '20', '50'],
              onChange: onPageChange,
            }
          : false
      }
      {...rest}
    />
  );
};

export default DataTable;
