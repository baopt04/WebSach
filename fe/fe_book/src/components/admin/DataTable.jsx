import { Table } from 'antd';

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
