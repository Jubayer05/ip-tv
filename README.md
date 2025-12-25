# Cheap Stream - Premium IPTV Streaming Platform

A comprehensive IPTV (Internet Protocol Television) streaming platform built with Next.js 15, offering thousands of live TV channels, movies, TV shows, and sports content with HD & 4K quality streaming.

## 🌟 Features

### 🎬 Content & Streaming

- **Massive Content Library**: Thousands of movies, TV shows, and live channels
- **HD & 4K Streaming**: Crystal-clear quality with zero buffering
- **Multi-Device Support**: Android, iOS, Smart TVs, MAG boxes, Firestick, Windows/Mac
- **Live TV Channels**: Global channels from Americas, Europe, Asia, and beyond
- **On-Demand Content**: Movies and TV shows available 24/7

### 🌍 Internationalization

- **14 Languages Supported**: English, Swedish, Norwegian, Danish, Finnish, French, German, Spanish, Italian, Russian, Turkish, Arabic, Hindi, Chinese
- **Real-time Translation**: Dynamic content translation using Google Translate API
- **RTL Support**: Right-to-left language support for Arabic
- **Admin Language Management**: Enable/disable languages from admin panel

### 💳 Payment & Pricing

- **Multiple Payment Gateways**:
  - Cryptocurrency (Bitcoin, Ethereum, USDT)
  - Traditional (PayPal, Stripe, Bank transfers)
  - Digital Wallets (ChangeNOW, CryptoMus, HoodPay, NowPayments, PayGate, Plisio, Volet)
- **Flexible Pricing Plans**: Monthly subscriptions with device scaling
- **Coupon System**: Discount codes and promotional offers
- **Bulk Discounts**: Volume-based pricing for resellers
- **Free Trial**: 24-hour free trial with no credit card required

### 👥 User Management

- **Rank System**: User progression with spending-based benefits
- **Affiliate Program**: Commission-based referral system
- **User Reviews**: Customer rating and review system
- **Account Management**: Profile management and order history
- **Social Login**: Google, Facebook, Twitter integration

### 🛠️ Admin Dashboard

- **User Management**: Admin/user role management
- **Content Management**: Movies, TV shows, channels, blogs
- **Review Management**: Approve/reject customer reviews
- **Coupon Management**: Create and manage discount codes
- **Affiliate Management**: Track referrals and commissions
- **Settings Management**: Site configuration, payment settings, language options
- **Analytics Dashboard**: User statistics and revenue tracking
- **Rank System Management**: Configure user progression benefits

