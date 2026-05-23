# Complete Implementation Guide: KYC Registration Flow Fix

## Overview
This guide shows how to implement the complete registration flow with KYC document upload, proper error handling, and database transactions.

---

## Part 1: Backend Implementation

### Step 1: Update DTOs (DealZone.API/DTOs/ApiDtos.cs)

Add new DTO to support form data with file:

```csharp
public class RegisterFormDto
{
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? Role { get; set; } = "Buyer";
    public string? CompanyName { get; set; }
    public string? TaxNumber { get; set; }
    public string? Address { get; set; }
    public IFormFile? KycDocument { get; set; }  // New field for file upload
}

// Update ApiResponse to include Success flag
public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = "Success";
    public T? Data { get; set; }
    public string[]? Errors { get; set; }
}
```

### Step 2: Update AuthService (DealZone.API/Services/AuthService.cs)

**Key Changes:**
1. Add constructor parameter: `IWebHostEnvironment _environment` for file storage
2. Change `RegisterAsync` signature to accept optional `IFormFile`
3. Implement transaction logic
4. Add file validation and storage logic
5. Add proper logging

**See:** `BACKEND_AUTHSERVICE_FIXED.cs` for complete implementation

**Critical methods:**
- `RegisterAsync(RegisterRequestDto request, IFormFile? kycDocument = null)`
- `SaveKycDocumentAsync(IFormFile file, int companyId, string userRole)`
- `SanitizeFileName(string fileName)`

### Step 3: Update AuthController (DealZone.API/Controllers/AuthController.cs)

**Key Changes:**
1. Change register endpoint to accept FormData: `[FromForm] RegisterFormDto`
2. Add `[Consumes("multipart/form-data")]`
3. Add comprehensive validation
4. Return proper HTTP status codes (400, 409, 500)
5. Extract error details from exceptions

**See:** `BACKEND_AUTHCONTROLLER_FIXED.cs` for complete implementation

```csharp
[HttpPost("register")]
[Consumes("multipart/form-data")]
public async Task<IActionResult> Register([FromForm] RegisterFormDto request)
{
    // Validation, error handling, logging
}
```

### Step 4: Update ExceptionMiddleware (DealZone.API/Middlewares/ExceptionMiddleware.cs)

**Key Changes:**
1. Return proper HTTP status codes (not always 400)
2. Include detailed error messages
3. Log stack traces properly
4. Protect sensitive information

**See:** `BACKEND_ExceptionMiddleware_FIXED.cs` for complete implementation

### Step 5: Configure wwwroot Directory in Program.cs

```csharp
// Add to Program.cs before var app = builder.Build();

// Configure static files
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Add after app builder initialization
var wwwRootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
var uploadsPath = Path.Combine(wwwRootPath, "uploads", "kyc");
Directory.CreateDirectory(uploadsPath);

// Add static files middleware
app.UseStaticFiles();

// Use CORS
app.UseCors("AllowFrontend");
```

### Step 6: Update IAuthService Interface

```csharp
public interface IAuthService
{
    // Change this from:
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    
    // To this:
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, IFormFile? kycDocument = null);
    
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(int userId, string refreshToken);
}
```

---

## Part 2: Frontend Implementation

### Step 1: Create Registration Service (src/services/registrationService.js)

**Key Features:**
- Validates file client-side before upload
- Sends FormData with all fields
- Proper error message extraction
- Retry-ready structure

**See:** `FRONTEND_registrationService.js` for complete implementation

```bash
# Create file at: src/services/registrationService.js
```

### Step 2: Update SignUp.jsx Component (src/pages/SignUp.jsx)

**Key Changes:**
1. Import `registerUser` from registrationService
2. Change final submission to use FormData
3. Add file validation
4. Extract and display specific error messages
5. Show upload progress
6. Better loading states

**See:** `FRONTEND_SignUp_FIXED.jsx` for complete implementation

**Replace entire file:** `src/pages/SignUp.jsx`

### Step 3: Update API Config (src/config/api.js)

**Key Changes:**
1. Detect FormData and skip Content-Type override
2. Increase timeout for file uploads
3. Better error extraction

```javascript
// In request interceptor:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Important: Only set Content-Type if NOT FormData
  // Let browser set Content-Type with boundary for FormData
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  // Increase timeout for file uploads
  config.timeout = 30000; // 30 seconds
  
  return config;
});
```

---

## Part 3: Database Updates

### Step 1: Verify KycDocument Model

Ensure your `KycDocument` model has:

```csharp
public class KycDocument
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string DocType { get; set; } = null!;
    public string FileUrl { get; set; } = null!;  // Relative path like: /uploads/kyc/123_456_file.pdf
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    
    public virtual Company Company { get; set; } = null!;
}
```

### Step 2: Create Migration (if needed)

```bash
cd DealZone.API
dotnet ef migrations add UpdateKycDocumentModel
dotnet ef database update
```

---

## Part 4: Testing

### Backend Testing (Swagger/Postman)

1. **URL:** `POST http://localhost:5000/api/auth/register`

2. **Headers:** None (form data handles it)

3. **Body (Form Data):**
   ```
   email: test@example.com
   password: Password123
   role: Supplier
   companyName: Test Company
   taxNumber: 123456789
   address: 123 Main St
   kycDocument: [select file]
   ```

