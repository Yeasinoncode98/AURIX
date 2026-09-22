/**
 * AURIX — Firestore Product Seeder
 * Usage: node scripts/seed-products.mjs
 *
 * This script uses the Firebase REST API directly — no extra packages needed.
 * It reads your .env file for the project ID and uses an ID token from a
 * temporary anonymous sign-in to write to Firestore.
 *
 * Prerequisites: npm run dev should work (env vars set up correctly).
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Read .env manually (no dotenv needed) ──────────────────────────────────
const envPath = resolve(__dirname, '../.env')
const envRaw  = readFileSync(envPath, 'utf8')
const env     = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
)

const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID
const API_KEY    = env.VITE_FIREBASE_API_KEY

if (!PROJECT_ID || !API_KEY) {
  console.error('❌  Missing VITE_FIREBASE_PROJECT_ID or VITE_FIREBASE_API_KEY in .env')
  process.exit(1)
}

// ── Product data ───────────────────────────────────────────────────────────
const products = [
  {
    slug: 'aurix-pro',
    data: {
      id: 1,
      slug: 'aurix-pro',
      name: 'AURIX Pro',
      tagline: 'Reference-grade studio headphone',
      price: 449,
      badge: 'Best Seller',
      color: 'Midnight Black',
      image: '/assets/aurix/aurix-product-showcase.png',
      rating: 4.9,
      reviews: 2840,
      description: 'Engineered for the most demanding listeners. The AURIX Pro delivers studio-accurate sound with our proprietary beryllium driver technology.',
      longDescription: 'The AURIX Pro is the culmination of years of acoustic research and precision engineering. Built for studio professionals and audiophiles who refuse to compromise, it features a hand-selected 50mm beryllium driver — a material 7× stiffer than titanium yet lighter than aluminum — producing a frequency response that tracks true from the sub-bass rumble of a kick drum all the way to the air of a cymbal shimmer.\n\nEvery element is purpose-built. The memory-foam earcups are wrapped in Japanese protein leather, distributing clamping force uniformly across the head. The single-sided cable entry reduces microphonics during critical listening. And the headband — machined from aerospace-grade 6061 aluminum — provides lasting structural rigidity without adding a gram of unnecessary weight.',
      specs: { Driver: '50mm Beryllium', Frequency: '5Hz – 40kHz', Impedance: '32Ω', Weight: '285g' },
      features: [
        { icon: 'driver', title: 'Beryllium Driver',  desc: 'Hand-calibrated 50mm beryllium dome, the same material used in high-end studio monitors.' },
        { icon: 'ear',    title: 'Memory-Foam Seal',  desc: 'Japanese protein leather earcups with 30mm memory foam for 4-hour fatigue-free sessions.' },
        { icon: 'cable',  title: 'Detachable Cable',  desc: 'Dual 3.5mm + 6.35mm adapter, OFC copper braid, 1.5m tangle-resistant.' },
        { icon: 'build',  title: 'Aerospace Build',   desc: '6061-T6 aluminum headband and stainless steel yokes. Built to last a decade.' },
      ],
      fullSpecs: {
        'Transducer Type': 'Dynamic, closed-back', 'Driver Diameter': '50mm Beryllium Dome',
        'Frequency Response': '5Hz – 40kHz', 'Impedance': '32Ω', 'Sensitivity': '103 dB/mW',
        'THD': '< 0.05% at 1kHz', 'Max Input Power': '1500mW', 'Cable Length': '1.5m (detachable)',
        'Connector': '3.5mm TRS + 6.35mm adapter', 'Weight': '285g (without cable)',
        'Ear Cup Material': 'Japanese Protein Leather', 'Headband': '6061-T6 Aluminum',
      },
      inBox: ['AURIX Pro Headphone', '1.5m OFC Cable (3.5mm)', '6.35mm Gold Adapter', 'Hard-shell Carry Case', 'Cleaning Cloth', 'Authenticity Card'],
    },
  },
  {
    slug: 'aurix-air',
    data: {
      id: 2,
      slug: 'aurix-air',
      name: 'AURIX Air',
      tagline: 'Weightless all-day comfort',
      price: 299,
      badge: 'New',
      color: 'Arctic White',
      image: '/assets/aurix/aurix-product-showcase.png',
      rating: 4.7,
      reviews: 1620,
      description: 'Ultra-light construction meets premium sound. AURIX Air is built for marathon listening sessions without fatigue.',
      longDescription: 'Weighing in at just 198g, the AURIX Air redefines what a full-day headphone feels like. Its magnesium alloy frame — used in aerospace components for its exceptional strength-to-weight ratio — feels almost invisible on the head. The 40mm titanium-coated driver delivers a wide, airy soundstage perfectly suited for jazz, classical, and acoustic genres.\n\nThe self-adjusting headband eliminates fit fuss entirely. Ultra-soft velour earcups breathe naturally, keeping your ears cool during extended listening.',
      specs: { Driver: '40mm Titanium', Frequency: '10Hz – 32kHz', Impedance: '24Ω', Weight: '198g' },
      features: [
        { icon: 'driver', title: 'Titanium Driver',  desc: '40mm titanium-coated dome for extended highs and a wide, natural soundstage.' },
        { icon: 'ear',    title: 'Velour Earcups',   desc: 'Breathable micro-velour fabric — runs cool even after hours of wear.' },
        { icon: 'frame',  title: 'Magnesium Frame',  desc: 'Full magnesium alloy construction. 198g total — 30% lighter than comparable models.' },
        { icon: 'fit',    title: 'Auto-Adjust Band', desc: 'Self-adjusting headband fits head sizes 52–64cm with zero manual tuning.' },
      ],
      fullSpecs: {
        'Transducer Type': 'Dynamic, open-back', 'Driver Diameter': '40mm Titanium Dome',
        'Frequency Response': '10Hz – 32kHz', 'Impedance': '24Ω', 'Sensitivity': '98 dB/mW',
        'THD': '< 0.08% at 1kHz', 'Max Input Power': '1000mW', 'Cable Length': '1.2m (detachable)',
        'Connector': '3.5mm TRS', 'Weight': '198g (without cable)',
        'Ear Cup Material': 'Micro-Velour', 'Headband': 'Magnesium Alloy',
      },
      inBox: ['AURIX Air Headphone', '1.2m OFC Cable', 'Soft Carry Pouch', 'Cleaning Cloth', 'Authenticity Card'],
    },
  },
  {
    slug: 'aurix-sport',
    data: {
      id: 3,
      slug: 'aurix-sport',
      name: 'AURIX Sport',
      tagline: 'Built for motion',
      price: 249,
      badge: null,
      color: 'Carbon Red',
      image: '/assets/aurix/aurix-product-showcase.png',
      rating: 4.6,
      reviews: 980,
      description: 'IP54 rated and sweat-proof. AURIX Sport locks in for the hardest workouts while delivering punchy, energetic sound.',
      longDescription: 'The AURIX Sport was designed in the gym, tested on the track, and refined in the studio. Its graphene-composite driver delivers the fast, punchy transient response that makes bass-heavy music hit harder during a workout — without sacrificing mid-range clarity for your podcasts and calls.\n\nIP54 certification means it handles sweat and rain without hesitation. The Sport Grip earcup lining uses a dual-layer silicone mesh that wicks moisture away from the skin.',
      specs: { Driver: '40mm Graphene', Frequency: '8Hz – 28kHz', Impedance: '16Ω', Weight: '212g' },
      features: [
        { icon: 'driver', title: 'Graphene Driver', desc: 'Graphene composite membrane: ultra-light, ultra-rigid. Faster bass response than titanium.' },
        { icon: 'water',  title: 'IP54 Rated',      desc: 'Sweat and splash resistant. Train in any conditions.' },
        { icon: 'grip',   title: 'Sport Grip Cups', desc: 'Dual-layer silicone mesh earcups wick moisture and grip under movement.' },
        { icon: 'fit',    title: 'Secure-Fit Band', desc: 'Tensioned headband with rubber grips — stays put through your hardest sessions.' },
      ],
      fullSpecs: {
        'Transducer Type': 'Dynamic, closed-back', 'Driver Diameter': '40mm Graphene Composite',
        'Frequency Response': '8Hz – 28kHz', 'Impedance': '16Ω', 'Sensitivity': '100 dB/mW',
        'THD': '< 0.1% at 1kHz', 'Max Input Power': '1200mW', 'Water Resistance': 'IP54',
        'Cable Length': '1.0m (detachable)', 'Connector': '3.5mm TRS', 'Weight': '212g (without cable)',
        'Ear Cup Material': 'Silicone Mesh', 'Headband': 'Reinforced Polymer',
      },
      inBox: ['AURIX Sport Headphone', '1.0m Reinforced Cable', 'Sport Clip', 'Carry Bag', 'Authenticity Card'],
    },
  },
  {
    slug: 'aurix-studio',
    data: {
      id: 4,
      slug: 'aurix-studio',
      name: 'AURIX Studio',
      tagline: 'Mix. Master. Perfect.',
      price: 599,
      badge: 'Limited',
      color: 'Graphite Grey',
      image: '/assets/aurix/aurix-product-showcase.png',
      rating: 5.0,
      reviews: 412,
      description: 'The ultimate mastering headphone. Flat frequency response and ultra-wide soundstage expose every detail in your mix.',
      longDescription: 'The AURIX Studio is an uncompromising mastering tool. Its 55mm diamond-coated dome driver — the largest in the AURIX lineup — operates with a ruler-flat frequency response from 3Hz to 50kHz. No coloration. No enhancement. Just the truth of your mix, rendered with surgical precision.\n\nAt 600Ω impedance, the Studio is engineered to pair with dedicated headphone amplifiers. Limited to 500 units per production run.',
      specs: { Driver: '55mm Diamond Dome', Frequency: '3Hz – 50kHz', Impedance: '600Ω', Weight: '320g' },
      features: [
        { icon: 'driver', title: 'Diamond Dome',     desc: '55mm CVD diamond-coated driver — stiffest material available, zero resonance coloration.' },
        { icon: 'flat',   title: 'Flat Response',    desc: '±1.5dB from 20Hz–20kHz. Reference-accurate reproduction for mixing and mastering.' },
        { icon: 'cable',  title: 'Dual-Entry Cable', desc: 'Balanced dual 3.5mm entry with OFC copper braid eliminates channel crosstalk.' },
        { icon: 'build',  title: 'Lambskin Leather', desc: 'Hand-stitched lambskin headband and earcups. Built and finished by hand.' },
      ],
      fullSpecs: {
        'Transducer Type': 'Dynamic, semi-open', 'Driver Diameter': '55mm Diamond-Coated Dome',
        'Frequency Response': '3Hz – 50kHz', 'Impedance': '600Ω', 'Sensitivity': '96 dB/mW',
        'THD': '< 0.02% at 1kHz', 'Max Input Power': '2000mW', 'Cable Length': '3.0m (detachable, balanced)',
        'Connector': 'Dual 3.5mm + 6.35mm adapter', 'Weight': '320g (without cable)',
        'Ear Cup Material': 'Lambskin Leather', 'Headband': 'Hand-Stitched Leather',
        'Production': 'Limited — 500 units/run',
      },
      inBox: ['AURIX Studio Headphone', '3.0m Balanced OFC Cable', '6.35mm Gold Adapter', 'Aluminium Flight Case', 'White Gloves', 'Certificate of Authenticity', 'Cleaning Kit'],
    },
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────

/** Convert a JS value to Firestore REST API value format */
function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null }
  if (typeof val === 'boolean')  return { booleanValue: val }
  if (typeof val === 'number')   return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val }
  if (typeof val === 'string')   return { stringValue: val }
  if (Array.isArray(val))        return { arrayValue: { values: val.map(toFirestoreValue) } }
  if (typeof val === 'object')   return { mapValue: { fields: toFirestoreFields(val) } }
  return { stringValue: String(val) }
}

