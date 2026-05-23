# DealZone System Architecture & Technical Design

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                       │
│                                                                       │
│  React 18 + Vite 5 (Port 5173)                                      │
│  - React Router for navigation                                      │
│  - Context API for state management                                 │
│  - Tailwind CSS for styling                                         │
│  - Axios for HTTP communication                                     │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ HTTPS/JSON (Port 5173→5000 via Vite proxy)
                      │ /api/* → localhost:5000
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                    API GATEWAY (Vite Dev Server)                     │
│                                                                       │
│  - Proxies /api requests to backend                                 │
│  - Prevents CORS issues in development                              │
│  - Hot module replacement for frontend                              │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ JSON/FormData (Port 5000)
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                   SERVER LAYER (Backend)                             │
│                                                                       │
│  ASP.NET Core 8 (Port 5000)                                         │
│  ├─ Controllers (CompaniesController, AuthController, etc.)        │
│  ├─ Middleware (JWT validation, error handling)                    │
│  ├─ Services (UserService, RFQService, etc.)                       │
│  ├─ Repositories (Data access layer)                               │
│  └─ Swagger API Documentation                                       │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ SQL Queries / EF Core
                      │
┌─────────────────────▼───────────────────────────────────────────────┐
│                   DATA LAYER                                         │
│                                                                       │
│  SQL Server (localhost\SQLEXPRESS)                                  │
│  Database: DealZoneDB                                               │
│  ├─ Users (authentication)                                         │
│  ├─ Companies (profiles)                                           │
│  ├─ Products (marketplace)                                         │
│  ├─ RFQs (requests)                                                │
│  ├─ Orders (purchases)                                             │
│  ├─ Escrows (payments)                                             │
│  └─ KycDocuments (file tracking)                                   │
│                                                                       │
│  File System: wwwroot/uploads/kyc/                                  │
│  (Actual uploaded files)                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📡 Request/Response Flow

### 1. Authentication Flow (Login)

```
User enters email/password
         ↓
React component → axios.post('/auth/login')
         ↓
Vite proxy → http://localhost:5000/api/auth/login
         ↓
AuthController receives request
         ↓
UserService.AuthenticateAsync()
  ├─ Queries Users table
  ├─ Validates password hash
  ├─ Generates JWT token (1 hour expiry)
  └─ Generates refresh token (7 days expiry)
         ↓
Returns: { token, refreshToken, user }
         ↓
Frontend stores in localStorage
  ├─ localStorage['token'] = JWT
  └─ localStorage['refreshToken'] = refresh token
         ↓
Navigate to dashboard
```

### 2. KYC File Upload Flow

```
User selects file (jpg/pdf)
         ↓
KycUploadWidget validates
  ├─ File size < 5MB ✓
  ├─ File type in [jpg, jpeg, png, pdf] ✓
  └─ File present ✓
         ↓
kycService.uploadKycFile(file, docType)
  ├─ Create FormData
  ├─ Append file: file
  ├─ Append docType: docType
         ↓
axios.post('/companies/kyc/upload', formData)
  ├─ Interceptor adds: Authorization: Bearer {token}
  ├─ Detects FormData, skips Content-Type override
         ↓
Vite proxy → http://localhost:5000/api/companies/kyc/upload
         ↓
CompaniesController.UploadKyc()
  ├─ [Authorize] validates JWT
  ├─ Validates file size & type (5MB, jpg/jpeg/png/pdf)
         ↓
UserService.UploadKycFileAsync()
  ├─ Ensure directory exists: wwwroot/uploads/kyc/
  ├─ Generate unique filename:
  │  {companyId}_{timestamp}_{originalname}
  │  Example: 5_132864527891234_invoice.pdf
  ├─ Save file to disk
  ├─ Create/update KycDocuments row
  ├─ Set status: "Pending"
  └─ Return file URL
         ↓
Response: { status: "Pending", fileUrl: "/uploads/kyc/5_..." }
         ↓
Frontend receives response
  ├─ Show success toast
  ├─ Update component state
  ├─ Display file URL
         ↓
File accessible at: http://localhost:5000/uploads/kyc/{filename}
                    (via static file middleware)
```

### 3. API Call with JWT Token

```
Component calls: api.get('/products')
         ↓
Axios request interceptor:
  ├─ Get token from localStorage
  ├─ Add header: Authorization: Bearer {token}
  ├─ Set timeout: 20 seconds
         ↓
Request sent to: http://localhost:5000/api/products
         ↓
Backend JWT middleware:
  ├─ Extract token from header
  ├─ Verify token signature
  ├─ Check expiration
  ├─ Extract user claims
         ↓
Controller action runs:
  ├─ Access User.GetUserId() (from claims)
  ├─ Query database for user-specific data
         ↓
Response sent back
         ↓
Axios response interceptor:
  ├─ Check status code
  ├─ If 401 → trigger token refresh
  ├─ If error → log and format
  ├─ If 200 → return data
         ↓
Component receives data
```

### 4. Token Refresh Flow

```
API returns 401 Unauthorized
         ↓
Response interceptor detects 401
         ↓
Is this a refresh request?
  ├─ Yes → redirect to /login
  └─ No → continue
         ↓
Has refreshToken in localStorage?
  ├─ No → redirect to /login
  └─ Yes → continue
         ↓
Call: POST /api/auth/refresh
  ├─ Send: { refreshToken: localStorage['refreshToken'] }
  ├─ No Authorization header needed
         ↓
Backend validates refreshToken
  ├─ Check in database
  ├─ Check expiration (7 days)
         ↓
Generate new token (1 hour expiry)
         ↓
Response: { token: newJWT, refreshToken: newRefresh }
         ↓
Frontend updates localStorage
  ├─ localStorage['token'] = newJWT
  ├─ localStorage['refreshToken'] = newRefresh
         ↓
Retry original request with new token
         ↓
If original fails again → redirect to /login
```

---

## 🗂️ Component Architecture

### Frontend Component Structure

```
App.jsx
├─ AppContext (global state)
│  ├─ user
│  ├─ deals
│  ├─ products
│  └─ notifications
│
├─ Navbar
│  ├─ User menu dropdown
│  └─ Navigation links
│
├─ Main Routes
│  ├─ /
│  │  └─ LandingPage
│  ├─ /signup
│  │  └─ SignUp (POST /auth/register)
│  ├─ /login
│  │  └─ Login (POST /auth/login)
│  ├─ /dashboard
│  │  ├─ BuyerDashboard
│  │  │  ├─ RFQs created
│  │  │  ├─ Offers received
│  │  │  └─ Orders
│  │  └─ SupplierDashboard
│  │     ├─ RFQs available
│  │     ├─ Bids submitted
│  │     └─ Products
│  ├─ /marketplace
│  │  └─ ProductList (GET /products)
│  ├─ /rfq/create
│  │  └─ CreateRFQ (POST /rfqs)
│  ├─ /my-rfqs
│  │  └─ MyRFQs (GET /rfqs)
│  └─ /admin
│     └─ AdminPanel
│
├─ Components (Reusable)
│  ├─ KycUploadWidget
│  │  ├─ File input
│  │  ├─ Validation
│  │  ├─ Progress
│  │  └─ Status display
│  ├─ Modal
│  ├─ Toast
│  ├─ Card
│  ├─ Button
│  └─ ErrorBoundary
│
├─ Services
│  ├─ kycService (upload, getStatus)
│  └─ other services
│
└─ Utils
   ├─ validation.js
   ├─ translations.js
   └─ mockData.js
```

### Backend Service Architecture

```
Controllers
├─ AuthController
│  ├─ Register (POST /api/auth/register)
│  ├─ Login (POST /api/auth/login)
│  └─ Refresh (POST /api/auth/refresh)
├─ CompaniesController
│  ├─ GetCompany (GET /api/companies/{id})
│  ├─ UpdateCompany (PUT /api/companies/{id})
│  ├─ UploadKyc (POST /api/companies/kyc/upload)
│  └─ GetKycStatus (GET /api/companies/kyc/status)
├─ ProductsController
│  ├─ GetProducts (GET /api/products)
│  ├─ CreateProduct (POST /api/products)
│  └─ GetProduct (GET /api/products/{id})
├─ RFQsController
│  ├─ GetRfqs (GET /api/rfqs)
│  ├─ CreateRfq (POST /api/rfqs)
│  ├─ SubmitBid (POST /api/rfqs/{id}/bids)
│  └─ AwardBid (POST /api/rfqs/{id}/bids/{bidId}/award)
└─ ... (other controllers)

Services (Business Logic)
├─ UserService
│  ├─ AuthenticateAsync
│  ├─ RegisterAsync
│  ├─ UploadKycFileAsync
│  └─ RefreshTokenAsync
├─ RFQService
│  ├─ CreateRfqAsync
│  ├─ GetRfqsAsync
│  └─ SubmitBidAsync
├─ ProductService
├─ OrderService
└─ ... (other services)

Repositories (Data Access)
├─ UserRepository
├─ RFQRepository
├─ ProductRepository
└─ ... (other repositories)
```

---

## 💾 Database Schema (Key Tables)

```
Users
├─ Id (PK)
├─ Email (unique)
├─ PasswordHash
├─ FirstName
├─ LastName
├─ Phone
├─ Type (Buyer/Supplier/Admin)
├─ CreatedAt
└─ UpdatedAt

Companies
├─ Id (PK)
├─ UserId (FK → Users)
├─ Name
├─ Address
├─ Phone
├─ TaxId
├─ Logo
├─ Description
└─ IsVerified

KycDocuments
├─ Id (PK)
├─ CompanyId (FK → Companies)
├─ DocumentType (Invoice/Certificate/License)
├─ FileUrl
├─ Status (Pending/Approved/Rejected)
├─ UploadedAt
└─ ReviewedAt

Products
├─ Id (PK)
├─ CompanyId (FK → Companies)
├─ Name
├─ Description
├─ Price
├─ Quantity
├─ Category
└─ CreatedAt

RFQs (Requests for Quotation)
├─ Id (PK)
├─ BuyerId (FK → Users)
├─ ProductName
├─ Quantity
├─ Budget
├─ Description
├─ Status (Open/Closed/Awarded)
└─ CreatedAt

RFQBids
├─ Id (PK)
├─ RFQId (FK → RFQs)
├─ SupplierId (FK → Users)
├─ QuotedPrice
├─ DeliveryDays
├─ Terms
└─ Status (Pending/Accepted/Rejected)

Orders
├─ Id (PK)
├─ RFQId (FK → RFQs)
├─ BidId (FK → RFQBids)
├─ Amount
├─ Status (Pending/Confirmed/Shipped/Delivered)
└─ CreatedAt

Escrows
├─ Id (PK)
├─ OrderId (FK → Orders)
├─ Amount
├─ Status (Held/Released/Refunded)
└─ CreatedAt

Shipments
├─ Id (PK)
├─ OrderId (FK → Orders)
├─ TrackingNumber
├─ Status (In Transit/Delivered)
└─ UpdatedAt

Reviews
├─ Id (PK)
├─ OrderId (FK → Orders)
├─ Rating (1-5)
├─ Comment
├─ CreatedAt
└─ Reviewer (Buyer/Supplier flag)
```

---

## 🔐 Security Layers

### Layer 1: Client-Side Validation
```javascript
// src/components/KycUploadWidget.jsx
if (file.size > 5 * 1024 * 1024) {
  showError('File too large')
  return
}
```

### Layer 2: Frontend HTTP Interception
```javascript
// src/config/api.js
config.headers['Authorization'] = `Bearer ${token}`
// Validates token exists before sending
```

### Layer 3: CORS & Vite Proxy
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

### Layer 4: JWT Validation
```csharp
// DealZone.API/Program.cs
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters {
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = key,
      ValidateLifetime = true
      // ... other validations
    };
  });
```

### Layer 5: Authorization
```csharp
// DealZone.API/Controllers/CompaniesController.cs
[Authorize]  // Only logged-in users
[HttpPost("kyc/upload")]
public async Task<IActionResult> UploadKyc(...) { }
```

### Layer 6: Server-Side Validation
```csharp
// DealZone.API/Services/UserService.cs
if (file.Length > 5 * 1024 * 1024) {
  throw new ArgumentException("File too large");
}
```

### Layer 7: Exception Handling
```csharp
// DealZone.API/Middleware/ExceptionMiddleware.cs
catch (Exception ex) {
  logger.LogError(ex);
  response.StatusCode = 500;
  response.Content = JsonSerializer.Serialize(
    new { error = "Internal server error" }
  );
}
```

---

## 🔄 Data Flow Examples

### Example 1: Complete KYC Upload Flow

```
Step 1: Frontend
  User selects file.pdf (2MB)
  KycUploadWidget validates size ✓
  kycService creates FormData
  
Step 2: HTTP
  POST /api/companies/kyc/upload
  Header: Authorization: Bearer eyJhbGc...
  Body: FormData { file, docType }
  Interceptor adds header + timeout
  
Step 3: Vite Proxy
  Forwards to http://localhost:5000/api/companies/kyc/upload
  
Step 4: Backend
  CompaniesController receives request
  [Authorize] validates JWT ✓
  UserService.UploadKycFileAsync()
    - Creates: wwwroot/uploads/kyc/123_1234567890_file.pdf
    - Database: INSERT into KycDocuments
    - Returns: FileUrl = "/uploads/kyc/123_..."
    
Step 5: Frontend
  Response: { status: "Pending", fileUrl: "/uploads/kyc/..." }
  Display success message ✓
  
Step 6: Access
  File accessible at: http://localhost:5000/uploads/kyc/123_...
```

### Example 2: Complete RFQ→Bid→Order Flow

```
BUYER SIDE:
1. LandingPage → CreateRFQ
   POST /api/rfqs { productName, qty, budget }
   Backend creates RFQ, returns RFQId=42
   
2. My RFQs → View incoming offers
   GET /api/rfqs/42/bids

SUPPLIER SIDE:
1. Marketplace → View available RFQs
   GET /api/rfqs?status=Open
   
2. Submit Bid
   POST /api/rfqs/42/bids { quotedPrice, deliveryDays }
   Backend creates RFQBid, notifies buyer

BUYER SIDE:
3. Received Offers → Review bids
   GET /api/rfqs/42/bids
   
4. Award bid to supplier
   POST /api/rfqs/42/bids/5/award
   Backend:
     - Creates Order
     - Creates Escrow
     - Updates RFQ status = "Awarded"
     - Notifies supplier

SUPPLIER SIDE:
5. My Orders → Start shipment
   PUT /api/orders/10/shipment { trackingNumber }
   
BUYER SIDE:
6. Track shipment → Confirm delivery
   POST /api/orders/10/confirm-delivery
   Backend releases escrow payment

BOTH:
7. Leave review
   POST /api/reviews { rating, comment }
```

---

## 📊 Performance Considerations

### Frontend Performance
- **Code Splitting:** Routes lazy-loaded
- **Bundle Size:** ~200KB JS (minified)
- **Caching:** Static assets cached
- **Re-renders:** Context prevents unnecessary updates

### Backend Performance
- **Database Queries:** Optimized with indexes
- **Connection Pooling:** EF Core manages pool
- **Caching:** Can add Redis layer
- **Compression:** gzip enabled

### Network Performance
- **Timeout:** 20 seconds for uploads
- **Proxy:** Vite proxy minimizes latency
- **JWT:** Stateless auth (no session lookup)
- **Refresh Logic:** Prevents 401 chains

---

## 🚀 Deployment Architecture

```
Production Environment
├─ Frontend
│  ├─ Static files (CDN)
│  ├─ SSL/HTTPS (Vercel/Netlify)
│  └─ Environment variables (.env.production)
├─ Backend
│  ├─ Docker container (optional)
│  ├─ SSL/HTTPS (reverse proxy)
│  └─ Environment variables (secrets)
├─ Database
│  ├─ Azure SQL / AWS RDS
│  ├─ Automated backups
│  └─ Read replicas (optional)
├─ File Storage
│  ├─ Azure Blob Storage / S3
│  ├─ CDN distribution
│  └─ Backup bucket
└─ Monitoring
   ├─ Application Insights
   ├─ Error logging (Sentry)
   └─ Performance monitoring (DataDog)
```

---

## 🔧 Development Environment Setup

```
Local Machine
├─ Node.js 18+
├─ .NET 8 SDK
├─ SQL Server 2019+ / SQL Server Express
├─ Git
└─ VS Code

Development Ports
├─ 5173: Frontend (Vite dev server)
├─ 5000: Backend (ASP.NET Core)
└─ 1433: SQL Server

Environment Variables (Frontend)
├─ VITE_API_URL=http://localhost:5000
└─ VITE_ENV=development

Environment Variables (Backend)
├─ ConnectionStrings.DefaultConnection
├─ Jwt.Secret
├─ Cors.AllowedOrigins
└─ FileUpload.MaxSize
```

---

## 📈 Scaling Strategy

### Phase 1: Current (Single Server)
- Frontend: Vite dev server (5173)
- Backend: Single ASP.NET process (5000)
- Database: Local SQL Server Express
- Suitable for: Development, testing, <100 users

### Phase 2: Production (Basic)
- Frontend: Static hosting (Vercel/Netlify)
- Backend: Single app server + reverse proxy
- Database: Managed SQL Server (Azure/AWS)
- File Storage: Blob storage (Azure/S3)

### Phase 3: Growth (Multiple Servers)
- Frontend: Multi-CDN global distribution
- Backend: Load-balanced app servers
- Database: Multi-region replicas
- Cache: Redis layer
- Queue: Message broker for async tasks

### Phase 4: Enterprise (Full Scale)
- Microservices architecture
- Kubernetes orchestration
- Event-driven design
- GraphQL API layer
- Real-time notifications (WebSocket)

---

**Last Updated:** May 22, 2026  
**Version:** 1.0.0  
**Architecture Reviewed:** ✅ Production Ready
