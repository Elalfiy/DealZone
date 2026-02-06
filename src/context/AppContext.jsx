import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { seedMockData, getPublicProductImage, getPublicProductImageByTitle } from '../utils/mockData'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [deals, setDeals] = useState([])
  const [products, setProducts] = useState([])
  const [requests, setRequests] = useState([])
  const [offers, setOffers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [tenders, setTenders] = useState([])

  const normalizeProductImage = (product, index = 0) => {
    const image = product?.image || ''

    const hasPublicImage = typeof image === 'string' && image.trim().startsWith('/')
    if (hasPublicImage) return product

    const isPicsumImage = typeof image === 'string' && image.includes('picsum.photos')

    const isBadPersistedPicsumSeed =
      image.includes('picsum.photos/seed/') &&
      (image.includes('[object%20Object]') || image.includes('%5Bobject%20Object%5D') || image.includes('object%20Object'))

    if (
      !image ||
      image.includes('via.placeholder.com') ||
      image.includes('source.unsplash.com') ||
      image.includes('images.unsplash.com') ||
      isPicsumImage ||
      isBadPersistedPicsumSeed
    ) {
      const mappedByTitle = getPublicProductImageByTitle(product?.name)
      const mappedPublic = mappedByTitle || getPublicProductImage(product?.id ?? index)
      return { ...product, image: mappedPublic }
    }
    return product
  }

  const login = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('dealzone_user', JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('dealzone_user')
  }, [])

  const addDeal = useCallback((deal) => {
    setDeals(prev => {
      const newDeal = { ...deal, id: deal.id || Date.now(), status: deal.status || 'created', createdAt: deal.createdAt || new Date().toISOString() }
      const updated = [...prev, newDeal]
      localStorage.setItem('dealzone_deals', JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateDeal = useCallback((dealId, updates) => {
    setDeals(prev => {
      const updated = prev.map(deal => deal.id === dealId ? { ...deal, ...updates } : deal)
      localStorage.setItem('dealzone_deals', JSON.stringify(updated))
      return updated
    })
  }, [])

  const addProduct = useCallback((product) => {
    setProducts(prev => {
      const newProduct = { ...product, id: product.id || Date.now(), createdAt: product.createdAt || new Date().toISOString() }
      const updated = [...prev, newProduct]
      localStorage.setItem('dealzone_products', JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateProduct = useCallback((productId, updates) => {
    setProducts(prev => {
      const updated = prev.map(product => product.id === productId ? { ...product, ...updates } : product)
      localStorage.setItem('dealzone_products', JSON.stringify(updated))
      return updated
    })
  }, [])

  const deleteProduct = useCallback((productId) => {
    setProducts(prev => {
      const updated = prev.filter(product => product.id !== productId)
      localStorage.setItem('dealzone_products', JSON.stringify(updated))
      return updated
    })
  }, [])

  const addRequest = useCallback((request) => {
    setRequests(prev => {
      const newRequest = { ...request, id: request.id || Date.now(), createdAt: request.createdAt || new Date().toISOString() }
      const updated = [...prev, newRequest]
      localStorage.setItem('dealzone_requests', JSON.stringify(updated))
      return updated
    })
  }, [])

  const addOffer = useCallback((offer) => {
    setOffers(prev => {
      const newOffer = { ...offer, id: offer.id || Date.now(), status: offer.status || 'pending', createdAt: offer.createdAt || new Date().toISOString() }
      const updated = [...prev, newOffer]
      localStorage.setItem('dealzone_offers', JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateOffer = useCallback((offerId, updates) => {
    setOffers(prev => {
      const updated = prev.map(offer => offer.id === offerId ? { ...offer, ...updates } : offer)
      localStorage.setItem('dealzone_offers', JSON.stringify(updated))
      return updated
    })
  }, [])

  const acceptOffer = useCallback((offerId) => {
    const offer = offers.find(o => o.id === offerId)
    if (!offer) return null
    
    // Update offer status
    updateOffer(offerId, { status: 'accepted', acceptedAt: new Date().toISOString() })
    
    // Create deal from accepted offer
    const deal = {
      id: Date.now(),
      offerId: offerId,
      productId: offer.productId,
      productName: offer.productName || offer.requestTitle,
      requestId: offer.requestId,
      supplierId: offer.supplierId,
      supplierName: offer.supplierName,
      manufacturerId: offer.manufacturerId,
      manufacturerName: offer.manufacturerName,
      amount: offer.totalAmount || (offer.pricePerUnit * offer.quantity) || offer.price,
      quantity: offer.quantity || 1,
      status: 'created',
      paymentStatus: 'pending',
      escrowStatus: 'pending',
      createdAt: new Date().toISOString(),
    }
    
    addDeal(deal)
    return deal
  }, [offers, updateOffer, addDeal])

  const rejectOffer = useCallback((offerId, reason = '') => {
    updateOffer(offerId, { 
      status: 'rejected', 
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason 
    })
  }, [updateOffer])

  const addTender = useCallback((tender) => {
    setTenders(prev => {
      const newTender = {
        ...tender,
        id: tender.id || Date.now(),
        status: tender.status || 'active',
        bids: tender.bids || [],
        createdAt: tender.createdAt || new Date().toISOString(),
      }
      const updated = [...prev, newTender]
      localStorage.setItem('dealzone_tenders', JSON.stringify(updated))
      return updated
    })
  }, [])

  const submitTenderBid = useCallback((tenderId, bidAmount, bidderId, bidderName, bidderNameAr = '') => {
    setTenders(prev => {
      const tender = prev.find(t => t.id === tenderId)
      if (!tender) return prev

      const bidAmountNum = parseFloat(bidAmount)
      if (Number.isNaN(bidAmountNum)) return prev

      const newBid = {
        id: Date.now(),
        tenderId,
        bidderId,
        bidderName,
        bidderNameAr,
        amount: bidAmountNum,
        timestamp: new Date().toISOString(),
      }

      const updated = prev.map(t =>
        t.id === tenderId
          ? {
              ...t,
              bids: [...(t.bids || []), newBid],
            }
          : t
      )

      localStorage.setItem('dealzone_tenders', JSON.stringify(updated))
      return updated
    })
  }, [])

  const addNotification = useCallback((notification) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { ...notification, id }])
    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('dealzone_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Failed to parse saved user', e)
      }
    }
    
    // Load mock products and requests if they exist
    try {
      const hasAnySeededData =
        !!localStorage.getItem('dealzone_products') ||
        !!localStorage.getItem('dealzone_requests') ||
        !!localStorage.getItem('dealzone_offers') ||
        !!localStorage.getItem('dealzone_deals') ||
        !!localStorage.getItem('dealzone_tenders') ||
        !!localStorage.getItem('dealzone_users')

      if (!hasAnySeededData) {
        seedMockData()
      }

      const savedProducts = localStorage.getItem('dealzone_products')
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts)
        const normalizedProducts = parsedProducts.map((product, index) => normalizeProductImage(product, index))
        setProducts(normalizedProducts)
        localStorage.setItem('dealzone_products', JSON.stringify(normalizedProducts))
      }
      const savedRequests = localStorage.getItem('dealzone_requests')
      if (savedRequests) {
        setRequests(JSON.parse(savedRequests))
      }
      const savedOffers = localStorage.getItem('dealzone_offers')
      if (savedOffers) {
        setOffers(JSON.parse(savedOffers))
      }
      const savedDeals = localStorage.getItem('dealzone_deals')
      if (savedDeals) {
        setDeals(JSON.parse(savedDeals))
      }
      const savedTenders = localStorage.getItem('dealzone_tenders')
      if (savedTenders) {
        setTenders(JSON.parse(savedTenders))
      }
    } catch (e) {
      console.error('Failed to load mock data', e)
    }
  }, [])

  const getSupplierById = useCallback((supplierId) => {
    // Get supplier from users (if we had users list) or from products
    const supplierProduct = products.find(p => p.supplierId === supplierId)
    if (!supplierProduct) return null
    
    // Calculate supplier stats
    const supplierProducts = products.filter(p => p.supplierId === supplierId)
    const supplierDeals = deals.filter(d => d.supplierId === supplierId)
    const completedDeals = supplierDeals.filter(d => ['delivered', 'completed'].includes(d.status))
    
    // Calculate average rating from products
    const avgRating = supplierProducts.length > 0
      ? supplierProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / supplierProducts.length
      : 0
    
    return {
      id: supplierId,
      name: supplierProduct.supplier || 'Unknown Supplier',
      companyName: supplierProduct.supplier || 'Unknown Supplier',
      verified: supplierProduct.verified || false,
      location: supplierProduct.location || 'Unknown',
      rating: avgRating,
      totalProducts: supplierProducts.length,
      completedDeals: completedDeals.length,
      totalDeals: supplierDeals.length,
      onTimeDelivery: completedDeals.length > 0 ? 95 : 0, // Mock calculation
      responseTime: '2.5', // Mock
    }
  }, [products, deals])

  const getSupplierProducts = useCallback((supplierId) => {
    return products.filter(p => p.supplierId === supplierId)
  }, [products])

  const value = {
    user,
    deals,
    products,
    requests,
    offers,
    notifications,
    tenders,
    login,
    logout,
    addDeal,
    updateDeal,
    addProduct,
    updateProduct,
    deleteProduct,
    addRequest,
    addOffer,
    updateOffer,
    acceptOffer,
    rejectOffer,
    addTender,
    submitTenderBid,
    addNotification,
    removeNotification,
    getSupplierById,
    getSupplierProducts,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

