# DealZone Quick Reference Guide

## 🚀 Start Development (60 seconds)

```powershell
cd d:\Desktop\DealZone\DealZone
npm install
npm run dev
```

**Result:**
- Frontend: http://localhost:5173 ✅
- Backend: http://localhost:5000 ✅
- Swagger: http://localhost:5000/swagger ✅

---

## 📍 Key URLs

### Frontend
| Page | URL | Purpose |
|------|-----|---------|
| Landing | http://localhost:5173 | Homepage |
| SignUp | http://localhost:5173/signup | User registration |
| Login | http://localhost:5173/login | User login |
| Dashboard | http://localhost:5173/dashboard | User dashboard |
| Marketplace | http://localhost:5173/marketplace | Browse products |
| My RFQs | http://localhost:5173/my-rfqs | View requests |
| Admin | http://localhost:5173/admin | Admin panel |

### Backend
| Endpoint | URL | Purpose |
|----------|-----|---------|
| Swagger | http://localhost:5000/swagger | API documentation |
| Health | http://localhost:5000/health | Health check |

---

## 🔑 Test Accounts (Pre-seeded)

### Buyer Account
- **Email:** buyer@dealzone.com
- **Password:** BuyerPass2026!
- **Company:** DealZone Buyers

### Supplier Account
- **Email:** supplier@dealzone.com
- **Password:** SupplierPass2026!
- **Company:** DealZone Suppliers

### Admin Account
- **Email:** admin@dealzone.com
- **Password:** AdminPass2026!

---

## 🔧 Important Ports

| Service | Port | Status |
|---------|------|--------|
| Frontend (Vite) | 5173 | ✅ Standard |
| Backend (ASP.NET) | 5000 | ✅ Standard |
| Backend HTTPS | 7000 | (not used in dev) |
| Backend Old | 5166 | ❌ Deprecated |
| Frontend Old | 3000 | ❌ Deprecated |

---

## 📂 Important Directories

```
d:\Desktop\DealZone\DealZone\
├── src/                          # React source code
├── DealZone.API/
│   ├── Controllers/              # API endpoints
│   ├── Services/                 # Business logic
│   ├── Models/                   # Database models
│   ├── wwwroot/
│   │   └── uploads/
│   │       └── kyc/              # KYC file storage
│   └── Program.cs                # App startup
└── package.json                  # NPM config
```

---

## 🧪 Test User Workflows

### 1. User Registration
```
1. Go to http://localhost:5173/signup
2. Enter: name, email, password, company, phone
3. Submit → Backend creates user in database
4. Redirected to verification page
```

### 2. User Login
```
1. Go to http://localhost:5173/login
2. Enter email & password
3. Submit → Backend validates, returns JWT tokens
4. Tokens stored in localStorage
5. Redirected to dashboard
```

### 3. KYC Upload
```
1. Go to Profile → KYC Documents
2. Upload file (jpg/jpeg/png/pdf, < 5MB)
3. Submit → File saved to wwwroot/uploads/kyc/
4. Database updated with file URL
5. Status shows "Pending Review"
```

### 4. Create RFQ
```
1. Go to Dashboard → Create RFQ
2. Fill details: product, quantity, budget
3. Submit → Backend creates RFQ in database
4. Suppliers notified
```

### 5. Submit Bid
```
1. Go to Marketplace → View RFQ
2. Click "Submit Bid"
3. Enter price & terms
4. Submit → Backend creates bid record
5. Buyer notified
```

---

## 🗄️ Database Info

### Connection String
```
Server=localhost\SQLEXPRESS
Database=DealZoneDB
Integrated Security=true
```

### Key Tables
- Users (accounts & authentication)
- Companies (buyer/supplier profiles)
- Products (marketplace items)
- RFQs (requests for quotation)
- RFQBids (supplier responses)
- Orders (confirmed purchases)
- Escrows (payment security)
- Shipments (delivery tracking)
- Reviews (ratings & feedback)
- KycDocuments (file uploads)

### Verify Database Connection
```powershell
# In SQL Server Management Studio
Server: localhost\SQLEXPRESS
Database: DealZoneDB
Query: SELECT COUNT(*) FROM Users
```

---

## 🔐 Authentication

### How JWT Works
1. User logs in with email/password
2. Backend validates credentials
3. Backend generates JWT token (expires 1 hour)
4. Token sent to frontend, stored in localStorage
5. Every API request includes token in header
6. Backend validates token, processes request
7. On token expiry, backend returns 401
8. Frontend uses refresh token to get new token

### Token Storage
```javascript
// localStorage keys
localStorage.getItem('token')         // JWT access token
localStorage.getItem('refreshToken')  // Refresh token
```

---

## 🐛 Troubleshooting

### Issue: "Port 5173 already in use"
```powershell
# Kill the process
Stop-Process -Name "node" -Force
# Or manually find & kill via Task Manager
```