function toFirestoreFields(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, toFirestoreValue(v)])
  )
}

/** Get an anonymous ID token from Firebase Auth REST API */
async function getAnonymousToken() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) }
  )
  const json = await res.json()
  if (!json.idToken) throw new Error('Could not get anonymous token: ' + JSON.stringify(json))
  return json.idToken
}

/** Write one product document to Firestore via REST */
async function writeProduct(slug, data, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products/${slug}`
  const body = JSON.stringify({ fields: toFirestoreFields(data) })
  const res  = await fetch(url, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body,
  })
  const json = await res.json()
  if (json.error) throw new Error(`Firestore error for ${slug}: ${JSON.stringify(json.error)}`)
  return json
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔥  AURIX Firestore Product Seeder`)
  console.log(`📦  Project: ${PROJECT_ID}\n`)

  // NOTE: Anonymous sign-in must be enabled in Firebase Console
  // Firebase Console → Authentication → Sign-in method → Anonymous → Enable
  console.log('🔑  Getting auth token (anonymous sign-in)...')
  let token
  try {
    token = await getAnonymousToken()
    console.log('✅  Token obtained\n')
  } catch (err) {
    console.error('❌  Auth failed:', err.message)
    console.error('\n👉  Make sure Anonymous sign-in is ENABLED in Firebase Console:')
    console.error('    Firebase Console → Authentication → Sign-in method → Anonymous → Enable\n')
    process.exit(1)
  }

  // Write each product
  for (const { slug, data } of products) {
    process.stdout.write(`   Writing ${slug}... `)
    try {
      await writeProduct(slug, data, token)
      console.log('✅')
    } catch (err) {
      console.log('❌')
      console.error(`   Error: ${err.message}`)
    }
  }

  console.log('\n🎉  Done! All products written to Firestore.')
  console.log('    Open Firebase Console → Firestore → products to verify.\n')
}

main()
