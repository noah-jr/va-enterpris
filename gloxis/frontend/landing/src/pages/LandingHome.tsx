import { useState, useEffect } from 'react'
import { api } from '../api'

import { HeroSlider } from '../components/HeroSlider'
import { QuickActions } from '../components/QuickActions'
import { ProductsSection } from '../components/ProductsSection'
import { DigitalAppShowcase } from '../components/DigitalAppShowcase'
import { SimulatorSection } from '../components/SimulatorSection'
import { SecurityAndValidation } from '../components/SecurityAndValidation'
import { ContactSection } from '../components/ContactSection'
import { FaqSection } from '../components/FaqSection'

interface Produto {
  id: number
  nome: string
  taxaJurosMensal: number
  valorMinimo: number
  valorMaximo: number
  prazoMinimoMeses: number
  prazoMaximoMeses: number
}

export function LandingHome() {
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => {
    api
      .get('/produtos')
      .then((res: { data?: { data?: Produto[] } }) => setProdutos(res.data?.data || []))
      .catch(() => {})
  }, [])

  return (
    <main data-testid="landing-home">
      {/* Hero Section Slider */}
      <HeroSlider />

      {/* Iconic Quick Action Bar */}
      <QuickActions />

      {/* Products Showcase Tabs */}
      <ProductsSection />

      {/* Digital App & Kwik Showcase */}
      <DigitalAppShowcase />

      {/* Interactive Loan Amortization Simulator */}
      <SimulatorSection produtos={produtos} />

      {/* Fraud Prevention & Document Authenticity Verification */}
      <SecurityAndValidation />

      {/* Direct Citizen Contact & Official Support Form */}
      <ContactSection />

      {/* Support & Categorized FAQ */}
      <FaqSection />
    </main>
  )
}
