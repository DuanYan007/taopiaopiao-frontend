-- 淘票票系统 - 数据库建表SQL
-- 对应 admin-event-edit.html 和 admin-session-edit.html 表单

-- 1. 场馆表
CREATE TABLE venues (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '场馆名称',
  city VARCHAR(50) NOT NULL COMMENT '所在城市',
  district VARCHAR(50) COMMENT '所在区域',
  address VARCHAR(500) NOT NULL COMMENT '详细地址',
  latitude DECIMAL(10,6) COMMENT '纬度',
  longitude DECIMAL(10,6) COMMENT '经度',
  capacity INT COMMENT '容纳人数',
  facilities JSON COMMENT '设施数组',
  description TEXT COMMENT '场馆介绍',
  images JSON COMMENT '场馆图片',
  metadata JSON COMMENT '扩展字段',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='场馆表';

-- 2. 演出表（对应 admin-event-edit.html）
CREATE TABLE events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL COMMENT '演出名称',
  type ENUM('concert','theatre','exhibition','sports','music','kids','dance') NOT NULL COMMENT '演出类型',
  artist VARCHAR(100) COMMENT '艺人/主办方',
  city VARCHAR(50) NOT NULL COMMENT '城市',
  venue_id BIGINT COMMENT '默认场馆ID',
  event_start_date DATE COMMENT '演出开始日期',
  event_end_date DATE COMMENT '演出结束日期',
  description TEXT COMMENT '演出简介',
  cover_image VARCHAR(500) COMMENT '封面图片URL',
  images JSON COMMENT '图片数组',
  status ENUM('draft','on_sale','off_sale','sold_out') NOT NULL DEFAULT 'draft' COMMENT '状态',
  sale_start_time DATETIME COMMENT '开售时间',
  sale_end_time DATETIME COMMENT '停售时间',
  tags JSON COMMENT '标签数组',
  metadata JSON COMMENT '扩展字段: {duration, tips, refund_policy}',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT COMMENT '创建人ID',
  FOREIGN KEY (venue_id) REFERENCES venues(id),
  INDEX idx_type (type),
  INDEX idx_city (city),
  INDEX idx_status (status),
  INDEX idx_artist (artist)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='演出表';

-- 3. 票档表
CREATE TABLE ticket_tiers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT NOT NULL COMMENT '所属演出ID',
  name VARCHAR(50) NOT NULL COMMENT '票档名称',
  price DECIMAL(10,2) NOT NULL COMMENT '票价',
  color VARCHAR(20) COMMENT '座位图颜色 #FF5722',
  description VARCHAR(200) COMMENT '票档说明',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
  max_purchase INT COMMENT '每单限购',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  metadata JSON COMMENT '扩展字段',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='票档表';

-- 4. 场次表（对应 admin-session-edit.html）
CREATE TABLE sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT NOT NULL COMMENT '所属演出ID',
  session_name VARCHAR(200) COMMENT '场次名称',
  start_time DATETIME NOT NULL COMMENT '场次开始时间',
  end_time DATETIME COMMENT '场次结束时间',
  venue_id BIGINT NOT NULL COMMENT '场馆ID',
  hall_name VARCHAR(100) COMMENT '馆厅名称',
  address VARCHAR(500) COMMENT '详细地址',
  total_seats INT NOT NULL COMMENT '总座位数',
  available_seats INT NOT NULL DEFAULT 0 COMMENT '可售座位数',
  sold_seats INT NOT NULL DEFAULT 0 COMMENT '已售座位数',
  locked_seats INT NOT NULL DEFAULT 0 COMMENT '锁定座位数',
  status ENUM('not_started','on_sale','sold_out','ended','off_sale') NOT NULL DEFAULT 'not_started' COMMENT '状态',
  seat_map_config JSON COMMENT '座位图配置',
  ticket_tier_config JSON COMMENT '票档配置',
  metadata JSON COMMENT '扩展字段',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (venue_id) REFERENCES venues(id),
  INDEX idx_event_id (event_id),
  INDEX idx_start_time (start_time),
  INDEX idx_status (status),
  INDEX idx_venue_id (venue_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='场次表';

-- 5. 座位表
CREATE TABLE seats (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT NOT NULL COMMENT '所属场次ID',
  ticket_tier_id BIGINT COMMENT '票档ID',
  seat_row VARCHAR(20) NOT NULL COMMENT '行号',
  seat_column VARCHAR(20) NOT NULL COMMENT '列号',
  seat_number VARCHAR(50) NOT NULL COMMENT '完整座位号',
  area VARCHAR(50) COMMENT '区域',
  price DECIMAL(10,2) NOT NULL COMMENT '座位价格',
  status ENUM('available','sold','locked','unavailable') NOT NULL DEFAULT 'available' COMMENT '状态',
  locked_by BIGINT COMMENT '锁定者',
  locked_until DATETIME COMMENT '锁定过期时间',
  order_id BIGINT COMMENT '订单ID',
  metadata JSON COMMENT '扩展字段',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_tier_id) REFERENCES ticket_tiers(id),
  INDEX idx_session_id (session_id),
  INDEX idx_status (status),
  INDEX idx_seat_number (seat_number),
  INDEX idx_locked_until (locked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='座位表';

-- 6. 管理员表（简化版）
CREATE TABLE admin_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) COMMENT '姓名',
  email VARCHAR(100) COMMENT '邮箱',
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 插入测试数据
INSERT INTO venues (name, city, address) VALUES
('国家体育场（鸟巢）', '北京', '北京市朝阳区国家体育场南路1号'),
('上海体育场', '上海', '上海市徐汇区天钥桥路666号'),
('北京工人体育场', '北京', '北京市朝阳区工人体育场北路'),
('广州体育馆', '广州', '广州市白云区白云大道南783号');
