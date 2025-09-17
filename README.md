# Hardware Store Management System

A comprehensive bilingual (Arabic/French) management system for hardware stores specializing in plumbing, sanitary products, and construction materials.

## 🚀 Features

### Core Modules
- **POS/Cashier System**: Complete point-of-sale with product search and multi-payment options
- **Inventory Management**: Stock tracking with alerts, expiration dates, and supplier information
- **Supplier Management**: Complete supplier database with order history
- **Client Management**: Customer profiles with purchase history and credit tracking
- **Document System**: Generate invoices, receipts, delivery notes, and other business documents
- **Reports & Analytics**: Comprehensive reporting with profit/loss analysis and trends
- **User Management**: Role-based authentication (Admin, Manager, Cashier)

### Product Lifecycle Workflow
1. **Supplier Purchase Order** (طلب شراء من المورد)
2. **Goods Reception** (استلام البضاعة)
3. **Stock Entry** (دخول الى المخزون)
4. **Customer Sales Order** (طلب بيع من العميل)
5. **Delivery Note** (تسليم البضاعة)
6. **Invoice** (إصدار الفاتورة)

### Technical Features
- **Bilingual Support**: Seamless Arabic/French switching with RTL layout
- **Responsive Design**: Desktop sidebar navigation, mobile bottom tabs
- **Dark/Light Mode**: Theme switching with system preference detection
- **PDF Generation**: Automatic invoice and document generation
- **Real-time Updates**: Dynamic data updates from PostgreSQL database
- **Authentication**: JWT-based secure authentication system

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Vite** for build tooling
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Sequelize** ORM
- **JWT** authentication
- **PDFKit** for PDF generation
- **bcryptjs** for password hashing

### DevOps
- **Docker & Docker Compose** for containerization
- **Multi-stage builds** for production optimization
- **Environment-based configuration**

## 📦 Installation & Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (if running locally)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd hardware-store-management
```

2. **Start with Docker Compose**
```bash
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

### Local Development Setup

1. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

2. **Set up environment variables**
```bash
# Copy and configure environment files
cp server/.env.example server/.env
```

3. **Start PostgreSQL**
```bash
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=hardware_store -p 5432:5432 -d postgres:15-alpine
```

4. **Start the backend**
```bash
cd server
npm run dev
```

5. **Start the frontend**
```bash
npm run dev
```

## 🔐 Default Credentials

**Admin User:**
- Email: `admin@hardware-store.com`
- Password: `admin123`
- Role: Admin

## 📁 Project Structure

```
hardware-store-management/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   ├── layout/             # Layout components
│   │   ├── modules/            # Feature modules
│   │   └── ui/                 # Reusable UI components
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom hooks
│   ├── services/               # API services
│   └── utils/                  # Utility functions
├── server/                      # Backend source code
│   ├── config/                 # Configuration files
│   ├── models/                 # Database models
│   ├── routes/                 # API routes
│   ├── middleware/             # Express middleware
│   ├── utils/                  # Backend utilities
│   └── uploads/                # File uploads directory
├── docker-compose.yml          # Docker Compose configuration
└── README.md                   # This file
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create sale
- `GET /api/sales/stats` - Get sales statistics

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hardware_store
DB_USER=postgres
DB_PASSWORD=postgres123
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

**Frontend**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Production Deployment

1. **Update environment variables**
```bash
# Update server/.env with production values
# Update frontend environment variables
```

2. **Build and deploy**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment

The application is ready for deployment on:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**

## 📊 Database Schema

### Key Tables
- **Users**: Authentication and user management
- **Products**: Product catalog with multilingual support
- **Suppliers**: Supplier information and relationships
- **Clients**: Customer database
- **Sales**: Sales transactions
- **SaleItems**: Individual sale line items
- **Documents**: Business document tracking

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS policies
- **Input Validation**: Server-side input validation
- **SQL Injection Protection**: Sequelize ORM prevents SQL injection

## 🌍 Internationalization

- **Arabic (العربية)**: Complete RTL support with Arabic translations
- **French (Français)**: Full French language support
- **Dynamic Language Switching**: Instant language switching without page reload
- **RTL Layout**: Proper right-to-left layout for Arabic text

## 📈 Performance Optimizations

- **Database Indexing**: Optimized database queries
- **API Caching**: Response caching for frequently accessed data
- **Image Optimization**: Optimized image handling and storage
- **Bundle Splitting**: Code splitting for faster loading
- **Lazy Loading**: Component lazy loading for better performance

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Updates & Maintenance

- Regular security updates
- Database migrations for schema changes
- Feature updates and improvements
- Performance optimizations

---

**Built with ❤️ for hardware store management**