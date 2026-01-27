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