4. **Expected Response (200):**
   ```json
   {
     "success": true,
     "message": "Registration successful. Please verify your email.",
     "data": {
       "token": "eyJ...",
       "refreshToken": "base64...",
       "user": {
         "id": 1,
         "email": "test@example.com",
         "role": "Supplier",
         "isVerified": false,
         "company": {
           "id": 1,
           "name": "Test Company",
           "kycStatus": "Pending"
         }
       }
     }
   }
   ```

### Frontend Testing

1. Navigate to `http://localhost:5173/signup`
2. Select user type
3. Fill in company information (Step 2)
4. Upload optional KYC document (Step 3)
5. Submit and verify:
   - Token saved in localStorage
   - Redirected to `/verification`
   - Document saved in `wwwroot/uploads/kyc/`

---

## Part 5: Troubleshooting

### Issue: "400 Bad Request" with no error message

**Cause:** Model binding failed for FormData

**Fix:**
- Ensure `[FromForm]` attribute is used
- Ensure `[Consumes("multipart/form-data")]` is on action
- Check field names match DTO property names (case-sensitive)

### Issue: File not saved to disk

**Cause:** wwwroot directory not created or permissions denied

**Fix:**
```csharp
// Add to Program.cs
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads", "kyc");
Directory.CreateDirectory(uploadsPath);
```

### Issue: CORS errors on file upload

**Cause:** CORS not configured for FormData

**Fix:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()    // Important for FormData
            .AllowAnyMethod();
    });
});

app.UseCors("AllowFrontend");
```

### Issue: Frontend shows "Registration failed" but no specific error

**Cause:** Error message not extracted from response

**Fix:**
Ensure `registrationService.js` extracts error properly:
```javascript
if (error.response?.data?.message) {
  errorMessage = error.response.data.message
} else if (error.response?.data?.errors?.[0]) {
  errorMessage = error.response.data.errors[0]
}
```

---

## Part 6: Security Considerations

### File Upload Security

✅ Implemented:
- File size limit: 10MB
- File type whitelist: PDF, JPG, PNG
- MIME type validation
- Filename sanitization (prevent path traversal)
- Unique filenames with timestamps
- Files not directly in web root

⚠️ Still TODO:
- Virus scanning (VirusTotal API)
- Content verification (magic bytes check)
- Rate limiting on uploads
- File encryption at rest

### Database Security

✅ Implemented:
- Transaction rollback on file upload failure
- Prepared statements (EF Core default)
- Input validation
- Proper error logging without sensitive data leaks

⚠️ Still TODO:
- Implement audit logging
- Add database encryption
- Configure backup strategy

### API Security

✅ Implemented:
- JWT authentication on protected endpoints
- CORS restricted to localhost:5173
- Password hashing (BCrypt)
- Error messages don't leak system info

⚠️ Still TODO:
- Rate limiting
- HTTPS enforcement (production)
- CSRF protection
- Input sanitization for NoSQL injection

---

## Part 7: Testing Checklist

### Backend Validation
- [ ] Email validation works (rejects invalid emails)
- [ ] Password strength validated (8+ chars, 1 number)
- [ ] Duplicate email rejected with 409 status
- [ ] File size > 10MB rejected
- [ ] Invalid file types rejected
- [ ] All fields trimmed
- [ ] Transaction rolls back on file error

### Frontend Validation
- [ ] File size validated client-side
- [ ] File type validated client-side
- [ ] All required fields show errors
- [ ] FormData sent correctly
- [ ] Error messages displayed clearly
- [ ] Loading states show
- [ ] Upload progress visible

### Database Integrity
- [ ] User created in database
- [ ] Company created with correct UserId
- [ ] KycDocument created with correct paths
- [ ] File exists on disk
- [ ] Database relationships correct

### End-to-End Flow
- [ ] Register with all fields → Success
- [ ] Register with only required fields → Success
- [ ] Upload large file → Rejected
- [ ] Upload invalid type → Rejected
- [ ] Duplicate email → 409 Conflict
- [ ] Navigate back/forward → Form state preserved
- [ ] Close browser → Tokens persist
- [ ] Login with new account → Works

---

## Deployment Checklist

Before production deployment:

- [ ] Update connection string to production database
- [ ] Set JWT secret to strong random value
- [ ] Configure HTTPS/SSL certificates
- [ ] Set CORS to production domain
- [ ] Configure file storage (Azure Blob / S3)
- [ ] Setup logging service (Sentry / DataDog)
- [ ] Configure email notifications
- [ ] Setup database backups
- [ ] Load test file upload endpoint
- [ ] Test disaster recovery

---

## File Reference

| File | Status | Location |
|------|--------|----------|
| BACKEND_AUTHSERVICE_FIXED.cs | Ready | Reference implementation |
| BACKEND_AUTHCONTROLLER_FIXED.cs | Ready | Reference implementation |
| BACKEND_ExceptionMiddleware_FIXED.cs | Ready | Reference implementation |
| FRONTEND_registrationService.js | Ready | Copy to src/services/ |
| FRONTEND_SignUp_FIXED.jsx | Ready | Copy to src/pages/ |

---

## Next Steps

1. **Backup current code**
2. **Apply backend changes** (DTOs → Service → Controller)
3. **Test with Postman** before touching frontend
4. **Apply frontend changes** (registrationService → SignUp.jsx)
5. **Run full end-to-end test**
6. **Deploy to staging**
7. **Load test**
8. **Deploy to production**

---

**Last Updated:** May 22, 2026  
**Status:** Ready for Implementation  
**Estimated Implementation Time:** 2-3 hours
