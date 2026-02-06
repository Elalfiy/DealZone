// Comprehensive Mock Data for Testing
export const publicProductImages = [
  '/cold-rolled-steel-sheet.webp',
  '/cotton-twill-fabric-roll.webp',
  '/copper-wire.webp',
  '/polyester-yarn.webp',
  '/wheat-flour.webp',
]

export const getPublicProductImage = (seed) => {
  const n = Number(seed)
  const idx = Number.isFinite(n) ? Math.abs(n) % publicProductImages.length : 0
  return publicProductImages[idx]
}

export const getPublicProductImageByTitle = (title) => {
  const titleStr =
    typeof title === 'object'
      ? String(title?.en || title?.ar || '')
      : String(title || '')

  const s = titleStr.toLowerCase()

  if (!s) return ''

  if (s.includes('cold rolled steel') || s.includes('crc') || s.includes('steel sheet')) {
    return '/cold-rolled-steel-sheet.webp'
  }
  if (s.includes('cotton twill') || (s.includes('cotton') && s.includes('twill')) || s.includes('fabric roll')) {
    return '/cotton-twill-fabric-roll.webp'
  }
  if (s.includes('copper wire') || (s.includes('copper') && s.includes('wire'))) {
    return '/copper-wire.webp'
  }
  if (s.includes('aluminum sheet') || s.includes('aluminium sheet') || s.includes(' 6061') || s.includes('6061')) {
    return '/aluminum-sheet.webp'
  }
  if (s.includes('polyester yarn') || (s.includes('polyester') && s.includes('yarn')) || s.includes('dty')) {
    return '/polyester-yarn.webp'
  }
  if (s.includes('wheat flour') || (s.includes('wheat') && s.includes('flour'))) {
    return '/wheat-flour.webp'
  }

  return ''
}

