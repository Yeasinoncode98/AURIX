import Hero from '../components/Hero'
import ProductReveal from '../components/ProductReveal'
import Sound from '../components/Sound'
import Engineering from '../components/Engineering'
import Craftsmanship from '../components/Craftsmanship'
import Specifications from '../components/Specifications'
import CTA from '../components/CTA'

export default function Home() {
  return (
    <main>
      <Hero />
      <ProductReveal />
      <Sound />
      <Engineering />
      <Craftsmanship />
      <Specifications />
      <CTA />
    </main>
  )
}
