# 🚀 ChatRealtime

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)

> **ChatRealtime** là một ứng dụng chat thời gian thực mạnh mẽ, được xây dựng với kiến trúc client-server hiện đại. Cho phép người dùng tham gia phòng chat, gửi tin nhắn tức thời, và quản lý tài khoản một cách an toàn.

## ✨ Tính năng

- 🔐 **Xác thực người dùng**: Đăng ký, đăng nhập, quên mật khẩu
- 💬 **Chat thời gian thực**: Gửi và nhận tin nhắn tức thời qua WebSocket
- 🏠 **Phòng chat**: Tạo và tham gia nhiều phòng chat khác nhau
- ✏️ **Chỉnh sửa tin nhắn**: Sửa đổi tin nhắn đã gửi
- 📝 **Lịch sử chat**: Xem lịch sử các phòng đã tham gia
- 🔄 **Đổi mật khẩu**: Quản lý tài khoản an toàn
- 📊 **Metrics**: Theo dõi hiệu suất ứng dụng
- 🛡️ **Rate limiting**: Bảo vệ chống spam và lạm dụng
- 📱 **Responsive**: Giao diện thân thiện trên mọi thiết bị

## 🖥️ Demo

*(Thêm ảnh demo hoặc link demo nếu có)*

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống

- Docker & Docker Compose
- Node.js 18+ (cho development)
- PostgreSQL (được cung cấp qua Docker)

### Chạy với Docker (Khuyến nghị)

1. **Clone repository**
   ```bash
   git clone https://github.com/Nguyen-Trung-Tien/ChatRealtime.git
   cd ChatRealtime
   ```

2. **Khởi động ứng dụng**
   ```bash
   docker-compose up --build
   ```

3. **Truy cập ứng dụng**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

### Development Setup

1. **Cài đặt dependencies**
   ```bash
   # Client
   cd client
   npm install

   # Server
   cd ../server
   npm install
   ```

2. **Cấu hình môi trường**
   ```bash
   # Copy file env mẫu
   cp server/.env.example server/.env
   # Chỉnh sửa .env với thông tin database và secrets
   ```

3. **Khởi động database**
   ```bash
   docker-compose up db -d
   ```

4. **Chạy Prisma migrations**
   ```bash
   cd server
   npx prisma migrate dev
   ```

5. **Chạy ứng dụng**
   ```bash
   # Terminal 1: Server
   cd server
   npm run dev

   # Terminal 2: Client
   cd client
   npm run dev
   ```

## 📁 Cấu trúc dự án

```
ChatRealtime/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── chat/      # Chat components
│   │   │   ├── common/    # Shared components
│   │   │   ├── join/      # Join room components
│   │   │   └── lobby/     # Lobby components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   ├── pages/         # Page components
│   │   └── assets/        # Images and styles
│   ├── Dockerfile         # Client Docker config
│   └── package.json
├── server/                 # Backend Node.js server
│   ├── src/
│   │   ├── app/           # Application setup
│   │   ├── bootstrap/     # Server startup
│   │   ├── config/        # Configuration modules
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic services
│   │   └── uploads/       # File uploads
│   ├── prisma/            # Database schema and migrations
│   ├── Dockerfile         # Server Docker config
│   └── package.json
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool và dev server
- **Tailwind CSS** - Styling
- **Socket.io-client** - Real-time communication
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **Prisma** - ORM và database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-rate-limit** - Rate limiting

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy cho production

## 🔧 Scripts hữu ích

### Client
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

### Server
```bash
npm run dev      # Development với nodemon
npm run start    # Production server
npm test         # Chạy tests
```

### Database
```bash
npx prisma studio          # Prisma Studio GUI
npx prisma migrate dev     # Development migrations
npx prisma generate        # Generate Prisma client
```

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Quy tắc đóng góp
- Tuân thủ ESLint config
- Viết tests cho features mới
- Cập nhật documentation
- Sử dụng conventional commits

## 📄 Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 👨‍💻 Tác giả

**Nguyen Trung Tien** - [GitHub](https://github.com/Nguyen-Trung-Tien)

---

⭐ Nếu bạn thích dự án này, hãy cho nó một ngôi sao trên GitHub!
