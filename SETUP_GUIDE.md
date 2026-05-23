# DealZone Setup & Verification Guide

## ✅ What Was Fixed

### 1. **Folder Structure**
- ✓ Created `DealZone.API/wwwroot/uploads` for file uploads
- ✓ Proper permissions set for ASP.NET static files

### 2. **Port Configuration**
- ✓ Backend: Changed from 5166 → **5000** (launchSettings.json)
- ✓ Frontend: Changed from 3000 → **5173** (vite.config.js + package.json)
- ✓ Vite proxy configured to forward `/api/*` to backend

### 3. **Frontend → Backend Connection**
- ✓ Updated `src/config/api.js` with optimized axios config
- ✓ Fixed baseURL to `http://localhost:5000/api` (removed hardcoded `/api` from endpoints)
- ✓ Auth token stored in separate localStorage keys: `token` + `refreshToken`
- ✓ Updated SignUp endpoint: `/auth/register` (was `/api/auth/register`)
- ✓ Updated Login endpoint: `/auth/login` (was `/api/auth/login`)
- ✓ Removed demo TestData page and route
- ✓ Removed automatic mock seeding from AppContext

### 4. **Windows Cleanup Script**
- ✓ Created `cleanup.ps1` for safe deletions (replaces `rm -rf`)
- ✓ Operations: `clean-node`, `clean-build`, `clean-all`, `reset-db`

---

## 🚀 How to Start Development

### Prerequisites
- Node.js 18+ installed
- .NET 8 SDK installed
- SQL Server Express (with database created)

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Start Both Services
```powershell
npm run dev
```

This runs **concurrently**:
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend: `http://localhost:5000` (ASP.NET Core)

OR run separately in different terminals:

**Terminal 1 - Frontend:**
```powershell
npm run frontend
```

**Terminal 2 - Backend:**
```powershell
npm run backend
```
OR
```powershell
cd DealZone.API
dotnet run
```

---

## ✅ Verification Checklist

After starting `npm run dev`, verify:

- [ ] **Frontend loads** at `http://localhost:5173` without 404s
- [ ] **Backend Swagger** opens at `http://localhost:5000/swagger` 
- [ ] **No `wwwroot` warning** in backend console
- [ ] **Console has no CORS errors** in browser DevTools
- [ ] **Sign-up page** appears and form works
- [ ] **Login with seeded account** works:
  - Email: `sales@nilemetalworks.eg`
  - Password: `NileSupply2026!`
- [ ] **After login**, redirects to correct dashboard (supplier/manufacturer)
- [ ] **Token saved** to localStorage as `token` key (check DevTools > Application > Local Storage)
- [ ] **API requests** show correct Authorization header with Bearer token

---

## 🔧 Safe Cleanup Operations

Using the new PowerShell script:

### Clean Everything
```powershell
.\cleanup.ps1 clean-all
```

### Clean Only Node Modules
```powershell
.\cleanup.ps1 clean-node
```

### Clean Only Build Artifacts
```powershell
.\cleanup.ps1 clean-build
```

### Reset Database (Recreate from migrations)
```powershell
.\cleanup.ps1 reset-db
```

---

## 📝 File Changes Summary

| File | Change |
|------|--------|
| `DealZone.API/Properties/launchSettings.json` | Port 5166 → 5000 |
| `vite.config.js` | Port 3000 → 5173, added proxy |
| `package.json` | Added `--port 5173` to scripts |
| `src/config/api.js` | Updated baseURL, token keys, timeout |
| `src/pages/SignUp.jsx` | API endpoint fixed, removed localStorage |
| `src/pages/Login.jsx` | API endpoint fixed, token storage updated |
| `src/context/AppContext.jsx` | Removed auto mock seeding |
| `src/App.jsx` | Removed TestData route |
| `src/pages/TestData.jsx` | **Deleted** |
| `DealZone.API/wwwroot/uploads/` | **Created** |
| `cleanup.ps1` | **Created** |

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Kill process using port 5000 or 5173
Get-Process | Where-Object {$_.Handles -eq 5000} | Stop-Process -Force
```

### CORS Errors
- Verify backend is running on 5000
- Check vite.config.js proxy is configured
- Clear browser cache and reload

### Token Not Persisting
- Check localStorage in DevTools (should have `token` key, not `auth`)
- Verify api.js is reading from correct keys
- Clear localStorage and login again

### Database Connection Error
- Verify SQL Server is running
- Check `appsettings.json` connection string
- Run migrations: `dotnet ef database update`

---

## 📚 Next Steps (Optional)

1. **Replace remaining mock data** with API calls in dashboards
2. **Implement file upload** using `/uploads` endpoint
3. **Set up TanStack Query** for data fetching
4. **Add environment variables** (.env file) for API URLs
5. **Configure production builds** and deployment

---

Generated: May 22, 2026
Status: ✅ Ready for Development
