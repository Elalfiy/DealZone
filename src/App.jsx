import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { LanguageProvider } from './context/LanguageContext'
import Toast from './components/Toast'
import LandingPage from './pages/LandingPage'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Verification from './pages/Verification'
import ManufacturerDashboard from './pages/ManufacturerDashboard'
import SupplierDashboard from './pages/SupplierDashboard'
import Marketplace from './pages/Marketplace'
import ProductDetails from './pages/ProductDetails'
import RequestDetails from './pages/RequestDetails'
import EscrowPayment from './pages/EscrowPayment'
import DealTracking from './pages/DealTracking'
import ShippingTracking from './pages/ShippingTracking'
import RatingReview from './pages/RatingReview'
import ReDealZone from './pages/ReDealZone'
import TestData from './pages/TestData'
import EmailVerification from './pages/EmailVerification'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProfileSettings from './pages/ProfileSettings'
import AdminPanel from './pages/AdminPanel'
import CreateRFQ from './pages/CreateRFQ'
import TendersListPage from './pages/TendersListPage'
import CreateTenderPage from './pages/CreateTenderPage'
import TenderDetailsPage from './pages/TenderDetailsPage'
import AboutPage from './pages/AboutPage'
import MyRFQs from './pages/MyRFQs'
import ReceivedOffers from './pages/ReceivedOffers'
import MyOffers from './pages/MyOffers'
import Payments from './pages/Payments'
import Shipments from './pages/Shipments'
import Reviews from './pages/Reviews'
import IncomingRFQs from './pages/IncomingRFQs'
import MyProducts from './pages/MyProducts'
import ViewSupplier from './pages/ViewSupplier'
import { useApp } from './context/AppContext'
import ScrollToTop from './components/ScrollToTop'

// Protected Route Component
const ProtectedRoute = ({ children, requiredType = null, requireAdmin = false }) => {
  const { user } = useApp()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Admin check
  if (requireAdmin && user.type !== 'admin') {
    return <Navigate to="/" replace />
  }

  // Type check
  if (requiredType && user.type !== requiredType) {
    return <Navigate to={user.type === 'manufacturer' ? '/dashboard/manufacturer' : '/dashboard/supplier'} replace />
  }
  
  return children
}

function AppRoutes() {
  const { notifications, removeNotification } = useApp()
  
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verification" element={<Verification />} />
        <Route 
          path="/dashboard/manufacturer" 
          element={
            <ProtectedRoute requiredType="manufacturer">
              <ManufacturerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/supplier" 
          element={
            <ProtectedRoute requiredType="supplier">
              <SupplierDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/request/:id" element={<RequestDetails />} />
        <Route path="/escrow/:dealId" element={<ProtectedRoute><EscrowPayment /></ProtectedRoute>} />
        <Route path="/deal/:dealId" element={<ProtectedRoute><DealTracking /></ProtectedRoute>} />
        <Route path="/shipping/:trackingId" element={<ProtectedRoute><ShippingTracking /></ProtectedRoute>} />
        <Route path="/rating/:dealId" element={<ProtectedRoute><RatingReview /></ProtectedRoute>} />
        <Route path="/redeal" element={<ReDealZone />} />
        <Route path="/test-data" element={<TestData />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/create-rfq" element={<ProtectedRoute requiredType="manufacturer"><CreateRFQ /></ProtectedRoute>} />
        <Route path="/tenders" element={<ProtectedRoute><TendersListPage /></ProtectedRoute>} />
        <Route path="/tenders/create" element={<ProtectedRoute requiredType="manufacturer"><CreateTenderPage /></ProtectedRoute>} />
        <Route path="/tenders/:tenderId" element={<ProtectedRoute><TenderDetailsPage /></ProtectedRoute>} />
        <Route path="/dashboard/manufacturer/rfqs" element={<ProtectedRoute requiredType="manufacturer"><MyRFQs /></ProtectedRoute>} />
        <Route path="/dashboard/manufacturer/offers" element={<ProtectedRoute requiredType="manufacturer"><ReceivedOffers /></ProtectedRoute>} />
        <Route path="/dashboard/supplier/offers" element={<ProtectedRoute requiredType="supplier"><MyOffers /></ProtectedRoute>} />
        <Route path="/dashboard/manufacturer/payments" element={<ProtectedRoute requiredType="manufacturer"><Payments /></ProtectedRoute>} />
        <Route path="/dashboard/supplier/payments" element={<ProtectedRoute requiredType="supplier"><Payments /></ProtectedRoute>} />
        <Route path="/dashboard/manufacturer/shipments" element={<ProtectedRoute requiredType="manufacturer"><Shipments /></ProtectedRoute>} />
        <Route path="/dashboard/supplier/shipments" element={<ProtectedRoute requiredType="supplier"><Shipments /></ProtectedRoute>} />
        <Route path="/dashboard/manufacturer/reviews" element={<ProtectedRoute requiredType="manufacturer"><Reviews /></ProtectedRoute>} />
        <Route path="/dashboard/supplier/reviews" element={<ProtectedRoute requiredType="supplier"><Reviews /></ProtectedRoute>} />
        <Route path="/dashboard/supplier/rfqs" element={<ProtectedRoute requiredType="supplier"><IncomingRFQs /></ProtectedRoute>} />
        <Route path="/dashboard/supplier/products" element={<ProtectedRoute requiredType="supplier"><MyProducts /></ProtectedRoute>} />
        <Route path="/my-products" element={<ProtectedRoute requiredType="supplier"><MyProducts /></ProtectedRoute>} />
        <Route path="/my-offers" element={<ProtectedRoute requiredType="supplier"><MyOffers /></ProtectedRoute>} />
        <Route path="/received-offers" element={<ProtectedRoute requiredType="manufacturer"><ReceivedOffers /></ProtectedRoute>} />
        <Route path="/my-rfqs" element={<ProtectedRoute requiredType="manufacturer"><MyRFQs /></ProtectedRoute>} />
        <Route path="/incoming-rfqs" element={<ProtectedRoute requiredType="supplier"><IncomingRFQs /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
        <Route path="/shipments" element={<ProtectedRoute><Shipments /></ProtectedRoute>} />
        <Route path="/deal-tracking" element={<ProtectedRoute><DealTracking /></ProtectedRoute>} />
        <Route path="/supplier/:supplierId" element={<ViewSupplier />} />
      </Routes>
      <Toast toasts={notifications} removeToast={removeNotification} />
    </>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
      </AppProvider>
    </LanguageProvider>
  )
}

export default App

