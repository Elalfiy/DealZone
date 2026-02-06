# DealZone — Full UserFlow Explained Simply

## 🎯 User Types Overview

DealZone has **3 types of users**:

1. **Manufacturer (Buyer)** - Companies that buy materials/products
2. **Supplier (Seller)** - Companies that sell materials/products  
3. **Admin** - Platform administrators (not industrial users)

---

## 🔵 MANUFACTURER (Buyer) User Flow

### What Manufacturers Do
Manufacturers come to DealZone to **buy materials**, **request quotes**, **create auctions**, and **pay via Escrow**.

### Registration Flow
1. **Landing Page** → Click "Sign Up as Manufacturer"
2. **Sign Up** → Choose "Manufacturer" account type
3. **Email Verification** → Verify email address
4. **KYC Upload** → Upload business documents (Commercial Register, Tax Certificate, etc.)
5. **Verification Pending** → Wait for admin approval
6. **Manufacturer Dashboard** → Start using the platform

### Pages Manufacturers Can See

#### ✅ Dashboard
- **Overview**: Active deals, pending payments, shipments, offers received
- **Quick Actions**: 
  - Create RFQ
  - View Offers
  - Active Deals
- **Recent Deals**: List of recent transactions
- **AI Supplier Suggestions**: Recommended suppliers based on needs

#### ✅ Marketplace
- **Products Tab**: Browse all available products
- **Requests Tab**: View RFQs from other manufacturers
- **Product Details**: View full product information
- **Request Details**: View RFQ details
- **Filters & Search**: Filter by category, price, location

#### ✅ RFQ System
- **Create RFQ**: Create a new Request for Quotation
- **My RFQs**: View all RFQs you created
- **Received Offers**: View offers from suppliers for your RFQs
- **Offer Details**: View full offer information
- **Accept/Reject Offer**: Accept or reject supplier offers
- **Start Deal**: Convert accepted offer to a deal

#### ✅ Auctions
- **Create Auction**: Convert an RFQ to an auction
- **Join Auction**: Participate in existing auctions
- **View Auction Details**: See auction information
- **Place Bid**: Submit a bid amount
- **Bid History**: View all bids on an auction

#### ✅ Deals
- **Deal Tracking**: Monitor deal progress
- **Escrow Payment**: Make secure payment
- **Shipping Tracking**: Track shipment status
- **Dispute Center**: File disputes if needed
- **Rate Supplier**: Rate supplier after deal completion

#### ✅ Chat
- **Chat with Suppliers**: Message suppliers directly
- **Send Files**: Attach documents/files
- **Convert to Deal**: Convert chat conversation to deal
- **Request Escrow Payment**: Request payment setup

#### ✅ Profile Settings
- **Company Info**: Edit company details
- **KYC Status**: View verification status
- **Payment Methods**: Manage payment methods
- **Notification Settings**: Configure notifications

#### ✅ ReDeal Zone (Optional)
- Browse surplus/recycled products

### Pages Manufacturers CANNOT See ❌
- Add Product
- My Products
- Incoming RFQs
- My Offers (as supplier)
- Supplier Dashboard
- Admin Panel
- Supplier-specific analytics

---

## 🟨 SUPPLIER (Seller) User Flow

### What Suppliers Do
Suppliers come to DealZone to **sell materials**, **respond to RFQs**, **participate in auctions**, and **receive Escrow payments**.

### Registration Flow
1. **Landing Page** → Click "Sign Up as Supplier"
2. **Sign Up** → Choose "Supplier" account type
3. **Email Verification** → Verify email address
4. **KYC Upload** → Upload business documents
5. **Verification Pending** → Wait for admin approval
6. **Supplier Dashboard** → Start using the platform

### Pages Suppliers Can See

#### ✅ Dashboard
- **Overview**: Offers sent, won deals, pending escrow, active products
- **Quick Actions**:
  - Add Product
  - View RFQs
  - Send Offer
- **Recent Offers**: List of recent offers sent
- **Performance Rating**: Rating, on-time delivery, response time

#### ✅ Marketplace
- **Products Tab**: Browse all products (including competitors)
- **Requests Tab**: View RFQs from manufacturers
- **Product Details**: View product information
- **Request Details**: View RFQ details
- **Join Auction**: Participate in auctions
- **Place Bid**: Submit bids

#### ✅ Product Management
- **Add Product**: Create new product listing
- **My Products**: View all your products
- **Edit/Delete Products**: Manage product listings

#### ✅ RFQ Interaction
- **Incoming RFQs**: View RFQs from manufacturers
- **Send Offer**: Submit offer for an RFQ
- **My Offers**: View all offers you sent
- **Offer Details**: View offer information
- **Win/Lose Status**: See if offer was accepted/rejected

#### ✅ Auction Participation
- **Join Auction**: Participate in auctions
- **Place Bid**: Submit bid amount
- **Bid History**: View all bids
- **Live Updates**: See real-time auction updates

#### ✅ Deals
- **Deal Tracking**: Monitor deal progress
- **Shipping**: Initiate shipment (supplier responsibility)
- **Escrow Release Tracking**: Track payment release
- **Dispute Handling**: Handle disputes

#### ✅ Chat
- **Chat with Manufacturers**: Message manufacturers
- **Send Quote from Chat**: Send pricing via chat
- **Send Product PDF/Specs**: Share documents
- **Convert to Deal**: Convert chat to deal

#### ✅ Profile Settings
- **Company Info**: Edit company details
- **KYC**: View/manage verification
- **Payment Methods**: Manage payment methods
- **Notifications**: Configure notifications

