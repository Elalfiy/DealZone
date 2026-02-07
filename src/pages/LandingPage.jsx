import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Users, Sparkles, Gavel, Truck, CheckCircle, Star, ArrowRight, Building2, Factory, DollarSign, Package, Target, Zap, UserCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { useTranslation } from '../hooks/useTranslation'

const LandingPage = () => {
  const { t, language } = useTranslation()
  const features = [
    {
      icon: Shield,
      title: t('landing.features.escrow.title'),
      description: t('landing.features.escrow.desc'),
    },
    {
      icon: Users,
      title: t('landing.features.verified.title'),
      description: t('landing.features.verified.desc'),
    },
    {
      icon: Sparkles,
      title: t('landing.features.ai.title'),
      description: t('landing.features.ai.desc'),
    },
    {
      icon: Gavel,
      title: t('landing.features.tenders.title'),
      description: t('landing.features.tenders.desc'),
    },
    {
      icon: Truck,
      title: t('landing.features.shipping.title'),
      description: t('landing.features.shipping.desc'),
    },
  ]

  const howItWorks = [
    {
      step: 1,
      title: t('landing.howItWorks.step1.title'),
      description: t('landing.howItWorks.step1.desc'),
      icon: UserCheck,
    },
    {
      step: 2,
      title: t('landing.howItWorks.step2.title'),
      description: t('landing.howItWorks.step2.desc'),
      icon: Users,
    },
    {
      step: 3,
      title: t('landing.howItWorks.step3.title'),
      description: t('landing.howItWorks.step3.desc'),
      icon: Target,
    },
    {
      step: 4,
      title: t('landing.howItWorks.step4.title'),
      description: t('landing.howItWorks.step4.desc'),
      icon: DollarSign,
    },
    {
      step: 5,
      title: t('landing.howItWorks.step5.title'),
      description: t('landing.howItWorks.step5.desc'),
      icon: Package,
    },
  ]

  const supplierVsManufacturer = {
    supplier: {
      title: t('landing.supplier.title'),
      icon: Factory,
      benefits: [
        t('landing.supplier.benefit1'),
        t('landing.supplier.benefit2'),
        t('landing.supplier.benefit3'),
        t('landing.supplier.benefit4'),
        t('landing.supplier.benefit5'),
        t('landing.supplier.benefit6'),
      ],
      cta: t('landing.supplier.cta'),
      link: '/signup?type=supplier',
    },
    manufacturer: {
      title: t('landing.manufacturer.title'),
      icon: Building2,
      benefits: [
        t('landing.manufacturer.benefit1'),
        t('landing.manufacturer.benefit2'),
        t('landing.manufacturer.benefit3'),
        t('landing.manufacturer.benefit4'),
        t('landing.manufacturer.benefit5'),
        t('landing.manufacturer.benefit6'),
      ],
      cta: t('landing.manufacturer.cta'),
      link: '/signup?type=manufacturer',
    },
  }

  const testimonials = [
    {
      name: t('landing.testimonials.item1.name'),
      role: t('landing.testimonials.item1.role'),
      company: t('landing.testimonials.item1.company'),
      rating: 5,
      text: t('landing.testimonials.item1.text'),
    },
    {
      name: t('landing.testimonials.item2.name'),
      role: t('landing.testimonials.item2.role'),
      company: t('landing.testimonials.item2.company'),
      rating: 5,
      text: t('landing.testimonials.item2.text'),
    },
    {
      name: t('landing.testimonials.item3.name'),
      role: t('landing.testimonials.item3.role'),
      company: t('landing.testimonials.item3.company'),
      rating: 5,
      text: t('landing.testimonials.item3.text'),
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 gradient-soft opacity-50" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-cairo font-bold text-text-dark mb-6 leading-tight">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-text-gray mb-10 max-w-2xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex justify-center">
              <Link to="/signup">
                <Button variant="primary" className="w-full sm:w-auto">
                  {t('landing.hero.cta')}
                </Button>
              </Link>
            </div>
            <div className="mt-4 text-center">
              <Link to="/test-data" className="text-sm text-primary hover:underline font-medium">
                {t('landing.testLogin')}
              </Link>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 shadow-soft">
              <img
                src="/b2b.png"
                alt="Industrial manufacturing"
                className="w-full h-72 md:h-96 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Platform Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-cairo font-bold text-text-dark mb-4">
              {t('landing.about.title')}
            </h2>
            <p className="text-xl text-text-gray max-w-3xl mx-auto">
              {t('landing.about.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: t('landing.about.mission.title'),
                description: t('landing.about.mission.desc'),
              },
              {
                icon: Zap,
                title: t('landing.about.vision.title'),
                description: t('landing.about.vision.desc'),
              },
              {
                icon: CheckCircle,
                title: t('landing.about.values.title'),
                description: t('landing.about.values.desc'),
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-text-gray">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-cairo font-bold text-text-dark mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-soft card-hover"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-cairo font-bold text-text-dark mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-gray">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-cairo font-bold text-text-dark mb-4">
              {t('landing.howItWorks.title')}
            </h2>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              {t('landing.howItWorks.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-primary/30 transform translate-x-4">
                      <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-cairo font-bold text-text-dark mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-gray">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supplier vs Manufacturer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-cairo font-bold text-text-dark mb-4">
              {t('landing.path.title')}
            </h2>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              {t('landing.path.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[supplierVsManufacturer.supplier, supplierVsManufacturer.manufacturer].map((type, index) => {
              const Icon = type.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-soft"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-cairo font-bold text-text-dark">
                      {type.title}
                    </h3>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {type.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-text-gray">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={type.link}>
                    <Button variant="primary" className="w-full">
                      {type.cta}
                      <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-cairo font-bold text-text-dark mb-4">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-xl text-text-gray max-w-2xl mx-auto">
              {t('landing.testimonials.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-soft"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-text-gray mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-text-dark">{testimonial.name}</p>
                  <p className="text-sm text-text-gray">{testimonial.role} at {testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-primary-light">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-cairo font-bold text-white mb-6">
              {t('landing.cta.title')}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {t('landing.cta.subtitle')}
            </p>
            <Link to="/signup">
              <Button variant="secondary" className="inline-flex items-center space-x-2">
                <span>{t('landing.cta.button')}</span>
                <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