### 🔧 Technical Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **SEO Optimized**: Dynamic meta tags and sitemap generation
- **Security**: JWT authentication, bcrypt password hashing, rate limiting
- **Performance**: Lazy loading, image optimization, caching
- **Email System**: SMTP configuration for notifications
- **API Integration**: Firebase, reCAPTCHA, Google Analytics, TrustPilot

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- SMTP email service
- Payment gateway accounts (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ip_tv
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Email (SMTP)
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password

   # Payment Gateways (optional)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret

   # Translation API
   GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key

   # Firebase (optional)
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email

   # Other APIs (optional)
   RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # User & Admin dashboards
│   ├── (general)/         # Public pages
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── features/         # Feature-specific components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── middleware/           # Next.js middleware
├── models/               # MongoDB/Mongoose models
└── store/                # State management
```

## 🛡️ Security Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Password Security**: bcrypt hashing with salt rounds
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS policies
- **SQL Injection Protection**: Mongoose ODM prevents NoSQL injection
- **XSS Protection**: Input sanitization and output encoding

## 🌐 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all required environment variables are set in your production environment.

### Database Setup

The application will automatically create necessary collections and indexes on first run.

## 📱 Supported Devices

- **Mobile**: Android (phones, tablets), iOS (iPhone, iPad)
- **Smart TVs**: Samsung, LG, Sony Smart TVs
- **Streaming Devices**: Amazon Firestick, Fire TV, Android TV boxes
- **Computers**: Windows, macOS, Linux
- **IPTV Boxes**: MAG boxes, Formuler devices
- **Apps**: IPTV Smarters, TiviMate, Perfect Player, VLC

## 🔧 Configuration

### Admin Panel Access

1. Create an admin account through the registration process
2. Access admin features at `/admin/dashboard`
3. Configure site settings, payment methods, and content

### Language Configuration

1. Navigate to Admin Dashboard → Settings → Language Management
2. Enable/disable languages as needed
3. Set default language for new users

### Payment Gateway Setup

1. Configure payment gateways in Admin Dashboard → Settings
2. Add API keys for desired payment methods
3. Test payment processing in development mode

## 📊 Analytics & Monitoring

- **User Analytics**: Track user registrations, subscriptions, and activity
- **Revenue Tracking**: Monitor sales, refunds, and payment methods
- **Content Analytics**: Track popular content and user preferences
- **Performance Monitoring**: Server performance and uptime tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the Knowledge Base section
- **FAQ**: Visit the FAQ page for common questions
- **Contact**: Use the contact form for technical support
- **Email**: support@cheapstream.com

## 🔄 Updates & Roadmap

### Recent Updates

- Multi-language support with real-time translation
- Enhanced admin dashboard with comprehensive management tools
- Multiple payment gateway integrations
- Improved user experience with responsive design
- Advanced rank system with user progression benefits

### Planned Features

- Mobile app development (iOS/Android)
- Advanced analytics dashboard
- API for third-party integrations
- Enhanced content recommendation system
- Live chat support integration

---

**Cheap Stream** - Your ticket to endless entertainment! 🎬✨

## 🏗️ Architecture Overview

### Frontend Architecture

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API + Zustand
- **UI Components**: Custom component library with Lucide React icons
- **Forms**: React Hook Form with validation
- **Charts**: Recharts for analytics visualization

### Backend Architecture

- **API**: Next.js API Routes with middleware
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with refresh mechanism
- **File Storage**: Local file system with image optimization
- **Email**: Nodemailer with SMTP configuration
- **Caching**: Next.js built-in caching with custom headers

### Database Schema

- **Users**: Profile management, authentication, roles
- **Products**: Subscription plans, pricing, features
- **Orders**: Purchase history, payment tracking
- **Reviews**: Customer feedback, ratings, moderation
- **Settings**: Site configuration, payment gateways, languages
- **Coupons**: Discount codes, usage tracking
- **Affiliates**: Referral tracking, commission management

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### User Management

- `GET /api/users` - Get users (admin only)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PATCH /api/users/[id]/role` - Update user role (admin only)

### Content Management

- `GET /api/products` - Get subscription plans
- `POST /api/products` - Create product (admin only)
- `PUT /api/products` - Update product (admin only)
- `GET /api/blogs` - Get blog posts
- `POST /api/blogs` - Create blog post (admin only)

### Payment & Orders

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `POST /api/payments/process` - Process payment
- `GET /api/payments/status/[id]` - Check payment status

### Admin Features

- `GET /api/admin/settings` - Get site settings
- `PUT /api/admin/settings` - Update site settings
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/analytics` - Get analytics data

## 🎨 UI/UX Features

### Design System

- **Color Palette**: Dark theme with cyan accents
- **Typography**: Custom font families for headings and body text
- **Components**: Reusable UI components with consistent styling
- **Icons**: Lucide React icon library
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

### User Experience

- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages with SweetAlert2
- **Form Validation**: Real-time validation with helpful error messages
- **Accessibility**: ARIA labels and keyboard navigation support
- **Performance**: Lazy loading and code splitting for optimal performance

## 🔐 Security Best Practices

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Admin and user role management
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Automatic token refresh and logout

### Data Protection

- **Input Sanitization**: All user inputs are sanitized
- **Output Encoding**: XSS protection for rendered content
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Proper cross-origin resource sharing setup

### Infrastructure Security

- **Environment Variables**: Sensitive data stored in environment variables
- **Database Security**: MongoDB with proper access controls
- **HTTPS**: SSL/TLS encryption for all communications
- **Security Headers**: Proper HTTP security headers

## 📈 Performance Optimization

### Frontend Optimization

- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Caching**: Browser caching with proper cache headers

### Backend Optimization

- **Database Indexing**: Proper MongoDB indexes for query optimization
- **API Caching**: Response caching for frequently accessed data
- **Connection Pooling**: MongoDB connection pooling
- **Error Handling**: Comprehensive error handling and logging

## 🧪 Testing Strategy

### Testing Approach

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User workflow testing
- **Performance Tests**: Load testing for critical paths

### Quality Assurance

- **Code Linting**: ESLint configuration for code quality
- **Type Checking**: TypeScript for type safety
- **Code Review**: Pull request review process
- **Automated Testing**: CI/CD pipeline with automated tests

## 📚 Documentation

### Code Documentation

- **API Documentation**: Comprehensive API endpoint documentation
- **Component Documentation**: React component prop documentation
- **Database Schema**: MongoDB collection and field documentation
- **Deployment Guide**: Step-by-step deployment instructions

### User Documentation

- **Knowledge Base**: Comprehensive help documentation
- **FAQ Section**: Frequently asked questions
- **Video Tutorials**: Setup and usage video guides
- **Support System**: Ticket-based support system

## 🌍 Internationalization (i18n)

### Language Support

- **14 Languages**: Complete translation support
- **Dynamic Translation**: Real-time content translation
- **RTL Support**: Right-to-left language support
- **Admin Management**: Language enable/disable from admin panel

### Translation Features

- **Google Translate API**: Automatic translation service
- **Fallback System**: English fallback for missing translations
- **Context Awareness**: Context-sensitive translations
- **Performance**: Optimized translation loading

## 🔄 Maintenance & Updates

### Regular Maintenance

- **Security Updates**: Regular dependency updates
- **Performance Monitoring**: Continuous performance monitoring
- **Database Maintenance**: Regular database optimization
- **Backup Strategy**: Automated backup procedures

### Update Process

- **Version Control**: Git-based version control
- **Release Management**: Semantic versioning
- **Rollback Strategy**: Quick rollback procedures
- **Change Log**: Detailed change documentation

---

**Built with ❤️ using Next.js 15, MongoDB, and modern web technologies**