export const seedMockData = () => {
  const now = new Date()
  
  // Mock users - More users
  const mockUsers = [
    {
      id: 1,
      type: 'manufacturer',
      companyName: 'Tech Industries Co.',
      companyNameAr: 'شركة تك للصناعات',
      email: 'manufacturer@test.com',
      password: 'password123',
      phone: '+20 123 456 7890',
      address: '123 Industrial Street, Cairo, Egypt',
      addressAr: '١٢٣ شارع الصناعية، القاهرة، مصر',
      taxId: 'TAX123456',
      contactPerson: 'Ahmed Hassan',
      contactPersonAr: 'أحمد حسن',
      verified: true,
      createdAt: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: 'supplier',
      companyName: 'Global Materials Ltd.',
      companyNameAr: 'جلوبال للمواد الخام',
      email: 'supplier@test.com',
      password: 'password123',
      phone: '+20 987 654 3210',
      address: '456 Business Avenue, Alexandria, Egypt',
      addressAr: '٤٥٦ شارع الأعمال، الإسكندرية، مصر',
      taxId: 'TAX789012',
      contactPerson: 'Sarah Johnson',
      contactPersonAr: 'سارة جونسون',
      verified: true,
      createdAt: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      type: 'manufacturer',
      companyName: 'Egyptian Manufacturing Corp.',
      companyNameAr: 'المؤسسة المصرية للتصنيع',
      email: 'manufacturer2@test.com',
      password: 'password123',
      phone: '+20 111 222 3333',
      address: '789 Production Road, Giza, Egypt',
      addressAr: '٧٨٩ طريق الإنتاج، الجيزة، مصر',
      taxId: 'TAX456789',
      contactPerson: 'Mohamed Ali',
      contactPersonAr: 'محمد علي',
      verified: true,
      createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      type: 'supplier',
      companyName: 'Industrial Supplies Egypt',
      companyNameAr: 'الإمدادات الصناعية - مصر',
      email: 'supplier2@test.com',
      password: 'password123',
      phone: '+20 222 333 4444',
      address: '321 Trade Center, Cairo, Egypt',
      addressAr: '٣٢١ مركز التجارة، القاهرة، مصر',
      taxId: 'TAX321654',
      contactPerson: 'Fatima Ibrahim',
      contactPersonAr: 'فاطمة إبراهيم',
      verified: true,
      createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      type: 'admin',
      companyName: 'DealZone Admin',
      companyNameAr: 'إدارة ديل زون',
      email: 'admin@test.com',
      password: 'password123',
      phone: '+20 555 555 5555',
      address: 'DealZone HQ, Cairo, Egypt',
      addressAr: 'مقر ديل زون، القاهرة، مصر',
      taxId: 'ADMIN001',
      contactPerson: 'System Admin',
      contactPersonAr: 'مسؤول النظام',
      verified: true,
      createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
 
  localStorage.setItem('dealzone_users', JSON.stringify(mockUsers))

  // Mock products - More products
  const mockProducts = [
    {
      id: 1,
      name: {
        en: 'Cold Rolled Steel Sheet (CRC)',
        ar: 'صفائح فولاذ مدرفلة على البارد (CRC)',
      },
      supplierId: 2,
      supplier: 'Global Materials Ltd.',
      supplierAr: 'جلوبال للمواد الخام',
      price: 1250,
      rating: 4.9,
      reviews: 127,
      verified: true,
      location: 'Cairo, Egypt',
      categoryKey: 'metals',
      image: getPublicProductImageByTitle({ en: 'Cold Rolled Steel Sheet (CRC)', ar: 'صفائح فولاذ مدرفلة على البارد (CRC)' }) || getPublicProductImage(1),
      description: {
        en: 'Cold rolled carbon steel sheets for fabrication and industrial manufacturing. Available in multiple thicknesses and coil/flat formats.',
        ar: 'صفائح فولاذ كربوني مدرفلة على البارد مناسبة للتشكيل والتصنيع الصناعي. متوفرة بعدة سماكات وبصيغة لفائف أو ألواح.',
      },
      specifications: {
        en: {
          Material: 'Carbon Steel',
          Thickness: '0.6mm - 3.0mm',
          Width: '1000mm - 1500mm',
          Finish: 'Cold rolled',
          Standard: 'ASTM / EN',
        },
        ar: {
          المادة: 'فولاذ كربوني',
          السماكة: '0.6 مم - 3.0 مم',
          العرض: '1000 مم - 1500 مم',
          التشطيب: 'مدرفل على البارد',
          المعيار: 'ASTM / EN',
        },
      },
      redeal: false,
      createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      name: {
        en: 'Cotton Twill Fabric Roll (240gsm)',
        ar: 'لفة قماش تويل قطني (240 جم)',
      },
      supplierId: 2,
      supplier: 'Global Materials Ltd.',
      supplierAr: 'جلوبال للمواد الخام',
      price: 95,
      rating: 4.7,
      reviews: 89,
      verified: true,
      location: 'Alexandria, Egypt',
      categoryKey: 'textiles',
      image: getPublicProductImageByTitle({ en: 'Cotton Twill Fabric Roll (240gsm)', ar: 'لفة قماش تويل قطني (240 جم)' }) || getPublicProductImage(2),
      description: {
        en: 'Durable cotton twill fabric roll suitable for uniforms, workwear, and industrial textile applications. Sold by roll.',
        ar: 'قماش تويل قطني متين مناسب للزيّ الموحد وملابس العمل وتطبيقات المنسوجات الصناعية. يُباع باللفة.',
      },
      specifications: {
        en: {
          Composition: '100% Cotton',
          Weight: '240 gsm',
          Width: '150 cm',
          Color: 'Natural / Dyed options',
        },
        ar: {
          التركيب: 'قطن 100%',
          الوزن: '240 جم',
          العرض: '150 سم',
          اللون: 'طبيعي / خيارات صبغ',
        },
      },
      redeal: false,
      createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      name: {
        en: 'Aluminum Sheet 6061 (Cut-to-Size)',
        ar: 'ألواح ألمنيوم 6061 (قص حسب المقاس)',
      },
      supplierId: 4,
      supplier: 'Industrial Supplies Egypt',
      supplierAr: 'الإمدادات الصناعية - مصر',
      price: 850,
      rating: 4.5,
      reviews: 56,
      verified: true,
      location: 'Giza, Egypt',
      categoryKey: 'metals',
      image: getPublicProductImageByTitle({ en: 'Aluminum Sheet 6061 (Cut-to-Size)', ar: 'ألواح ألمنيوم 6061 (قص حسب المقاس)' }) || getPublicProductImage(3),
      description: {
        en: '6061 aluminum sheets suitable for machining and fabrication. Available in multiple thicknesses with cut-to-size service.',
        ar: 'ألواح ألمنيوم 6061 مناسبة للخراطة والتشكيل. متوفرة بعدة سماكات مع خدمة القص حسب المقاس.',
      },
      specifications: {
        en: {
          Alloy: '6061-T6',
          Thickness: '1mm - 8mm',
          Finish: 'Mill finish',
          Tolerance: 'Standard',
        },
        ar: {
          السبيكة: '6061-T6',
          السماكة: '1 مم - 8 مم',
          التشطيب: 'تشطيب مصنع',
          السماحية: 'قياسية',
        },
      },
      redeal: true,
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      name: {
        en: 'Wheat Flour (Industrial, 25kg Bag)',
        ar: 'دقيق قمح (صناعي، كيس 25 كجم)',
      },
      supplierId: 4,
      supplier: 'Industrial Supplies Egypt',
      supplierAr: 'الإمدادات الصناعية - مصر',
      price: 420,
      rating: 4.8,
      reviews: 203,
      verified: true,
      location: 'Cairo, Egypt',
      categoryKey: 'food',
      image: getPublicProductImageByTitle({ en: 'Wheat Flour (Industrial, 25kg Bag)', ar: 'دقيق قمح (صناعي، كيس 25 كجم)' }) || getPublicProductImage(4),
      description: {
        en: 'Industrial wheat flour for bakeries and food production lines. Consistent milling and stable quality.',
        ar: 'دقيق قمح صناعي مناسب للمخابز وخطوط إنتاج الأغذية. طحن ثابت وجودة مستقرة.',
      },
      specifications: {
        en: {
          Packaging: '25kg bag',
          Type: 'Wheat flour (industrial)',
          ShelfLife: '6 months',
          Origin: 'Egypt',
        },
        ar: {
          التعبئة: 'كيس 25 كجم',
          النوع: 'دقيق قمح (صناعي)',
          الصلاحية: '6 أشهر',
          المنشأ: 'مصر',
        },
      },
      redeal: false,
      createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      name: {
        en: 'Copper Wire (Bulk, PVC Insulated)',
        ar: 'سلك نحاس (جملة، معزول PVC)',
      },
      supplierId: 2,
      supplier: 'Global Materials Ltd.',
      supplierAr: 'جلوبال للمواد الخام',
      price: 1800,
      rating: 4.6,
      reviews: 94,
      verified: true,
      location: 'Alexandria, Egypt',
      categoryKey: 'metals',
      image: getPublicProductImageByTitle({ en: 'Copper Wire (Bulk, PVC Insulated)', ar: 'سلك نحاس (جملة، معزول PVC)' }) || getPublicProductImage(5),
      description: {
        en: 'Bulk copper wire with PVC insulation for industrial electrical installations and panels.',
        ar: 'سلك نحاس بالجملة مع عزل PVC مناسب للتركيبات الكهربائية الصناعية واللوحات.',
      },
      specifications: {
        en: {
          Conductor: 'Pure Copper',
          Insulation: 'PVC',
          Gauge: '12 AWG - 24 AWG',
          Length: 'Custom',
        },
        ar: {
          الموصل: 'نحاس نقي',
          العزل: 'PVC',
          المقاس: '12 AWG - 24 AWG',
          الطول: 'حسب الطلب',
        },
      },
      redeal: false,
      createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 6,
      name: {
        en: 'Polyester Yarn (DTY, 150D)',
        ar: 'خيوط بوليستر (DTY، 150D)',
      },
      supplierId: 4,
      supplier: 'Industrial Supplies Egypt',
      supplierAr: 'الإمدادات الصناعية - مصر',
      price: 68,
      rating: 4.4,
      reviews: 67,
      verified: true,
      location: 'Cairo, Egypt',
      categoryKey: 'textiles',
      image: getPublicProductImageByTitle({ en: 'Polyester Yarn (DTY, 150D)', ar: 'خيوط بوليستر (DTY، 150D)' }) || getPublicProductImage(6),
      description: {
        en: 'DTY polyester yarn for knitting and weaving. Stable denier and consistent quality for production lines.',
        ar: 'خيوط بوليستر DTY مناسبة للحياكة والنسيج. دنير ثابت وجودة متسقة لخطوط الإنتاج.',
      },
      specifications: {
        en: {
          Type: 'DTY',
          Denier: '150D',
          Filament: '48F',
          Color: 'Raw white',
        },
        ar: {
          النوع: 'DTY',
          الدنير: '150D',
          الخيط: '48F',
          اللون: 'أبيض خام',
        },
      },
      redeal: false,
      createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  localStorage.setItem('dealzone_products', JSON.stringify(mockProducts))

  // Mock requests - More requests
  const mockRequests = [
    {
      id: 1,
      title: {
        en: 'Need 5 tons Steel Sheets (CRC)',
        ar: 'مطلوب 5 طن صفائح فولاذ (CRC)',
      },
      manufacturerId: 1,
      manufacturer: 'Tech Industries Co.',
      manufacturerAr: 'شركة تك للصناعات',
      categoryKey: 'metals',
      location: 'Cairo, Egypt',
      budget: '15000 - 20000',
      verified: true,
      date: '2 days ago',
      description: {
        en: 'We need cold rolled steel sheets for fabrication. Please quote best price including delivery to Cairo industrial zone.',
        ar: 'نحتاج صفائح فولاذ مدرفلة على البارد للتصنيع. يرجى إرسال أفضل سعر شامل التوصيل إلى المنطقة الصناعية بالقاهرة.',
      },
      specifications: {
        en: {
          Quantity: '5 tons',
          Thickness: '0.8mm - 1.5mm',
          Finish: 'Cold rolled',
          Delivery: 'Within 14 days',
        },
        ar: {
          الكمية: '5 طن',
          السماكة: '0.8 مم - 1.5 مم',
          التشطيب: 'مدرفل على البارد',
          التسليم: 'خلال 14 يوم',
        },
      },
      manufacturerInfo: {
        name: 'Tech Industries Co.',
        rating: 4.8,
        totalDeals: 320,
        verified: true,
      },
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: {
        en: 'Need cotton fabric for uniforms (twill)',
        ar: 'مطلوب قماش قطني للزي الموحد (تويل)',
      },
      manufacturerId: 1,
      manufacturer: 'Tech Industries Co.',
      manufacturerAr: 'شركة تك للصناعات',
      categoryKey: 'textiles',
      location: 'Cairo, Egypt',
      budget: 'Negotiable',
      verified: true,
      date: '3 days ago',
      description: {
        en: 'Looking for a supplier to provide cotton twill fabric rolls for uniforms. Long-term contract preferred.',
        ar: 'نبحث عن مورد لتوفير لفائف قماش تويل قطني للزي الموحد. يفضل عقد طويل المدى.',
      },
      specifications: {
        en: {
          Weight: '220-260 gsm',
          Width: '150 cm',
          Quantity: '200 rolls',
          Delivery: '30 days',
        },
        ar: {
          الوزن: '220-260 جم',
          العرض: '150 سم',
          الكمية: '200 لفة',
          التسليم: '30 يوم',
        },
      },
      manufacturerInfo: {
        name: 'Tech Industries Co.',
        rating: 4.8,
        totalDeals: 320,
        verified: true,
      },
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      title: {
        en: 'Aluminum Sheets 6061 - 1000kg',
        ar: 'ألواح ألمنيوم 6061 - 1000 كجم',
      },
      manufacturerId: 3,
      manufacturer: 'Egyptian Manufacturing Corp.',
      manufacturerAr: 'المؤسسة المصرية للتصنيع',
      categoryKey: 'metals',
      location: 'Giza, Egypt',
      budget: '25000 - 30000',
      verified: true,
      date: '1 day ago',
      description: {
        en: 'Need aluminum sheets for a production line. Prefer 6061 grade with cut-to-size service if available.',
        ar: 'مطلوب ألواح ألمنيوم لخط إنتاج. يفضل درجة 6061 مع خدمة قص حسب المقاس إن أمكن.',
      },
      specifications: {
        en: {
          Alloy: '6061-T6',
          Quantity: '1000 kg',
          Thickness: '2mm - 6mm',
          Delivery: 'ASAP',
        },
        ar: {
          السبيكة: '6061-T6',
          الكمية: '1000 كجم',
          السماكة: '2 مم - 6 مم',
          التسليم: 'في أقرب وقت',
        },
      },
      manufacturerInfo: {
        name: 'Egyptian Manufacturing Corp.',
        rating: 4.6,
        totalDeals: 180,
        verified: true,
      },
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      title: {
        en: 'Industrial wheat flour supply (25kg bags)',
        ar: 'توريد دقيق قمح صناعي (أكياس 25 كجم)',
      },
      manufacturerId: 3,
      manufacturer: 'Egyptian Manufacturing Corp.',
      manufacturerAr: 'المؤسسة المصرية للتصنيع',
      categoryKey: 'food',
      location: 'Giza, Egypt',
      budget: '50000+',
      verified: true,
      date: '4 days ago',
      description: {
        en: 'We are looking for a reliable supplier for industrial wheat flour for our production facility. Monthly supply required.',
        ar: 'نبحث عن مورد موثوق لدقيق القمح الصناعي لمنشأة الإنتاج الخاصة بنا. مطلوب توريد شهري.',
      },
      specifications: {
        en: {
          Packaging: '25kg bags',
          Quantity: '10 tons / month',
          Origin: 'Egypt',
          Delivery: 'Monthly',
        },
        ar: {
          التعبئة: 'أكياس 25 كجم',
          الكمية: '10 طن / شهرياً',
          المنشأ: 'مصر',
          التسليم: 'شهرياً',
        },
      },
      manufacturerInfo: {
        name: 'Egyptian Manufacturing Corp.',
        rating: 4.6,
        totalDeals: 180,
        verified: true,
      },
      createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  localStorage.setItem('dealzone_requests', JSON.stringify(mockRequests))

  // Mock offers
  const mockOffers = [
    {
      id: 1,
      requestId: 1,
      productId: 1,
      productName: 'Premium Steel Sheets',
      productNameAr: 'صفائح فولاذ ممتازة',
      supplierId: 2,
      supplierName: 'Global Materials Ltd.',
      supplierNameAr: 'جلوبال للمواد الخام',
      manufacturerId: 1,
      manufacturerName: 'Tech Industries Co.',
      manufacturerNameAr: 'شركة تك للصناعات',
      quantity: 500,
      pricePerUnit: 38,
      totalAmount: 19000,
      deliveryDate: new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Can deliver within 2 weeks. Quality guaranteed.',
      status: 'pending',
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      requestId: 1,
      productId: null,
      productName: 'Steel Sheets',
      productNameAr: 'صفائح فولاذ',
      supplierId: 4,
      supplierName: 'Industrial Supplies Egypt',
      supplierNameAr: 'الإمدادات الصناعية - مصر',
      manufacturerId: 1,
      manufacturerName: 'Tech Industries Co.',
      manufacturerNameAr: 'شركة تك للصناعات',
      quantity: 500,
      pricePerUnit: 35,
      totalAmount: 17500,
      deliveryDate: new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Best price guaranteed. Fast delivery.',
      status: 'pending',
      createdAt: new Date(now - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      requestId: 2,
      productId: 2,
      productName: 'Cotton Twill Fabric Roll (240gsm)',
      productNameAr: 'لفة قماش تويل قطني (240 جم)',
      supplierId: 2,
      supplierName: 'Global Materials Ltd.',
      supplierNameAr: 'جلوبال للمواد الخام',
      manufacturerId: 1,
      manufacturerName: 'Tech Industries Co.',
      manufacturerNameAr: 'شركة تك للصناعات',
      quantity: 100,
      pricePerUnit: 95,
      totalAmount: 9500,
      deliveryDate: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Consistent quality fabric. Bulk discount available for long-term contracts.',
      status: 'accepted',
      acceptedAt: new Date(now - 0.25 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  localStorage.setItem('dealzone_offers', JSON.stringify(mockOffers))

  // Mock deals
  const mockDeals = [
    {
      id: 1,
      offerId: 3,
      productId: 2,
      productName: 'Cotton Twill Fabric Roll (240gsm)',
      productNameAr: 'لفة قماش تويل قطني (240 جم)',
      requestId: 2,
      supplierId: 2,
      supplierName: 'Global Materials Ltd.',
      supplierNameAr: 'جلوبال للمواد الخام',
      manufacturerId: 1,
      manufacturerName: 'Tech Industries Co.',
      manufacturerNameAr: 'شركة تك للصناعات',
      amount: 9500,
      quantity: 100,
      status: 'paid',
      paymentStatus: 'completed',
      escrowStatus: 'released',
      createdAt: new Date(now - 0.25 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(now - 0.2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  localStorage.setItem('dealzone_deals', JSON.stringify(mockDeals))

  // Mock tenders (reverse auction / procurement)
  const mockTenders = [
    {
      id: 1,
      title: {
        en: 'Steel Sheets Tender - 5 tons',
        ar: 'مناقصة صفائح فولاذ - ٥ أطنان',
      },
      categoryKey: 'metals',
      quantity: 5000,
      unit: {
        en: 'kg',
        ar: 'كجم',
      },
      targetPrice: 30000,
      startDate: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: {
        en: 'Reverse bidding tender for cold rolled steel sheets suitable for fabrication. Lower prices win.',
        ar: 'مناقصة بنظام المزايدة العكسية لصفائح فولاذ مدرفلة على البارد مناسبة للتصنيع. السعر الأقل يفوز.',
      },
      specifications: {
        thickness: '1.2mm',
        grade: 'SAE 1008',
        finish: 'Matte',
      },
      manufacturerId: 1,
      manufacturerName: 'Tech Industries Co.',
      manufacturerNameAr: 'شركة تك للصناعات',
      status: 'active',
      bids: [
        { id: 1, bidderId: 2, bidderName: 'Global Materials Ltd.', bidderNameAr: 'جلوبال للمواد الخام', amount: 30500, timestamp: new Date(now - 0.9 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 2, bidderId: 4, bidderName: 'Industrial Supplies Egypt', bidderNameAr: 'الإمدادات الصناعية - مصر', amount: 29800, timestamp: new Date(now - 0.5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 3, bidderId: 2, bidderName: 'Global Materials Ltd.', bidderNameAr: 'جلوبال للمواد الخام', amount: 29250, timestamp: new Date(now - 0.2 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: {
        en: 'Cotton Fabric Tender - 200 rolls',
        ar: 'مناقصة قماش قطن - ٢٠٠ لفة',
      },
      categoryKey: 'textiles',
      quantity: 200,
      unit: {
        en: 'rolls',
        ar: 'لفات',
      },
      targetPrice: 50000,
      startDate: new Date(now - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: {
        en: 'Procurement tender for bulk supply of cotton twill fabric for uniforms. Lower bid wins.',
        ar: 'مناقصة مشتريات لتوريد قماش قطن تويل بكميات كبيرة للزي الموحد. السعر الأقل يفوز.',
      },
      specifications: {
        gsm: '240',
        color: 'Navy',
        width: '160cm',
      },
      manufacturerId: 3,
      manufacturerName: 'Egyptian Manufacturing Corp.',
      manufacturerNameAr: 'المؤسسة المصرية للتصنيع',
      status: 'active',
      bids: [
        { id: 4, bidderId: 4, bidderName: 'Industrial Supplies Egypt', bidderNameAr: 'الإمدادات الصناعية - مصر', amount: 51000, timestamp: new Date(now - 0.4 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 5, bidderId: 2, bidderName: 'Global Materials Ltd.', bidderNameAr: 'جلوبال للمواد الخام', amount: 49500, timestamp: new Date(now - 0.2 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      createdAt: new Date(now - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  localStorage.setItem('dealzone_tenders', JSON.stringify(mockTenders))

  return { mockUsers, mockProducts, mockRequests, mockOffers, mockDeals, mockTenders }
}

// Quick login function for testing
export const quickLogin = (email, password) => {
  const users = JSON.parse(localStorage.getItem('dealzone_users') || '[]')
  const user = users.find(u => u.email === email && u.password === password)
  if (user) {
    const { password: _, ...userWithoutPassword } = user
    localStorage.setItem('dealzone_user', JSON.stringify(userWithoutPassword))
    return userWithoutPassword
  }
  return null
}
