#!/bin/bash
# 文件名: init-db.sh

rm -rf .local-db

# 重新创建目录
mkdir -p .local-db

# 删除旧数据库（如果存在）
wrangler d1 delete friends --local 

# 创建新数据库
wrangler d1 create friends --local --persist-to=.local-db

# 创建表
wrangler d1 execute friends --local --persist-to=.local-db --command="
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  phone VARCHAR(11) NOT NULL UNIQUE,
  nickname VARCHAR(50),
  avatar_url TEXT,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# 插入测试数据
wrangler d1 execute friends --local --persist-to=.local-db --command="
INSERT OR IGNORE INTO users (phone, nickname) 
VALUES ('13800138000', '测试用户');"

# 验证表是否创建成功
echo "验证表结构:"
wrangler d1 execute friends --local --persist-to=.local-db --command="PRAGMA table_info(users);"

echo "验证数据:"
wrangler d1 execute friends --local --persist-to=.local-db --command="SELECT * FROM users;"

echo "数据库初始化完成。使用以下命令启动开发服务器:"
echo "wrangler pages dev --d1 bgdb=friends --persist-to=.local-db -- npm run dev"
