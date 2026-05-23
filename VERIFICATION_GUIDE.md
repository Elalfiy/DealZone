# DealZone Full Stack - Complete Verification & Testing Guide

## ✅ Pre-Startup Checklist

### Backend Prerequisites
- [ ] .NET 8 SDK installed: `dotnet --version`
- [ ] SQL Server Express running
- [ ] Database `DealZoneDB` created
- [ ] Migrations applied: `dotnet ef database update`

### Frontend Prerequisites
- [ ] Node.js 18+ installed: `node --version`
- [ ] npm 9+ installed: `npm --version`
- [ ] Dependencies installed: `npm install` (run in root folder)

---

## 🚀 Step-by-Step Startup

### Option 1: Start Both Services Together
```powershell
cd d:\Desktop\DealZone\DealZone
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help

[Vite] ready - http://localhost:5173/

info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to stop, Ctrl+BREAK to pause.
```

### Option 2: Start Separately

**Terminal 1 - Frontend:**
```powershell
cd d:\Desktop\DealZone\DealZone
npm run frontend
```

**Terminal 2 - Backend:**
```powershell
cd d:\Desktop\DealZone\DealZone\DealZone.API
dotnet run
```

---

## ✅ Immediate Verification (After Startup)

### 1. Check Backend Health
```powershell
curl http://localhost:5000/swagger
# Or open in browser
```
Expected: Swagger UI loads

### 2. Check Frontend Load
```powershell
curl http://localhost:5173
# Or open in browser
```
Expected: DealZone homepage loads

### 3. Check Browser Console
Open DevTools (F12) → Console
- [ ] No CORS errors
- [ ] No 404 on assets
- [ ] No port warnings

### 4. Check Network Tab
- [ ] No failed API requests
- [ ] API calls show 200/201 status
- [ ] Authorization headers present

---

## 🧪 Complete End-to-End Flow Testing

### Test 1: User Registration
**Steps:**
1. Go to `http://localhost:5173/signup`
2. Select "Supplier" user type
3. Fill in:
   - Company Name: `Test Supplier Inc`
   - Email: `testsupplier@example.com`
   - Password: `TestPassword123!`
   - Confirm Password: `TestPassword123!`
   - Phone: `+201001234567`
   - Address: `Cairo, Egypt`
4. Click Continue and complete the form
5. Verify redirect to `/verification`

**Expected Result:** ✅
- User created in database
- No error messages
- Redirect successful

**Verify in Database:**
```sql
SELECT * FROM Users WHERE Email = 'testsupplier@example.com'
SELECT * FROM Companies WHERE Name = 'Test Supplier Inc'
```

---

### Test 2: User Login
**Steps:**
1. Go to `http://localhost:5173/login`
2. Enter credentials:
   - Email: `sales@nilemetalworks.eg` (seeded account)
   - Password: `NileSupply2026!`
3. Click Sign In

**Expected Result:** ✅
- No error messages
- Redirect to `/dashboard/supplier`
- User profile visible in header

**Verify in LocalStorage:**
Open DevTools → Application → Local Storage
- [ ] `token` key present with JWT value
- [ ] `refreshToken` key present

---

### Test 3: KYC Document Upload
**Prerequisites:** Must be logged in

**Steps:**
1. Go to `http://localhost:5173/profile` (or account settings)
2. Find KYC Verification section
3. Select Document Type: "Business License"
4. Click upload area
5. Select a file: `test-document.jpg` (< 5MB)
6. Click "Upload Document"

**Expected Result:** ✅
- Success message appears
- File saved to: `wwwroot/uploads/kyc/`
- Status shows "Pending"
- In Database:
  ```sql
  SELECT * FROM KycDocuments WHERE CompanyId = [company_id]
  ```
  Shows: Status = 'Pending', FileUrl populated

---

### Test 4: Create RFQ (Request for Quotation)
**Prerequisites:** Logged in as Buyer (manufacturer)

**Steps:**
1. Go to `/create-rfq`
2. Fill form:
   - Title: "Need 1000 Steel Bolts"
   - Category: "Raw Materials"
   - Quantity: "1000"
   - Unit: "pieces"
   - Budget: "5000"
3. Click Submit

**Expected Result:** ✅
- RFQ created successfully
- Redirect to RFQ details page
- Status shows "Active"
- Can view in `/dashboard/manufacturer/rfqs`

**Verify in Database:**
```sql
SELECT * FROM RFQs WHERE Title LIKE '%Steel%'
```

---

### Test 5: Submit Bid on RFQ
**Prerequisites:** Logged in as Supplier

**Steps:**
1. Go to `/dashboard/supplier/rfqs`
2. Find and click the RFQ from Test 4
3. Click "Submit Bid"
4. Fill:
   - Price per Unit: "5"
   - Delivery Days: "7"
   - Comments: "Best quality guaranteed"
5. Click Submit

**Expected Result:** ✅
- Bid submitted
- Notification appears
- In database:
  ```sql
  SELECT * FROM RFQBids WHERE RFQId = [rfq_id]
  ```

---

### Test 6: Award Bid (Create Order)
**Prerequisites:** Supplier submitted bid, now logged in as Buyer

**Steps:**
1. Go to `/dashboard/manufacturer/offers`
2. Find the bid from Test 5
3. Click "Award Bid"
4. Confirm action

