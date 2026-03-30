

CREATE DATABASE websachvip;
GO
USE websachvip;
GO

---------------------------------------------------
-- TÀI KHOẢN
---------------------------------------------------
CREATE TABLE tai_khoan (
    id INT IDENTITY(1,1) PRIMARY KEY,

    email NVARCHAR(100) UNIQUE NOT NULL,
    mat_khau NVARCHAR(255) NOT NULL,
    ho_ten NVARCHAR(100),
    so_dien_thoai NVARCHAR(15),

    vai_tro NVARCHAR(20) DEFAULT 'ROLE_CUSTOMER' CHECK (vai_tro IN ('ROLE_ADMIN','ROLE_CUSTOMER')),

    trang_thai NVARCHAR(10) DEFAULT 'ACTIVATED' CHECK (trang_thai IN ('ACTIVATED','BLOCKED')),

    ngay_sinh DATETIME2,
    gioi_tinh BIT,

    ngay_tao DATETIME2 DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME2 NULL
);
GO

---------------------------------------------------
-- ĐỊA CHỈ (1 USER - N ADDRESS)
---------------------------------------------------
CREATE TABLE dia_chi (
    id INT IDENTITY(1,1) PRIMARY KEY,

    id_tai_khoan INT,
    id_tinh_thanh INT,
    id_quan_huyen INT,
    id_phuong_xa INT,

    tinh_thanh NVARCHAR(100),
    quan_huyen NVARCHAR(100),
    phuong_xa NVARCHAR(100),

    dia_chi_chi_tiet NVARCHAR(255),

    ngay_tao DATETIME2 DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME2 NULL,

    CONSTRAINT FK_dia_chi_tai_khoan FOREIGN KEY (id_tai_khoan) REFERENCES tai_khoan(id)
);
GO

---------------------------------------------------
-- THỂ LOẠI
---------------------------------------------------
CREATE TABLE the_loai (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_the_loai NVARCHAR(100) NOT NULL,
    ngay_tao DATETIME2 DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME2 NULL
);
GO

---------------------------------------------------
-- NHÀ XUẤT BẢN
---------------------------------------------------
CREATE TABLE nha_xuat_ban (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_nxb NVARCHAR(150) NOT NULL,
    dia_chi NVARCHAR(255),
    so_dien_thoai NVARCHAR(15),
    ngay_tao DATETIME2 DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME2 NULL
);
GO

---------------------------------------------------
-- TÁC GIẢ
---------------------------------------------------
CREATE TABLE tac_gia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ten_tac_gia NVARCHAR(150) NOT NULL,
    tieu_su NVARCHAR(MAX),
    ngay_tao DATETIME2 DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME2 NULL
);
GO

---------------------------------------------------
-- SÁCH
---------------------------------------------------
CREATE TABLE sach (
    id INT IDENTITY(1,1) PRIMARY KEY,

    ma_sach NVARCHAR(20) UNIQUE NOT NULL,
    ma_vach NVARCHAR(500) UNIQUE,

    ten_sach NVARCHAR(255) NOT NULL,

    gia_ban DECIMAL(18,2) NOT NULL CHECK (gia_ban >= 0),
    so_luong INT DEFAULT 0 CHECK (so_luong >= 0),

    so_trang INT CHECK (so_trang > 0),
    ngon_ngu NVARCHAR(50),
    nam_xuat_ban INT,
    kich_thuoc NVARCHAR(50),

    mo_ta NVARCHAR(MAX),

    id_the_loai INT,
    id_nxb INT,

    trang_thai BIT DEFAULT 1,

    ngay_tao DATETIME2 DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME2 NULL,

    CONSTRAINT FK_sach_the_loai FOREIGN KEY (id_the_loai) REFERENCES the_loai(id),
    CONSTRAINT FK_sach_nxb FOREIGN KEY (id_nxb) REFERENCES nha_xuat_ban(id)
);
GO

---------------------------------------------------
-- SÁCH - TÁC GIẢ (N-N)
---------------------------------------------------
CREATE TABLE sach_tac_gia (
    id_sach INT,
    id_tac_gia INT,
    vai_tro NVARCHAR(100),
    ngay_tao DATETIME2 DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME2 NULL,

    CONSTRAINT PK_sach_tac_gia PRIMARY KEY (id_sach, id_tac_gia),
    CONSTRAINT FK_stg_sach FOREIGN KEY (id_sach) REFERENCES sach(id),
    CONSTRAINT FK_stg_tac_gia FOREIGN KEY (id_tac_gia) REFERENCES tac_gia(id)
);
GO