#### ✅ ReDeal Zone (Optional)
- Browse surplus products

### Pages Suppliers CANNOT See ❌
- Create RFQ
- My RFQs (as manufacturer)
- Received Offers (as manufacturer)
- Create Auction (from RFQ)
- Manufacturer Dashboard
- Admin Panel
- Manufacturer statistics

---

## 🔴 ADMIN User Flow

### What Admins Do
Admins are **platform administrators** (not industrial users). They manage the platform, approve users, and handle disputes.

### Registration Flow
- Admins are created manually (not through public signup)
- Access via `/admin` route

### Pages Admins Can See

#### ✅ Admin Dashboard
- **Overview**: Platform statistics and KPIs
- **Users List**: View all registered users
- **Approve/Reject KYC**: Review and approve user verifications
- **Disputes Handling**: Manage and resolve disputes
- **Platform KPIs**: View platform metrics
- **View All Deals**: Monitor all transactions
- **Category Management**: Manage product categories
- **Export Reports**: Generate platform reports
- **Suspend Users**: Suspend problematic users
- **Edit Marketplace Categories**: Manage categories

#### ✅ Settings
- Platform configuration

### Pages Admins CANNOT See ❌
- Manufacturer Dashboard
- Supplier Dashboard
- Create RFQ
- Add Product
- Marketplace (as buyer/seller)
- All user-specific pages

---

## 🔄 Complete Deal Flow: RFQ → Offer → Auction → Deal → Escrow → Shipping → Rating

### Step-by-Step Process

#### 1. **RFQ Creation** (Manufacturer)
- Manufacturer creates RFQ with requirements
- RFQ appears in marketplace and supplier dashboards

#### 2. **Offer Submission** (Supplier)
- Supplier views RFQ
- Supplier submits offer with price, quantity, delivery date
- Offer appears in manufacturer's "Received Offers"

#### 3. **Auction Option** (Manufacturer)
- Manufacturer can convert RFQ to auction
- Multiple suppliers can bid
- Highest bid wins

#### 4. **Offer Acceptance** (Manufacturer)
- Manufacturer reviews offers
- Accepts best offer
- System automatically creates deal

#### 5. **Deal Creation**
- Deal is created with all details
- Both parties can view deal in "Deal Tracking"

#### 6. **Escrow Payment** (Manufacturer)
- Manufacturer pays to Escrow
- Money is held securely
- Supplier sees payment status

#### 7. **Shipping** (Supplier)
- Supplier ships product
- Updates tracking information
- Manufacturer tracks shipment

#### 8. **Delivery Confirmation** (Manufacturer)
- Manufacturer confirms delivery
- Escrow releases payment to supplier

#### 9. **Rating & Review** (Both)
- Both parties can rate each other
- Reviews appear on profiles
- Ratings affect supplier visibility

---

## 🧭 Navigation Logic

### Sidebar Menu
- **Manufacturer Sidebar**: Shows only manufacturer-accessible pages
- **Supplier Sidebar**: Shows only supplier-accessible pages
- **Admin Sidebar**: Shows only admin pages

### Route Protection
- **Protected Routes**: Require login
- **Type-Specific Routes**: Only accessible by specific user type
- **Admin Routes**: Only accessible by admins
- **Automatic Redirects**: Non-authorized users redirected to their dashboard

### Button Actions

#### View Supplier Profile
- **Location**: Product Details, Manufacturer Dashboard
- **Action**: Navigate to `/supplier/:supplierId`
- **Shows**: Supplier info, KYC status, rating, products, contact options

#### Contact Supplier
- **Location**: View Supplier page
- **Action**: Opens chat with supplier
- **Creates**: New chat conversation

#### View Reviews
- **Location**: View Supplier page
- **Action**: Navigate to reviews filtered by supplier

#### Accept Offer
- **Location**: Received Offers page
- **Action**: Accepts offer, creates deal automatically
- **Redirects**: To Escrow Payment page

#### Reject Offer
- **Location**: Received Offers page
- **Action**: Rejects offer, updates status

#### Create RFQ
- **Location**: Dashboard, Sidebar
- **Action**: Opens RFQ creation form
- **Result**: RFQ appears in marketplace

#### Add Product
- **Location**: Dashboard, Sidebar (Supplier only)
- **Action**: Opens product creation form
- **Features**: Upload image, set price, add description

#### Start Deal
- **Location**: Offer details, Product details
- **Action**: Creates deal from offer/product
- **Redirects**: To Escrow Payment

---

## 📱 Responsive Design

- **Mobile**: Sidebar hidden, hamburger menu in Navbar
- **Tablet**: Sidebar visible, adjusted spacing
- **Desktop**: Full sidebar, optimal layout

---

## 🌐 Language Support

- **English**: Default language
- **Arabic**: Full RTL support
- **Language Switcher**: Available in Navbar
- **All Content**: Fully translated

---

## 🔐 Security & Access Control

### Authentication
- Users must login to access protected pages
- Session persists via localStorage

### Authorization
- Each page checks user type
- Unauthorized access redirects to appropriate dashboard
- Admin routes protected separately

### Data Persistence
- All data saved to localStorage
- Persists across page refreshes
- Ready for backend integration

---

## ✅ Summary

**Manufacturers** buy, create RFQs, accept offers, and pay via Escrow.

**Suppliers** sell, respond to RFQs, send offers, and receive Escrow payments.

**Admins** manage the platform, approve users, and handle disputes.

Each user type has a **distinct dashboard**, **separate sidebar menu**, and **access only to relevant pages**.

All flows are **protected**, **responsive**, and **fully functional**.

