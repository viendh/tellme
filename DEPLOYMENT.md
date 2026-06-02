# Hướng dẫn triển khai Tellme lên môi trường Production

## Mục lục

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Kiến trúc triển khai](#2-kiến-trúc-triển-khai)
3. [Chuẩn bị server](#3-chuẩn-bị-server)
4. [Triển khai bằng Docker Compose (khuyến nghị)](#4-triển-khai-bằng-docker-compose-khuyến-nghị)
5. [Triển khai thủ công (không dùng Docker)](#5-triển-khai-thủ-công-không-dùng-docker)
6. [Cấu hình SSL / HTTPS](#6-cấu-hình-ssl--https)
7. [Biến môi trường](#7-biến-môi-trường)
8. [Vận hành và bảo trì](#8-vận-hành-và-bảo-trì)
9. [Xử lý sự cố thường gặp](#9-xử-lý-sự-cố-thường-gặp)

---

## 1. Yêu cầu hệ thống

### Server tối thiểu
| Thành phần | Yêu cầu tối thiểu | Khuyến nghị |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 50 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Phần mềm cần cài trên server
- **Docker** 24+ và **Docker Compose** v2+
- **Nginx** (nếu triển khai thủ công)
- **Java 8 JRE** (nếu triển khai thủ công)
- **Node.js 20 LTS** (nếu build frontend trên server)
- **PostgreSQL 15** (nếu không dùng Docker)

---

## 2. Kiến trúc triển khai

```
Internet
    │
    ▼
[ Nginx :443 ]  ←── SSL termination
    │
    ├── /api/*  ──────────────▶  [ Backend :8080 ]  ──▶  [ PostgreSQL :5432 ]
    │
    ├── /uploads/*  ──────────▶  [ Shared Volume ]
    │
    └── /*  ─────────────────▶  [ Frontend :80 ]
                                  (React SPA static files)
```

**Luồng dữ liệu:**
- Tất cả traffic đều vào qua Nginx (port 443/80)
- Frontend gọi API tương đối `/api/...` → Nginx proxy đến backend
- File upload lưu vào shared volume, phục vụ qua `/uploads/`
- JWT được lưu trong localStorage phía client

---

## 3. Chuẩn bị server

### 3.1 Cài Docker (Ubuntu)

```bash
# Cài Docker Engine
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Kiểm tra
docker --version          # Docker version 24.x.x
docker compose version    # Docker Compose version v2.x.x
```

### 3.2 Cài Certbot (Let's Encrypt SSL)

```bash
sudo apt update
sudo apt install -y certbot
```

### 3.3 Mở firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

---

## 4. Triển khai bằng Docker Compose (khuyến nghị)

### Bước 1: Clone code lên server

```bash
# Tạo thư mục ứng dụng
sudo mkdir -p /opt/tellme
sudo chown $USER:$USER /opt/tellme

# Clone hoặc upload code
git clone <your-repo-url> /opt/tellme
cd /opt/tellme
```

### Bước 2: Tạo file cấu hình môi trường

```bash
cp .env.example .env
nano .env
```

Điền đầy đủ các giá trị (xem [Biến môi trường](#7-biến-môi-trường)):

```env
DB_PASSWORD=Abc@123!StrongPassword
JWT_SECRET=<output của: openssl rand -base64 64>
APP_BASE_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
MAIL_USERNAME=your.email@gmail.com
MAIL_PASSWORD=xxxx_xxxx_xxxx_xxxx   # Gmail App Password
MAIL_FROM=your.email@gmail.com
```

> **Tạo JWT_SECRET mạnh:**
> ```bash
> openssl rand -base64 64
> ```

### Bước 3: Tạo SSL certificate

**Option A — Let's Encrypt (domain thực):**
```bash
# Trỏ domain về IP server trước, sau đó:
sudo certbot certonly --standalone -d yourdomain.com

# Copy cert vào thư mục nginx
mkdir -p /opt/tellme/nginx/certs
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/tellme/nginx/certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem   /opt/tellme/nginx/certs/
sudo chown $USER:$USER /opt/tellme/nginx/certs/*.pem
```

**Option B — Self-signed (nội bộ / test):**
```bash
mkdir -p /opt/tellme/nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /opt/tellme/nginx/certs/privkey.pem \
  -out    /opt/tellme/nginx/certs/fullchain.pem \
  -subj "/CN=yourdomain.com"
```

### Bước 4: Cập nhật domain trong nginx.conf

```bash
nano /opt/tellme/nginx/nginx.conf
# Đổi dòng: server_name yourdomain.com;
```

### Bước 5: Build và khởi động

```bash
cd /opt/tellme

# Build images
docker compose build

# Khởi động toàn bộ stack
docker compose up -d

# Theo dõi logs
docker compose logs -f
```

### Bước 6: Kiểm tra

```bash
# Kiểm tra tất cả container đang chạy
docker compose ps

# Test API
curl -k https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' \
  -w "\nHTTP Status: %{http_code}\n"
# Expected: 401 Unauthorized (backend đang chạy)

# Test frontend
curl -k https://yourdomain.com/ -w "\nHTTP Status: %{http_code}\n"
# Expected: 200 OK
```

---

## 5. Triển khai thủ công (không dùng Docker)

### 5.1 Cài PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Tạo database và user
sudo -u postgres psql <<EOF
CREATE USER tellme_user WITH PASSWORD 'your_db_password';
CREATE DATABASE tellme_db OWNER tellme_user;
GRANT ALL PRIVILEGES ON DATABASE tellme_db TO tellme_user;
EOF
```

### 5.2 Build Backend (JAR)

Thực hiện trên máy dev hoặc trên server (cần JDK 8 + Maven):

```bash
cd backend

# Cách 1: Dùng Maven Wrapper (đã có sẵn)
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_211   # Windows
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64  # Linux

./mvnw clean package -DskipTests

# JAR được tạo tại:
# target/tellme-backend-1.0.0.jar
```

### 5.3 Upload JAR lên server

```bash
scp backend/target/tellme-backend-1.0.0.jar user@yourserver:/opt/tellme/
```

### 5.4 Tạo systemd service cho Backend

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
sudo systemctl enable tellme-backend
sudo systemctl start tellme-backend
sudo systemctl status tellme-backend
```

### 5.5 Build Frontend

```bash
cd frontend

# Cài dependencies
npm ci

# Build production (API calls đến /api/* → Nginx proxy)
VITE_API_URL="" npm run build

# Kết quả trong thư mục dist/
```

### 5.6 Cài Nginx và cấu hình

```bash
sudo apt install -y nginx

# Upload nginx config
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# Upload frontend static files
sudo mkdir -p /var/www/tellme
sudo cp -r frontend/dist/* /var/www/tellme/
sudo chown -R www-data:www-data /var/www/tellme

# Đổi location frontend trong nginx.conf thành:
# root /var/www/tellme;
# try_files $uri $uri/ /index.html;

sudo nginx -t              # kiểm tra config
sudo systemctl reload nginx
```

---

## 6. Cấu hình SSL / HTTPS

### Auto-renew Let's Encrypt

```bash
# Test renew
sudo certbot renew --dry-run

# Thêm cron job tự động renew
sudo crontab -e
# Thêm dòng:
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/tellme/nginx/certs/ && cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/tellme/nginx/certs/ && docker compose -f /opt/tellme/docker-compose.yml exec nginx nginx -s reload
```

---

## 7. Biến môi trường

| Biến | Bắt buộc | Mô tả | Ví dụ |
|------|----------|-------|-------|
| `DB_PASSWORD` | ✅ | Mật khẩu PostgreSQL | `Abc@123!Strong` |
| `JWT_SECRET` | ✅ | Secret key JWT (≥64 ký tự) | `openssl rand -base64 64` |
| `APP_BASE_URL` | ✅ | URL công khai của app | `https://tellme.company.com` |
| `CORS_ORIGINS` | ✅ | Origin cho phép CORS | `https://tellme.company.com` |
| `MAIL_USERNAME` | ✅ | Email gửi thông báo | `noreply@company.com` |
| `MAIL_PASSWORD` | ✅ | App Password Gmail | `xxxx xxxx xxxx xxxx` |
| `MAIL_FROM` | ✅ | Địa chỉ hiển thị gửi mail | `noreply@company.com` |
| `DB_USER` | ⬜ | User PostgreSQL (mặc định: `postgres`) | `tellme_user` |
| `MAIL_HOST` | ⬜ | SMTP host (mặc định: `smtp.gmail.com`) | `smtp.office365.com` |
| `MAIL_PORT` | ⬜ | SMTP port (mặc định: `587`) | `465` |
| `MAIL_ENABLED` | ⬜ | Bật/tắt gửi email (mặc định: `true`) | `false` |

### Tạo Gmail App Password

1. Bật 2-Factor Authentication trên Gmail
2. Vào **Google Account → Security → App Passwords**
3. Tạo App Password cho "Mail" → "Other (Tellme)"
4. Copy mã 16 ký tự vào `MAIL_PASSWORD`

---

## 8. Vận hành và bảo trì

### Xem logs

```bash
# Docker Compose
docker compose logs backend -f --tail=100
docker compose logs nginx -f --tail=100
docker compose logs db -f --tail=50

# Systemd (triển khai thủ công)
journalctl -u tellme-backend -f
tail -f /opt/tellme/logs/backend.log
```

### Cập nhật phiên bản mới

```bash
cd /opt/tellme

# Pull code mới
git pull

# Rebuild và restart (zero-downtime với --no-deps)
docker compose build backend frontend
docker compose up -d --no-deps backend frontend

# Hoặc restart toàn bộ
docker compose down && docker compose up -d
```

### Backup database

```bash
# Backup
docker compose exec db pg_dump -U postgres tellme_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker compose exec -T db psql -U postgres tellme_db < backup_20260101_000000.sql
```

### Tạo tài khoản admin đầu tiên

Sau khi khởi động, đăng ký tài khoản qua giao diện web. Sau đó cấp quyền ADMIN bằng SQL:

```bash
docker compose exec db psql -U postgres tellme_db -c \
  "UPDATE users SET role = 'ADMIN' WHERE email = 'your.email@example.com';"
```

### Theo dõi tài nguyên

```bash
# CPU và RAM của các container
docker stats

# Disk usage
docker system df
df -h /opt/tellme
```

---

## 9. Xử lý sự cố thường gặp

### Backend không khởi động được

```bash
docker compose logs backend | tail -50
```

**Lỗi thường gặp:**

| Lỗi | Nguyên nhân | Giải pháp |
|-----|------------|-----------|
| `Connection refused` (DB) | PostgreSQL chưa ready | Chờ thêm, kiểm tra `docker compose ps db` |
| `JWT_SECRET is required` | Biến env thiếu | Kiểm tra file `.env` |
| `Password authentication failed` | Sai `DB_PASSWORD` | Đồng bộ password trong `.env` |
| Port 8080 đã bị dùng | Conflict port | Đổi port trong `docker-compose.yml` |

### Nginx 502 Bad Gateway

```bash
# Kiểm tra backend có running không
docker compose ps backend
curl http://localhost:8080/api/projects   # từ bên trong server

# Reload nginx
docker compose exec nginx nginx -s reload
```

### Frontend hiển thị trang trắng

```bash
# Kiểm tra console browser (F12)
# Thường do base URL API sai → kiểm tra Nginx proxy /api/
docker compose logs nginx | grep "upstream"
```

### Hết dung lượng disk

```bash
# Xóa Docker images cũ
docker image prune -a
docker volume prune

# Xóa logs cũ
find /opt/tellme/logs -name "*.log" -mtime +30 -delete
```

### Reset mật khẩu user

```bash
# Hash password mới (bcrypt rounds=10)
# Dùng htpasswd hoặc online bcrypt generator
docker compose exec db psql -U postgres tellme_db -c \
  "UPDATE users SET password = '\$2a\$10\$...' WHERE email = 'user@example.com';"
```

---

## Checklist triển khai

- [ ] Server đã cài Docker và Docker Compose
- [ ] Domain đã trỏ về IP server (nếu dùng domain thực)
- [ ] File `.env` đã điền đầy đủ, không còn giá trị placeholder
- [ ] `JWT_SECRET` đủ dài (≥ 64 ký tự) và random
- [ ] SSL certificate đã được tạo và đặt đúng vị trí
- [ ] `server_name` trong `nginx/nginx.conf` đã đổi thành domain thực
- [ ] `CORS_ORIGINS` và `APP_BASE_URL` khớp với domain thực
- [ ] Firewall đã mở port 80 và 443
- [ ] `docker compose up -d` chạy thành công
- [ ] `docker compose ps` tất cả container ở trạng thái `healthy`/`Up`
- [ ] Truy cập `https://yourdomain.com` hiển thị giao diện login
- [ ] Đăng ký tài khoản và đăng nhập thành công
- [ ] Cấp quyền ADMIN cho tài khoản quản trị
- [ ] Test chức năng gửi email (mời thành viên)
- [ ] Đặt lịch tự động renew SSL certificate
- [ ] Đặt lịch backup database hàng ngày