**Expected Result:** ✅
- Bid marked as "Awarded"
- Order created automatically
- Redirect to Order/Escrow page
- In database:
  ```sql
  SELECT * FROM Orders WHERE RFQId = [rfq_id]
  SELECT * FROM Escrows WHERE OrderId = [order_id]
  ```

---

### Test 7: Create Escrow & Confirm Payment
**Steps:**
1. From awarded bid, click "Proceed to Escrow"
2. Review order details
3. Click "Deposit to Escrow"
4. Confirm transaction

**Expected Result:** ✅
- Escrow status: "Awaiting Buyer Confirmation"
- Payment marked as confirmed
- Email notification sent (if configured)

---

### Test 8: Shipment Tracking
**Steps:**
1. After order payment confirmed, go to `/dashboard/manufacturer/shipments`
2. Find the shipment
3. Click to view tracking
4. Supplier updates status

**Expected Result:** ✅
- Shipment statuses: "Processing" → "Shipped" → "Delivered"
- Tracking URL accessible
- Buyer receives notifications

---

### Test 9: Review & Rating
**Steps:**
1. After delivery, go to `/rating/[dealId]`
2. Fill review:
   - Rating: 5 stars
   - Comment: "Excellent service!"
3. Submit

**Expected Result:** ✅
- Review saved
- Rating affects supplier profile
- In database:
  ```sql
  SELECT * FROM Reviews WHERE OrderId = [order_id]
  ```

---

## 🔍 Database Verification Queries

### Check All Seeded Companies
```sql
SELECT Id, Name, UserId, KycStatus FROM Companies
```

### Check Token Refresh Operations
```sql
SELECT * FROM RefreshTokens WHERE ExpiryDate > GETUTCDATE()
```

### Check All RFQs with Bids
```sql
SELECT r.Id, r.Title, COUNT(b.Id) as BidCount 
FROM RFQs r
LEFT JOIN RFQBids b ON r.Id = b.RFQId
GROUP BY r.Id, r.Title
```

### Check Order & Escrow Status
```sql
SELECT o.Id, o.Status, e.Status as EscrowStatus, e.Amount
FROM Orders o
JOIN Escrows e ON o.Id = e.OrderId
```

### Check KYC Submissions
```sql
SELECT c.Name, k.DocType, k.Status, k.SubmittedAt
FROM KycDocuments k
JOIN Companies c ON k.CompanyId = c.Id
ORDER BY k.SubmittedAt DESC
```

---

## ⚠️ Common Issues & Solutions

### Issue: "wwwroot not found" warning
**Solution:**
```powershell
# Already created by startup, but ensure it exists:
New-Item -ItemType Directory -Path "DealZone.API/wwwroot/uploads/kyc" -Force
```

### Issue: Port 5000 or 5173 already in use
**Solution:**
```powershell
# Kill process using port
Get-Process | Where-Object {$_.Port -eq 5000} | Stop-Process -Force

# Or use cleanup script
.\cleanup.ps1 clean-all
```

### Issue: CORS error "Access denied"
**Check:**
- Frontend URL matches CORS policy in Program.cs (should be 5173)
- Backend is running on 5000
- Refresh page and check browser console

### Issue: "Invalid token" after login
**Solution:**
- Clear localStorage: `localStorage.clear()` in console
- Logout and login again
- Check token expiration: `jwt.io` decode the token

### Issue: KYC upload fails
**Check:**
```powershell
# Verify uploads folder exists
Test-Path "DealZone.API/wwwroot/uploads/kyc"

# Check file permissions
Get-Acl "DealZone.API/wwwroot/uploads/kyc"

# Check file size (must be < 5MB)
Get-Item "[file path]" | Select-Object Length
```

### Issue: Database migration errors
**Solution:**
```powershell
cd DealZone.API
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## 📊 Performance Monitoring

### Check Response Times
Open DevTools → Network → Check timing for API calls
- Target: < 500ms for most requests
- Acceptable: < 1000ms

### Check Bundle Size
```powershell
npm run build
# Check dist folder size
```

### Monitor Database
```sql
-- Check slow queries
SELECT * FROM sys.dm_exec_requests WHERE status != 'sleeping'

-- Check table sizes
SELECT 
    TABLE_NAME,
    ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS SizeMB
FROM information_schema.TABLES
GROUP BY TABLE_NAME
```

---

## 🎯 Success Criteria

Your setup is ✅ **READY FOR PRODUCTION** when:

- [ ] Both services start without errors
- [ ] No wwwroot warnings
- [ ] Registration → Login flow works
- [ ] KYC upload saves files correctly
- [ ] RFQ creation succeeds
- [ ] Bid submission works
- [ ] Order creation automatic
- [ ] Escrow workflow completes
- [ ] Shipment tracking updates
- [ ] Reviews persist correctly
- [ ] Database queries return data
- [ ] No CORS or auth errors
- [ ] File upload saves to correct folder
- [ ] Token refresh works seamlessly
- [ ] All navigation links work

---

## 📞 Support Commands

```powershell
# Full system restart
npm run dev

# Clean and restart
.\cleanup.ps1 clean-all
npm install
npm run dev

# Database reset
.\cleanup.ps1 reset-db

# View logs
dotnet run --verbose
```

---

**Generated:** May 22, 2026
**Status:** ✅ Complete Setup & Testing Guide
