import { Tag } from 'antd';


const defaultMap = {
  active: { color: 'success', label: 'Hoạt động' },
  inactive: { color: 'error', label: 'Ngừng HĐ' },
  activated: { color: 'success', label: 'Hoạt động' },
  blocked: { color: 'error', label: 'Khóa' },
  true: { color: 'success', label: 'Hoạt động' },
  false: { color: 'error', label: 'Ngừng HĐ' },
  1: { color: 'success', label: 'Hoạt động' },
  0: { color: 'error', label: 'Ngừng HĐ' },

  cho_xac_nhan: { color: 'warning', label: 'Chờ xác nhận' },
  da_xac_nhan: { color: 'processing', label: 'Đã xác nhận' },
  dang_chuan_bi_hang: { color: 'cyan', label: 'Đang chuẩn bị hàng' },
  dang_giao: { color: 'purple', label: 'Đang giao' },
  da_giao: { color: 'success', label: 'Đã giao' },
  thanh_cong: { color: 'green', label: 'Thành công' },
  da_huy: { color: 'error', label: 'Đã hủy' },
  rejected: { color: 'error', label: 'Từ chối' },


  expired: { color: 'default', label: 'Hết hạn' },
  used: { color: 'default', label: 'Đã dùng' },

  admin: { color: 'gold', label: 'Admin' },
  staff: { color: 'blue', label: 'Nhân viên' },
  customer: { color: 'cyan', label: 'Khách hàng' },
};

const StatusTag = ({ status, customMap = {} }) => {
  const map = { ...defaultMap, ...customMap };
  const key = String(status).toLowerCase();
  const config = map[key] || { color: 'default', label: status };

  return <Tag color={config.color}>{config.label}</Tag>;
};

export default StatusTag;
