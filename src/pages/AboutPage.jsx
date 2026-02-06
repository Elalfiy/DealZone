import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Building2,
  Factory,
  FileText,
  Gavel,
  Shield,
  Truck,
  Search,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useTranslation } from '../hooks/useTranslation'

const Section = ({ eyebrow, title, subtitle, children }) => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-sm font-semibold tracking-wide text-primary uppercase mb-2">{eyebrow}</p>
          ) : null}
          <h2 className="text-3xl sm:text-4xl font-cairo font-bold text-text-dark mb-3">{title}</h2>
          {subtitle ? <p className="text-text-gray leading-relaxed">{subtitle}</p> : null}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

const PillarCard = ({ icon: Icon, title, description, bullets }) => {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-cairo font-bold text-text-dark">{title}</h3>
          <p className="text-text-gray mt-2 leading-relaxed">{description}</p>
          {bullets?.length ? (
            <ul className="mt-4 space-y-2">
              {bullets.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2 text-text-gray">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

const StatCard = ({ label, value, note }) => {
  return (
    <Card>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-text-gray">{label}</p>
        <p className="text-3xl font-cairo font-bold text-text-dark">{value}</p>
        {note ? <p className="text-sm text-text-light leading-relaxed">{note}</p> : null}
      </div>
    </Card>
  )
}

const AboutPage = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <div className="pt-24">
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  {t('about.badge')}
                </p>
                <h1 className="mt-5 text-4xl sm:text-5xl font-cairo font-bold text-text-dark leading-tight">
                  {t('about.title')}
                </h1>
                <p className="mt-4 text-text-gray leading-relaxed">
                  {t('about.subtitle')}
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-semibold text-text-dark">{t('about.highlight1.title')}</p>
                        <p className="text-sm text-text-gray mt-1 leading-relaxed">
                          {t('about.highlight1.desc')}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-semibold text-text-dark">{t('about.highlight2.title')}</p>
                        <p className="text-sm text-text-gray mt-1 leading-relaxed">
                          {t('about.highlight2.desc')}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link to="/marketplace">
                    <Button variant="primary" className="w-full sm:w-auto">
                      {t('about.ctaPrimary')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/create-rfq">
                    <Button variant="outline" className="w-full sm:w-auto">
                      {t('about.ctaSecondary')}
                    </Button>
                  </Link>
                </div>

                <p className="mt-4 text-xs text-text-light leading-relaxed">
                  {t('about.disclaimer')}
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Card>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Search className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-lg font-cairo font-bold text-text-dark">{t('about.trustPanel.title')}</p>
                        <p className="text-text-gray leading-relaxed mt-1">
                          {t('about.trustPanel.desc')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-secondary/40">
                        <p className="text-sm font-semibold text-text-dark">{t('about.trustPanel.item1.title')}</p>
                        <p className="text-sm text-text-gray mt-1">{t('about.trustPanel.item1.desc')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/40">
                        <p className="text-sm font-semibold text-text-dark">{t('about.trustPanel.item2.title')}</p>
                        <p className="text-sm text-text-gray mt-1">{t('about.trustPanel.item2.desc')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/40">
                        <p className="text-sm font-semibold text-text-dark">{t('about.trustPanel.item3.title')}</p>
                        <p className="text-sm text-text-gray mt-1">{t('about.trustPanel.item3.desc')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/40">
                        <p className="text-sm font-semibold text-text-dark">{t('about.trustPanel.item4.title')}</p>
                        <p className="text-sm text-text-gray mt-1">{t('about.trustPanel.item4.desc')}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <Section
          eyebrow={t('about.market.eyebrow')}
          title={t('about.market.title')}
          subtitle={t('about.market.subtitle')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <p className="font-semibold text-text-dark">{t('about.market.pain1.title')}</p>
              <p className="text-sm text-text-gray mt-2 leading-relaxed">
                {t('about.market.pain1.desc')}
              </p>
            </Card>
            <Card>
              <p className="font-semibold text-text-dark">{t('about.market.pain2.title')}</p>
              <p className="text-sm text-text-gray mt-2 leading-relaxed">
                {t('about.market.pain2.desc')}
              </p>
            </Card>
            <Card>
              <p className="font-semibold text-text-dark">{t('about.market.pain3.title')}</p>
              <p className="text-sm text-text-gray mt-2 leading-relaxed">
                {t('about.market.pain3.desc')}
              </p>
            </Card>
            <Card>
              <p className="font-semibold text-text-dark">{t('about.market.pain4.title')}</p>
              <p className="text-sm text-text-gray mt-2 leading-relaxed">
                {t('about.market.pain4.desc')}
              </p>
            </Card>
          </div>
        </Section>

        <Section
          eyebrow={t('about.pillars.eyebrow')}
          title={t('about.pillars.title')}
          subtitle={t('about.pillars.subtitle')}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PillarCard
              icon={Building2}
              title={t('about.pillars.verified.title')}
              description={t('about.pillars.verified.desc')}
              bullets={[
                t('about.pillars.verified.b1'),
                t('about.pillars.verified.b2'),
                t('about.pillars.verified.b3'),
              ]}
            />
            <PillarCard
              icon={Gavel}
              title={t('about.pillars.rfq.title')}
              description={t('about.pillars.rfq.desc')}
              bullets={[
                t('about.pillars.rfq.b1'),
                t('about.pillars.rfq.b2'),
                t('about.pillars.rfq.b3'),
              ]}
            />
            <PillarCard
              icon={Shield}
              title={t('about.pillars.escrow.title')}
              description={t('about.pillars.escrow.desc')}
              bullets={[
                t('about.pillars.escrow.b1'),
                t('about.pillars.escrow.b2'),
                t('about.pillars.escrow.b3'),
              ]}
            />
            <PillarCard
              icon={Truck}
              title={t('about.pillars.shipment.title')}
              description={t('about.pillars.shipment.desc')}
              bullets={[
                t('about.pillars.shipment.b1'),
                t('about.pillars.shipment.b2'),
                t('about.pillars.shipment.b3'),
              ]}
            />
          </div>
        </Section>

        <Section
          eyebrow={t('about.framework.eyebrow')}
          title={t('about.framework.title')}
          subtitle={t('about.framework.subtitle')}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-text-dark">{t('about.framework.item1.title')}</p>
                  <p className="text-sm text-text-gray mt-1 leading-relaxed">{t('about.framework.item1.desc')}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-text-dark">{t('about.framework.item2.title')}</p>
                  <p className="text-sm text-text-gray mt-1 leading-relaxed">{t('about.framework.item2.desc')}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-text-dark">{t('about.framework.item3.title')}</p>
                  <p className="text-sm text-text-gray mt-1 leading-relaxed">{t('about.framework.item3.desc')}</p>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        <Section
          eyebrow={t('about.users.eyebrow')}
          title={t('about.users.title')}
          subtitle={t('about.users.subtitle')}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-start gap-4">
                <Factory className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="text-xl font-cairo font-bold text-text-dark">{t('about.users.m.title')}</h3>
                  <p className="text-text-gray mt-2 leading-relaxed">
                    {t('about.users.m.desc')}
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="text-text-gray flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                      {t('about.users.m.b1')}
                    </li>
                    <li className="text-text-gray flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                      {t('about.users.m.b2')}
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-4">
                <Building2 className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="text-xl font-cairo font-bold text-text-dark">{t('about.users.s.title')}</h3>
                  <p className="text-text-gray mt-2 leading-relaxed">
                    {t('about.users.s.desc')}
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="text-text-gray flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                      {t('about.users.s.b1')}
                    </li>
                    <li className="text-text-gray flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                      {t('about.users.s.b2')}
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        <Section
          eyebrow={t('about.metrics.eyebrow')}
          title={t('about.metrics.title')}
          subtitle={t('about.metrics.subtitle')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t('about.metrics.rfq.label')} value={t('about.metrics.rfq.value')} note={t('about.metrics.rfq.note')} />
            <StatCard label={t('about.metrics.qual.label')} value={t('about.metrics.qual.value')} note={t('about.metrics.qual.note')} />
            <StatCard label={t('about.metrics.disputes.label')} value={t('about.metrics.disputes.value')} note={t('about.metrics.disputes.note')} />
            <StatCard label={t('about.metrics.shipment.label')} value={t('about.metrics.shipment.value')} note={t('about.metrics.shipment.note')} />
          </div>
        </Section>

        <Section
          eyebrow={t('about.roadmap.eyebrow')}
          title={t('about.roadmap.title')}
          subtitle={t('about.roadmap.subtitle')}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <p className="font-semibold text-text-dark">{t('about.roadmap.r1.title')}</p>
              <p className="text-sm text-text-gray mt-2 leading-relaxed">
                {t('about.roadmap.r1.desc')}
              </p>
            </Card>
            <Card>
              <p className="font-semibold text-text-dark">{t('about.roadmap.r2.title')}</p>
              <p className="text-sm text-text-gray mt-2 leading-relaxed">
                {t('about.roadmap.r2.desc')}
              </p>
            </Card>
            <Card>
              <p className="font-semibold text-text-dark">{t('about.roadmap.r3.title')}</p>
              <p className="text-sm text-text-gray mt-2 leading-relaxed">
                {t('about.roadmap.r3.desc')}
              </p>
            </Card>
          </div>
        </Section>

        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-cairo font-bold text-text-dark">{t('about.finalCta.title')}</h2>
                  <p className="text-text-gray mt-2 leading-relaxed">
                    {t('about.finalCta.desc')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <Link to="/marketplace" className="w-full sm:w-auto">
                    <Button variant="primary" className="w-full">
                      {t('about.finalCta.primary')}
                    </Button>
                  </Link>
                  <Link to="/test-data" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">
                      {t('about.finalCta.secondary')}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