### Issue: "Cannot find module" error
```powershell
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm run dev
```

### Issue: "WebRootPath not found"
```powershell
# Run cleanup utility
.\cleanup.ps1 clean-all
# Then restart
npm run dev
```

### Issue: KYC upload fails
```powershell
# Check folder exists
Test-Path "DealZone.API/wwwroot/uploads/kyc"

# Check permissions
# Restart backend
# Try uploading again
```

### Issue: "401 Unauthorized" everywhere
```
1. Clear localStorage: DevTools → Application → Local Storage → Clear
2. Log out
3. Log in again with correct credentials
4. Should work
```

---

## 🎯 Key API Endpoints

### Auth
```
POST /api/auth/register     → Create user
POST /api/auth/login        → Get JWT token
POST /api/auth/refresh      → Get new token
```

### Companies
```
GET  /api/companies/{id}    → Get company details
PUT  /api/companies/{id}    → Update company
POST /api/companies/kyc/upload  → Upload KYC file
GET  /api/companies/kyc/status  → Get KYC status
```

### Products
```
GET  /api/products          → List products
POST /api/products          → Create product
GET  /api/products/{id}     → Get product details
```

### RFQs
```
GET  /api/rfqs              → List RFQs
POST /api/rfqs              → Create RFQ
GET  /api/rfqs/{id}         → Get RFQ details
POST /api/rfqs/{id}/bids    → Submit bid
```

### Orders
```
GET  /api/orders            → List orders
POST /api/orders            → Create order
GET  /api/orders/{id}       → Get order details
```

---

## 📊 File Upload Flow

```
User selects file (frontend)
         ↓
KycUploadWidget validates size & type
         ↓
kycService.uploadKycFile() creates FormData
         ↓
axios.post('/api/companies/kyc/upload', formData)
         ↓
CompaniesController receives IFormFile
         ↓
UserService.UploadKycFileAsync() saves to wwwroot/uploads/kyc/
         ↓
KycDocuments table updated in database
         ↓
FileUrl returned to frontend
         ↓
Toast notification: "Upload successful!"
```

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Change all passwords
- [ ] Configure HTTPS/SSL
- [ ] Set up environment variables
- [ ] Configure database backups
- [ ] Set up monitoring/logging
- [ ] Test disaster recovery
- [ ] Run security audit
- [ ] Load test the system
- [ ] Document deployment process
- [ ] Plan rollback strategy

---

## 📞 Support Commands

### View All Running Processes
```powershell
Get-Process | Where-Object {$_.Name -match "node|dotnet"}
```

### Check Port Availability
```powershell
netstat -ano | findstr :5173
netstat -ano | findstr :5000
```

### View Backend Logs
```powershell
cd DealZone.API
dotnet run --verbose
```

### Database Backup
```powershell
# Backup database
.\cleanup.ps1 backup-db

# Restore database
.\cleanup.ps1 restore-db
```

---

## 🎓 Development Workflow

### Standard Development Cycle
1. **Create feature branch**
   ```powershell
   git checkout -b feature/my-feature
   ```

2. **Make changes** in frontend or backend

3. **Test locally**
   ```powershell
   npm run dev
   # Test in browser + Swagger
   ```

4. **Commit changes**
   ```powershell
   git add .
   git commit -m "feat: description of changes"
   ```

5. **Push and create PR**
   ```powershell
   git push origin feature/my-feature
   ```

6. **Review and merge**
   ```powershell
   git checkout main
   git pull
   ```

---

## 💾 Data Persistence

### Where Data is Stored
- **User accounts:** SQL Server database (DealZoneDB)
- **Tokens:** Browser localStorage
- **KYC files:** wwwroot/uploads/kyc/
- **Products:** SQL Server database
- **Orders:** SQL Server database
- **Chat messages:** SQL Server database (future)

### Data Is NOT Stored In
- ❌ localStorage (except tokens)
- ❌ sessionStorage
- ❌ Cookies
- ❌ Browser cache (for critical data)

---

## 🔄 Token Refresh Flow

```
Request with expired token
         ↓
Backend returns 401 Unauthorized
         ↓
Frontend interceptor catches 401
         ↓
Use refreshToken to call /api/auth/refresh
         ↓
Backend validates refreshToken, returns new token
         ↓
Frontend stores new token in localStorage
         ↓
Retry original request with new token
         ↓
Request succeeds
```

---

## 📝 Important Notes

1. **Always use `npm run dev`** - starts both services
2. **Frontend runs on 5173**, not 3000 (old config)
3. **Backend runs on 5000**, not 5166 (old config)
4. **KYC files** are stored server-side, not sent as strings
5. **Tokens** are separate: `token` + `refreshToken`
6. **No mock data** - everything from backend
7. **FormData** is used for file uploads
8. **Axios** handles JWT injection automatically

---

**Last Updated:** May 22, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