---------------------------------------------------
-- HÌNH ẢNH SÁCH
---------------------------------------------------
CREATE TABLE sach_hinh_anh (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_sach INT,
    duong_dan NVARCHAR(255),
    la_anh_chinh BIT DEFAULT 0,
    ngay_tao DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_hinh_anh_sach FOREIGN KEY (id_sach) REFERENCES sach(id)
);
GO

---------------------------------------------------
-- VOUCHER / MÃ GIẢM GIÁ
---------------------------------------------------
CREATE TABLE ma_giam_gia (
    id INT IDENTITY(1,1) PRIMARY KEY,

    ma_voucher NVARCHAR(50) UNIQUE,
    ten_ma_giam_gia NVARCHAR(200),

    gia_tri_giam DECIMAL(18,2),
    tien_toi_thieu DECIMAL(18,2),

    ngay_bat_dau DATETIME2,
    ngay_ket_thuc DATETIME2,

    so_luong INT,

    trang_thai BIT DEFAULT 1,

    ngay_tao DATETIME2 DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME2 NULL
);
GO

---------------------------------------------------
-- HÓA ĐƠN
---------------------------------------------------
CREATE TABLE hoa_don (
    id INT IDENTITY(1,1) PRIMARY KEY,

    ma_hoa_don NVARCHAR(20) UNIQUE,

    id_khach_hang INT,
    id_nhan_vien INT,

    ho_ten NVARCHAR(100),
    so_dien_thoai NVARCHAR(15),
    email NVARCHAR(100),

    dia_chi_giao_hang NVARCHAR(500),

    tong_tien_hang DECIMAL(18,2) DEFAULT 0,
    phi_ship DECIMAL(18,2) DEFAULT 0,
    giam_gia DECIMAL(18,2) DEFAULT 0,

    trang_thai NVARCHAR(30) CHECK (trang_thai IN (
        'CHO_XAC_NHAN','DA_XAC_NHAN','DANG_CHUAN_BI_HANG',
        'DANG_GIAO','DA_GIAO','DA_HUY','TAO_HOA_DON'
    )),

    phuong_thuc NVARCHAR(20) CHECK (phuong_thuc IN ('CHUYEN_KHOAN','TIEN_MAT')),

    loai_hoa_don NVARCHAR(10) CHECK (loai_hoa_don IN ('OFFLINE','ONLINE')),

    ma_giao_dich_vnpay NVARCHAR(100),

    ngay_xac_nhan DATETIME2,
    ngay_giao_thanh_cong DATETIME2,
    ngay_nhan DATETIME2,

    ghi_chu NVARCHAR(255),

    ngay_tao DATETIME2 DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME2 NULL,

    CONSTRAINT FK_hoa_don_khach_hang FOREIGN KEY (id_khach_hang) REFERENCES tai_khoan(id),
    CONSTRAINT FK_hoa_don_nhan_vien FOREIGN KEY (id_nhan_vien) REFERENCES tai_khoan(id)
);
GO

---------------------------------------------------
-- MÃ GIẢM GIÁ CHI TIẾT
---------------------------------------------------
CREATE TABLE ma_giam_gia_chi_tiet (
    id INT IDENTITY(1,1) PRIMARY KEY,

    id_hoa_don INT UNIQUE,
    id_ma_giam_gia INT,

    so_tien_giam DECIMAL(18,2),
    tien_truoc_khi_giam DECIMAL(18,2),
    tien_sau_khi_giam DECIMAL(18,2),

    ngay_tao DATETIME2 DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME2 NULL,

    CONSTRAINT FK_mgct_hoa_don FOREIGN KEY (id_hoa_don) REFERENCES hoa_don(id),
    CONSTRAINT FK_mgct_ma_giam_gia FOREIGN KEY (id_ma_giam_gia) REFERENCES ma_giam_gia(id)
);
GO
select * from sach
SELECT * FROM sach_hinh_anh ORDER BY id DESC;
SELECT DB_NAME()
SELECT TOP 5 * FROM sach ORDER BY id DESC;
SELECT * FROM sach_hinh_anh WHERE id_sach = 4;

INSERT INTO the_loai (ten_the_loai)
VALUES (N'Tiểu thuyết');

INSERT INTO nha_xuat_ban (ten_nxb, dia_chi, so_dien_thoai)
VALUES (N'NXB Trẻ', N'Hà Nội', '0123456789');

INSERT INTO tac_gia (ten_tac_gia, tieu_su)
VALUES (N'Nguyễn Nhật Ánh', N'Tác giả nổi tiếng');