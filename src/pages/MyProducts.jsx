import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Package, Edit, Trash2, Upload, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MobileDrawer from '../components/MobileDrawer'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import PageTitle from '../components/ui/PageTitle'
import EmptyState from '../components/ui/EmptyState'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { useTranslation } from '../hooks/useTranslation'
import { formatPrice } from '../utils/translations'
import { validateRequired, validateNumber } from '../utils/validation'

const MyProducts = () => {
  const { user, products, addProduct, updateProduct, deleteProduct } = useApp()
  const { success, error } = useToast()
  const { t, language } = useTranslation()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productErrors, setProductErrors] = useState({})
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    categoryKey: '',
    image: null,
    imagePreview: null,
  })

  const getText = (value) => {
    if (!value && value !== 0) return ''
    if (typeof value === 'object') return value?.[language] || value?.en || value?.ar || ''
    return String(value)
  }

  const myProducts = products.filter(p => p.supplierId === user?.id) || []

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setProductErrors({})
    
    const errors = {}
    if (!validateRequired(productData.name)) {
      errors.name = t('products.nameRequired')
    }
    if (!validateRequired(productData.description)) {
      errors.description = t('products.descriptionRequired')
    }
    if (!validateRequired(productData.categoryKey)) {
      errors.category = t('products.categoryRequired')
    }
    if (productData.price && !validateNumber(productData.price, 0.01)) {
      errors.price = t('products.invalidPrice')
    }
    
    if (Object.keys(errors).length > 0) {
      setProductErrors(errors)
      error(t('products.fillRequired'))
      setIsSubmitting(false)
      return
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const productToAdd = {
        name: productData.name,
        description: productData.description,
        categoryKey: productData.categoryKey,
        supplierId: user.id,
        supplier: user.companyName,
        price: productData.price ? parseFloat(productData.price) : null,
        rating: editingProduct ? (editingProduct.rating || 0) : 0,
        reviews: editingProduct ? (editingProduct.reviews || 0) : 0,
        verified: user.verified,
        location: user.address,
        image: productData.imagePreview || editingProduct?.image || 'https://picsum.photos/seed/product/600/400',
      }
      
      if (editingProduct) {
        updateProduct(editingProduct.id, productToAdd)
        success(t('products.productUpdated'))
        setEditingProduct(null)
      } else {
        addProduct(productToAdd)
        success(t('products.productAdded'))
      }
      setShowAddModal(false)
      setProductData({ name: '', description: '', price: '', categoryKey: '', image: null, imagePreview: null })
      setProductErrors({})
    } catch (err) {
      error(editingProduct ? t('products.failedToUpdate') : t('products.failedToAdd'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        error(t('products.imageTooLarge'))
        return
      }
      if (!file.type.startsWith('image/')) {
        error(t('products.invalidImageType'))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setProductData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProductData(prev => ({
      ...prev,
      image: null,
      imagePreview: null,
    }))
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setProductData({
      name: product.name?.[language] || product.name?.en || product.name || '',
      description: product.description?.[language] || product.description?.en || product.description || '',
      price: product.price || '',
      categoryKey: product.categoryKey || product.category || '',
      image: null,
      imagePreview: product.image || null,
    })
    setShowAddModal(true)
  }

  const handleDelete = (productId) => {
    if (window.confirm(t('products.confirmDelete'))) {
      deleteProduct(productId)
      success(t('products.productDeleted'))
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <Sidebar userType={user?.type} />
      <MobileDrawer userType={user?.type} />
      <div className={`ml-0 ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} mt-20 p-4 md:p-8`}>        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <PageTitle 
              title={t('products.myProducts')}
            />
            <Button variant="primary" onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
              <Plus className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {t('products.addProduct')}
            </Button>
          </div>
          {myProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t('products.noProducts')}
              description={t('products.noProductsDesc')}
              actionLabel={t('products.addProduct')}
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProducts.map((product) => (
              <Card key={product.id} hover>
                <Link to={`/product/${product.id}`}>
                  <div className="h-48 bg-secondary rounded-lg mb-4 overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={getText(product.name)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-text-light" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-cairo font-bold text-text-dark mb-2">{getText(product.name)}</h3>
                  <p className="text-text-gray text-sm mb-4 line-clamp-2">{getText(product.description)}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {product.price > 0 
                        ? formatPrice(product.price, language)
                        : t('products.requestQuote')
                      }
                    </span>
                    <div className="flex gap-2">
                      <button 
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          handleEdit(product)
                        }}
                        title={t('products.edit')}
                      >
                        <Edit className="w-4 h-4 text-text-gray" />
                      </button>
                      <button 
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete(product.id)
                        }}
                        title={t('products.delete')}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setProductData({ name: '', description: '', price: '', categoryKey: '', image: null, imagePreview: null })
          setEditingProduct(null)
          setProductErrors({})
        }}
        title={editingProduct ? t('products.editProduct') : t('products.addProduct')}
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              {t('products.productImage')}
            </label>
            {productData.imagePreview ? (
              <div className="relative">
                <img 
                  src={productData.imagePreview} 
                  alt={t('products.imagePreviewAlt')}
                  className="w-full h-48 object-cover rounded-lg border border-secondary"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={`absolute top-2 ${language === 'ar' ? 'left-2' : 'right-2'} bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-secondary rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-text-light mb-2" />
                  <p className="text-sm text-text-gray mb-1">
                    <span className="font-semibold">{t('products.clickToUpload')}</span> {t('products.orDragDrop')}
                  </p>
                  <p className="text-xs text-text-light">{t('products.imageFormat')}</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              {t('products.productName')} *
            </label>
            <input
              type="text"
              value={productData.name}
              onChange={(e) => {
                setProductData(prev => ({ ...prev, name: e.target.value }))
                if (productErrors.name) setProductErrors(prev => ({ ...prev, name: '' }))
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                productErrors.name ? 'border-red-500' : 'border-secondary'
              }`}
              required
            />
            {productErrors.name && (
              <p className="text-sm text-red-600 mt-1">{productErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              {t('products.category')} *
            </label>
            <select
              value={productData.categoryKey}
              onChange={(e) => {
                setProductData(prev => ({ ...prev, categoryKey: e.target.value }))
                if (productErrors.category) setProductErrors(prev => ({ ...prev, category: '' }))
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                productErrors.category ? 'border-red-500' : 'border-secondary'
              }`}
              required
            >
              <option value="">
                {t('products.selectCategory')}
              </option>
              <option value="textiles">{t('category.textiles')}</option>
              <option value="food">{t('category.food')}</option>
              <option value="metals">{t('category.metals')}</option>
            </select>
            {productErrors.category && (
              <p className="text-sm text-red-600 mt-1">{productErrors.category}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              {t('products.price')}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={productData.price}
              onChange={(e) => {
                setProductData(prev => ({ ...prev, price: e.target.value }))
                if (productErrors.price) setProductErrors(prev => ({ ...prev, price: '' }))
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                productErrors.price ? 'border-red-500' : 'border-secondary'
              }`}
              placeholder={t('products.leaveEmptyForQuote')}
            />
            {productErrors.price && (
              <p className="text-sm text-red-600 mt-1">{productErrors.price}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              {t('products.description')} *
            </label>
            <textarea
              rows="4"
              value={productData.description}
              onChange={(e) => {
                setProductData(prev => ({ ...prev, description: e.target.value }))
                if (productErrors.description) setProductErrors(prev => ({ ...prev, description: '' }))
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                productErrors.description ? 'border-red-500' : 'border-secondary'
              }`}
              required
            />
            {productErrors.description && (
              <p className="text-sm text-red-600 mt-1">{productErrors.description}</p>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowAddModal(false)
                setProductData({ name: '', description: '', price: '', categoryKey: '', image: null, imagePreview: null })
                setProductErrors({})
              }}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
              {isSubmitting 
                ? (editingProduct ? t('products.updating') : t('products.adding'))
                : (editingProduct ? t('products.updateProduct') : t('products.addProduct'))
              }
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default MyProducts

