# เที่ยวไหน - แอปพลิเคชันสำหรับคนรักเที่ยว

แอปพลิเคชันเว็บสำหรับค้นหาและแชร์สถานที่ท่องเที่ยวในประเทศไทย

## 🚀 เริ่มต้นใช้งาน

### ข้อกำหนดเบื้องต้น
- Node.js (v18 หรือสูงกว่า)
- npm หรือ yarn
- MongoDB

### การติดตั้ง

1. Clone repository
```bash
git clone <repository-url>
cd teawinai
```

2. ติดตั้ง dependencies สำหรับ backend
```bash
cd backend
npm install
```

3. ติดตั้ง dependencies สำหรับ frontend
```bash
cd ../frontend
npm install
```

4. สร้างไฟล์ .env สำหรับ backend
```bash
cd ../backend
cp .env.example .env
```

5. แก้ไขค่าในไฟล์ .env ตามความเหมาะสม
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/teawinai
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### การรันแอปพลิเคชัน

1. เริ่มต้น MongoDB server
```bash
mongod
```

2. รัน backend server
```bash
cd backend
npm run dev
```

3. รัน frontend development server
```bash
cd frontend
npm run dev
```

4. เปิด browser ที่ http://localhost:3000

## 📁 โครงสร้างโปรเจค

```
teawinai/
├── backend/
│   ├── src/
│   │   ├── config/          # การตั้งค่าฐานข้อมูล
│   │   ├── controllers/     # Logic สำหรับจัดการ request
│   │   ├── middlewares/     # Middlewares สำหรับ authentication
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── .env.example         # ตัวอย่าง environment variables
│   ├── package.json
│   └── server.js            # Main server file
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   └── utils/           # Utility functions
    ├── package.json
    └── vite.config.js       # Vite configuration
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **React Query** - Data fetching
- **React Hook Form** - Form handling
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📝 Features

- 🔐 **Authentication** - ลงทะเบียนและเข้าสู่ระบบ
- 📍 **Places Management** - เพิ่ม แก้ไข ลบสถานที่ท่องเที่ยว
- 🔍 **Search & Filter** - ค้นหาและกรองสถานที่ตามหมวดหมู่และจังหวัด
- ⭐ **Reviews & Ratings** - รีวิวและให้คะแนนสถานที่
- 👤 **User Profiles** - โปรไฟล์ผู้ใช้และประวัติการเดินทาง
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/auth/profile` - ดูโปรไฟล์

### Places
- `GET /api/places` - ดูรายการสถานที่ทั้งหมด
- `GET /api/places/:id` - ดูรายละเอียดสถานที่
- `POST /api/places` - เพิ่มสถานที่ (ต้อง login)
- `PUT /api/places/:id` - แก้ไขสถานที่ (ต้อง login)
- `DELETE /api/places/:id` - ลบสถานที่ (ต้อง login)

## 🤝 การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

โปรเจคนี้ใช้ license MIT - ดูที่ไฟล์ [LICENSE](LICENSE) สำหรับข้อมูลเพิ่มเติม

## 📞 ติดต่อ

หากมีข้อสงสัยหรือต้องการติดต่อ กรุณา email ที่ info@teawinai.com
