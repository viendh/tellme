# Tài liệu triển khai hệ thống Tellme

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Kiến trúc triển khai](#2-kiến-trúc-triển-khai)
3. [Yêu cầu hệ thống](#3-yêu-cầu-hệ-thống)
4. [Chuẩn bị môi trường](#4-chuẩn-bị-môi-trường)
5. [Triển khai bằng Docker Compose](#5-triển-khai-bằng-docker-compose-khuyến-nghị)
6. [Triển khai thủ công](#6-triển-khai-thủ-công-không-dùng-docker)
7. [Cấu hình SSL / HTTPS](#7-cấu-hình-ssl--https)
8. [Biến môi trường](#8-biến-môi-trường)
9. [Khởi tạo dữ liệu ban đầu](#9-khởi-tạo-dữ-liệu-ban-đầu)
10. [Vận hành và bảo trì](#10-vận-hành-và-bảo-trì)
11. [Xử lý sự cố](#11-xử-lý-sự-cố)

---

## 1. Tổng quan hệ thống

### Giới thiệu

**Tellme** là hệ thống quản lý công việc theo mô hình Jira — hỗ trợ các nhóm phần mềm theo dõi issue, lập kế hoạch sprint, quản lý backlog và phân tích tiến độ dự án.

### Công nghệ sử dụng

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Backend API | Spring Boot | 2.7.18 |
| Ngôn ngữ backend | Java | 8 |
| Cơ sở dữ liệu | PostgreSQL | 15 |
| Frontend | React + Vite | 18 / 5 |
| Ngôn ngữ frontend | TypeScript | 5.3 |
| CSS Framework | Tailwind CSS | 3.4 |
| Xác thực | JWT (jjwt 0.11.5) | — |
| Build tool backend | Maven Wrapper | 3.9.6 |
| Container | Docker + Compose | 24 / v2 |
| Web server | Nginx | 1.25 |

### Danh sách tính năng

| Module | Chức năng |
|---|---|
| **Xác thực** | Đăng ký, đăng nhập, đổi mật khẩu, quản lý hồ sơ |
| **Dự án** | Tạo/sửa/xóa dự án, cấu hình board, workflow, thành viên |
| **Issue** | Tạo/sửa/xóa issue, gán người thực hiện, phân loại, ưu tiên, môi trường, severity |
| **Kanban Board** | Kéo thả issue giữa các cột trạng thái |
| **Backlog** | Quản lý backlog, lập kế hoạch sprint, drag-and-drop |
| **Sprint** | Tạo, bắt đầu, hoàn thành sprint |
| **Workflow** | Tạo quy trình tùy chỉnh, bước chuyển trạng thái, phê duyệt |
| **Comment** | Bình luận trên issue |
| **Attachment** | Đính kèm file (tối đa 20MB/file) |
| **Worklog** | Ghi nhận thời gian làm việc |
| **Issue Links** | Liên kết issue (blocks, relates to, duplicates...) |
| **Watcher & Vote** | Theo dõi và bình chọn issue |
| **Component** | Quản lý thành phần dự án |
| **Version** | Quản lý phiên bản phát hành |
| **Báo cáo** | Overdue, workload, created vs resolved, resolution time |
| **Tìm kiếm** | Tìm kiếm nâng cao đa dự án, lưu bộ lọc |
| **Dashboard** | Tổng quan cá nhân và dự án |
| **Quản trị** | Duyệt tài khoản, phân quyền, xem log email |
| **Đa ngôn ngữ** | Tiếng Việt và Tiếng Anh |
| **Giao diện** | Light / Dark / System theme |

---

## 2. Kiến trúc triển khai

```
                        Internet
                           │
                    ┌──────▼──────┐
                    │  Nginx :443 │  SSL termination
                    │  Nginx :80  │  → redirect HTTPS
                    └──────┬──────┘
                           │
           ┌───────────────┼────────────────┐
           │               │                │
     /api/* proxy    /uploads/* serve   /* proxy
           │               │                │
    ┌──────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
    │  Backend    │  │  Shared    │  │  Frontend  │
    │  :8080      │  │  Volume    │  │  :80       │
    │  Spring Boot│  │  (files)   │  │  React SPA │
    └──────┬──────┘  └────────────┘  └────────────┘
           │
    ┌──────▼──────┐
    │ PostgreSQL  │
    │   :5432     │
    └─────────────┘
```

**Nguyên tắc hoạt động:**
- Tất cả traffic vào qua **Nginx** (cổng 443/80)
- Frontend gọi API qua path tương đối `/api/...` → Nginx proxy đến backend
- Backend và Database giao tiếp qua mạng nội bộ Docker, **không expose ra ngoài**
- File upload lưu vào shared volume, phục vụ trực tiếp qua Nginx
- JWT lưu trong `localStorage` phía client, hết hạn sau 7 ngày

---

## 3. Yêu cầu hệ thống

### Server

| Thông số | Tối thiểu | Khuyến nghị |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 50 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Băng thông | 10 Mbps | 100 Mbps |

### Phần mềm

**Triển khai Docker (khuyến nghị):**
- Docker Engine 24+
- Docker Compose v2+

**Triển khai thủ công:**
- Java 8 JRE
- PostgreSQL 15+
- Nginx 1.20+
- Node.js 20 LTS *(chỉ cần để build frontend)*

---

## 4. Chuẩn bị môi trường

### 4.1 Cài Docker (Ubuntu 22.04)

```bash
# Cài Docker Engine
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Kiểm tra
docker --version          # Docker version 24.x.x
docker compose version    # Docker Compose version v2.x.x
```

### 4.2 Mở firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### 4.3 Lấy source code

```bash
sudo mkdir -p /opt/tellme
sudo chown $USER:$USER /opt/tellme

# Clone từ GitHub
git clone https://github.com/viendh/tellme.git /opt/tellme
cd /opt/tellme
```

---

## 5. Triển khai bằng Docker Compose (khuyến nghị)

### Bước 1 — Tạo file cấu hình môi trường

```bash
cp .env.example .env
nano .env
```

Điền đầy đủ các giá trị (xem [Biến môi trường](#8-biến-môi-trường)):

```env
DB_PASSWORD=Abc@123!StrongPassword
JWT_SECRET=<output của: openssl rand -base64 64>
APP_BASE_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
MAIL_USERNAME=your.email@gmail.com
MAIL_PASSWORD=xxxx_xxxx_xxxx_xxxx
MAIL_FROM=your.email@gmail.com
```

> **Tạo JWT_SECRET an toàn:**
> ```bash
> openssl rand -base64 64
> ```

### Bước 2 — Cấu hình backend

```bash
# Copy template và điền thông tin thực
cp backend/src/main/resources/application.yml.example \
   backend/src/main/resources/application.yml

nano backend/src/main/resources/application.yml
# Điền: DB password, JWT secret, email credentials
```

### Bước 3 — Cấu hình SSL Certificate

**Option A — Let's Encrypt (domain thực, khuyến nghị):**

```bash
# Trỏ DNS domain về IP server trước, sau đó:
sudo apt install -y certbot
sudo certbot certonly --standalone -d yourdomain.com

mkdir -p /opt/tellme/nginx/certs
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/tellme/nginx/certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem   /opt/tellme/nginx/certs/
sudo chown $USER:$USER /opt/tellme/nginx/certs/*.pem
```

**Option B — Self-signed (mạng nội bộ / test):**

```bash
mkdir -p /opt/tellme/nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /opt/tellme/nginx/certs/privkey.pem \
  -out    /opt/tellme/nginx/certs/fullchain.pem \
  -subj "/CN=yourdomain.com"
```

### Bước 4 — Cập nhật domain trong Nginx

```bash
nano /opt/tellme/nginx/nginx.conf
# Đổi dòng: server_name yourdomain.com;
```

### Bước 5 — Build và khởi động

```bash
cd /opt/tellme

# Build tất cả images
docker compose build

# Khởi động (background)
docker compose up -d

# Theo dõi logs lúc khởi động
docker compose logs -f
```

### Bước 6 — Kiểm tra

```bash
# Xem trạng thái các container
docker compose ps

# Kết quả mong đợi:
# tellme_db        running (healthy)
# tellme_backend   running (healthy)
# tellme_frontend  running
# tellme_nginx     running

# Test API backend
curl -k https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' \
  -w "\nHTTP: %{http_code}\n"
# Mong đợi: HTTP 401 (backend đang hoạt động)

# Test frontend
curl -k https://yourdomain.com/ -w "\nHTTP: %{http_code}\n"
# Mong đợi: HTTP 200
```

---

## 6. Triển khai thủ công (không dùng Docker)

### 6.1 Cài PostgreSQL

```bash
sudo apt install -y postgresql-15
sudo systemctl enable --now postgresql

sudo -u postgres psql <<EOF
CREATE USER tellme_user WITH PASSWORD 'your_db_password';
CREATE DATABASE tellme_db OWNER tellme_user;
GRANT ALL PRIVILEGES ON DATABASE tellme_db TO tellme_user;
EOF
```

### 6.2 Build Backend

Thực hiện trên máy có JDK 8 và Maven:

```bash
cd backend

# Linux / macOS
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
./mvnw clean package -DskipTests

# Windows
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_211
mvnw.cmd clean package -DskipTests

# Output: backend/target/tellme-backend-1.0.0.jar
```

Upload JAR lên server:

```bash
scp backend/target/tellme-backend-1.0.0.jar user@server:/opt/tellme/
```

### 6.3 Tạo systemd service

```bash
sudo nano /etc/systemd/system/tellme-backend.service
```

```ini
[Unit]
Description=Tellme Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/tellme
EnvironmentFile=/opt/tellme/.env

ExecStart=/usr/bin/java \
  -Xms256m -Xmx512m \
  -Djava.security.egd=file:/dev/./urandom \
  -Dspring.profiles.active=prod \
  -Dspring.datasource.url=jdbc:postgresql://localhost:5432/tellme_db \
  -Dspring.datasource.username=${DB_USER} \
  -Dspring.datasource.password=${DB_PASSWORD} \
  -Dapp.jwt.secret=${JWT_SECRET} \
  -Dapp.cors.allowed-origins=${CORS_ORIGINS} \
  -Dspring.mail.username=${MAIL_USERNAME} \
  -Dspring.mail.password=${MAIL_PASSWORD} \
  -Dapp.mail.from=${MAIL_FROM} \
  -Dapp.mail.base-url=${APP_BASE_URL} \
  -DUPLOAD_DIR=/opt/tellme/uploads \
  -jar /opt/tellme/tellme-backend-1.0.0.jar

Restart=on-failure
RestartSec=10
StandardOutput=append:/opt/tellme/logs/backend.log
StandardError=append:/opt/tellme/logs/backend-error.log

[Install]
WantedBy=multi-user.target
```

```bash
sudo mkdir -p /opt/tellme/uploads /opt/tellme/logs
sudo chown -R www-data:www-data /opt/tellme/uploads /opt/tellme/logs
sudo systemctl daemon-reload
sudo systemctl enable --now tellme-backend
sudo systemctl status tellme-backend
```

### 6.4 Build Frontend

```bash
cd frontend
npm ci

# Build production (VITE_API_URL rỗng → gọi /api/* tương đối)
VITE_API_URL="" npm run build

# Upload dist/ lên server
scp -r dist/* user@server:/var/www/tellme/
```

### 6.5 Cấu hình Nginx

```bash
sudo apt install -y nginx
sudo cp /opt/tellme/nginx/nginx.conf /etc/nginx/nginx.conf

# Chỉnh sửa để phục vụ static files thay vì proxy frontend
sudo nano /etc/nginx/nginx.conf
# Đổi location / thành:
#   root /var/www/tellme;
#   try_files $uri $uri/ /index.html;

sudo mkdir -p /var/www/tellme
sudo chown -R www-data:www-data /var/www/tellme
sudo nginx -t
sudo systemctl enable --now nginx
```

---

## 7. Cấu hình SSL / HTTPS

### Auto-renew Let's Encrypt

```bash
# Test renew
sudo certbot renew --dry-run

# Cron tự động renew và reload nginx
sudo crontab -e
# Thêm dòng:
0 3 * * * certbot renew --quiet \
  && cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/tellme/nginx/certs/ \
  && cp /etc/letsencrypt/live/yourdomain.com/privkey.pem   /opt/tellme/nginx/certs/ \
  && docker compose -f /opt/tellme/docker-compose.yml exec nginx nginx -s reload
```

---

## 8. Biến môi trường

Tất cả biến được khai báo trong file `/opt/tellme/.env`:

| Biến | Bắt buộc | Mô tả | Ví dụ |
|------|:--------:|-------|-------|
| `DB_PASSWORD` | ✅ | Mật khẩu PostgreSQL | `Abc@123!Strong` |
| `JWT_SECRET` | ✅ | Secret key JWT (≥ 64 ký tự, random) | `openssl rand -base64 64` |
| `APP_BASE_URL` | ✅ | URL công khai của ứng dụng | `https://tellme.company.com` |
| `CORS_ORIGINS` | ✅ | Origin được phép gọi API | `https://tellme.company.com` |
| `MAIL_USERNAME` | ✅ | Tài khoản email gửi thông báo | `noreply@company.com` |
| `MAIL_PASSWORD` | ✅ | App Password Gmail (16 ký tự) | `xxxx xxxx xxxx xxxx` |
| `MAIL_FROM` | ✅ | Địa chỉ hiển thị khi gửi mail | `Tellme <noreply@company.com>` |
| `DB_USER` | ⬜ | User PostgreSQL (mặc định: `postgres`) | `tellme_user` |
| `MAIL_HOST` | ⬜ | SMTP host (mặc định: `smtp.gmail.com`) | `smtp.office365.com` |
| `MAIL_PORT` | ⬜ | SMTP port (mặc định: `587`) | `465` |
| `MAIL_ENABLED` | ⬜ | Bật/tắt gửi email (mặc định: `true`) | `false` |

### Tạo Gmail App Password

1. Bật **2-Factor Authentication** trên tài khoản Google
2. Vào **Google Account → Security → 2-Step Verification → App Passwords**
3. Chọn **"Other"** → đặt tên `Tellme`
4. Copy mã 16 ký tự vào `MAIL_PASSWORD`

---

## 9. Khởi tạo dữ liệu ban đầu

### 9.1 Đăng ký tài khoản đầu tiên

1. Truy cập `https://yourdomain.com`
2. Nhấn **Đăng ký** → điền thông tin
3. Tài khoản đầu tiên cần được duyệt

### 9.2 Cấp quyền ADMIN

Vì chưa có admin nào, cấp quyền trực tiếp qua database:

```bash
# Docker Compose
docker compose exec db psql -U postgres tellme_db -c \
  "UPDATE users SET role = 'ADMIN', active = true WHERE email = 'your@email.com';"

# Thủ công
sudo -u postgres psql -d tellme_db -c \
  "UPDATE users SET role = 'ADMIN', active = true WHERE email = 'your@email.com';"
```

### 9.3 Duyệt tài khoản người dùng (sau khi có ADMIN)

1. Đăng nhập bằng tài khoản ADMIN
2. Vào **Quản trị → Quản lý người dùng**
3. Duyệt các tài khoản đang chờ

---

## 10. Vận hành và bảo trì

### Xem logs

```bash
# Docker Compose — xem realtime
docker compose logs backend  -f --tail=100
docker compose logs nginx    -f --tail=100
docker compose logs db       -f --tail=50

# Systemd — xem realtime
journalctl -u tellme-backend -f
tail -f /opt/tellme/logs/backend.log
```

### Cập nhật phiên bản mới

```bash
cd /opt/tellme

# Lấy code mới
git pull origin main

# Rebuild và restart không downtime
docker compose build backend frontend
docker compose up -d --no-deps backend frontend

# Hoặc restart toàn bộ stack
docker compose down && docker compose up -d
```

### Backup database

```bash
# Tạo backup
docker compose exec db pg_dump -U postgres tellme_db \
  | gzip > /opt/backups/tellme_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore từ backup
gunzip -c /opt/backups/tellme_20260101_000000.sql.gz \
  | docker compose exec -T db psql -U postgres tellme_db
```

### Tự động backup hàng ngày

```bash
sudo crontab -e
# Thêm dòng (backup lúc 2:00 sáng, giữ 30 ngày):
0 2 * * * mkdir -p /opt/backups && docker compose -f /opt/tellme/docker-compose.yml exec db pg_dump -U postgres tellme_db | gzip > /opt/backups/tellme_$(date +\%Y\%m\%d).sql.gz && find /opt/backups -name "*.sql.gz" -mtime +30 -delete
```

### Theo dõi tài nguyên

```bash
# CPU và RAM của các container
docker stats --no-stream

# Disk usage
docker system df
df -h /opt/tellme
```

### Reset mật khẩu người dùng

```bash
# Tạo bcrypt hash mới (rounds=10) tại: bcrypt-generator.com
docker compose exec db psql -U postgres tellme_db -c \
  "UPDATE users SET password = '\$2a\$10\$NEW_HASH_HERE' WHERE email = 'user@example.com';"
```

---

## 11. Xử lý sự cố

### Backend không khởi động

```bash
docker compose logs backend | tail -50
```

| Lỗi | Nguyên nhân | Giải pháp |
|-----|------------|-----------|
| `Connection refused` (DB) | PostgreSQL chưa ready | Chờ thêm, kiểm tra `docker compose ps db` |
| `JWT_SECRET is required` | Biến env thiếu | Kiểm tra file `.env`, chạy lại `docker compose up -d` |
| `Password authentication failed` | Sai `DB_PASSWORD` | Đồng bộ password trong `.env` và recreate volume nếu DB mới |
| `Port 8080 already in use` | Conflict port | Tắt service đang dùng port 8080 |
| `Could not create directory` (uploads) | Thiếu quyền | `docker compose exec backend mkdir -p /app/uploads` |

### Nginx 502 Bad Gateway

```bash
# Kiểm tra backend có running không
docker compose ps
curl http://localhost:8080/api/projects   # từ bên trong server

# Reload nginx config
docker compose exec nginx nginx -s reload

# Kiểm tra upstream logs
docker compose logs nginx | grep "upstream\|error"
```

### Frontend hiển thị trang trắng

```bash
# Kiểm tra build có lỗi không
docker compose logs frontend

# Kiểm tra console browser (F12 → Console)
# Lỗi CORS → kiểm tra CORS_ORIGINS trong .env khớp với domain thực

# Xem nginx proxy log
docker compose logs nginx | grep "api"
```

### Không nhận được email

```bash
# Kiểm tra log backend
docker compose logs backend | grep -i "mail\|email\|smtp"

# Test SMTP connection
docker compose exec backend nc -zv smtp.gmail.com 587

# Kiểm tra App Password Gmail còn hiệu lực
# → Google Account → Security → App Passwords
```

### Hết dung lượng disk

```bash
# Xóa Docker images và layers không dùng
docker image prune -a
docker volume prune
docker system prune

# Xóa log cũ
find /opt/tellme/logs -name "*.log" -mtime +30 -delete
find /opt/backups -name "*.sql.gz" -mtime +60 -delete
```

---

## Checklist triển khai

### Trước khi deploy
- [ ] Server đủ cấu hình (RAM ≥ 2GB, Disk ≥ 20GB)
- [ ] Docker và Docker Compose đã cài
- [ ] Domain đã trỏ về IP server (nếu dùng domain thực)
- [ ] Firewall đã mở port 22, 80, 443

### Cấu hình
- [ ] File `.env` đã điền đầy đủ, không còn giá trị placeholder
- [ ] `JWT_SECRET` đủ dài (≥ 64 ký tự) và random
- [ ] `application.yml` đã copy từ `.example` và điền credentials
- [ ] `server_name` trong `nginx/nginx.conf` đã đổi thành domain thực
- [ ] `CORS_ORIGINS` và `APP_BASE_URL` khớp với domain thực
- [ ] SSL certificate đã tạo và đặt đúng tại `nginx/certs/`

### Sau khi deploy
- [ ] `docker compose ps` — tất cả container `Up`/`healthy`
- [ ] Truy cập `https://yourdomain.com` — hiển thị trang đăng nhập
- [ ] Đăng ký tài khoản thành công
- [ ] Cấp quyền ADMIN qua SQL
- [ ] Đăng nhập ADMIN và duyệt tài khoản
- [ ] Tạo project thử, tạo issue, thay đổi trạng thái
- [ ] Test gửi email (mời thành viên)
- [ ] Đặt lịch auto-renew SSL certificate
- [ ] Đặt lịch backup database hàng ngày
- [ ] Test restore từ backup

---

*Repo: https://github.com/viendh/tellme*
