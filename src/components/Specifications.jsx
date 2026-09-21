const specGroups = [
  {
    title: 'Acoustic Performance',
    rows: [
      ['Driver Size',          '40mm Graphene Composite Diaphragm'],
      ['Frequency Response',   '4Hz – 40kHz (Extended Range Mode)'],
      ['Total Harmonic Distortion', '<0.05% THD @ 1kHz 94dB SPL'],
      ['Sensitivity',          '103 dB SPL/mW'],
      ['Impedance',            '32Ω nominal'],
    ],
  },
  {
    title: 'Noise Cancellation',
    rows: [
      ['ANC Technology',       'Hybrid Adaptive Feedforward + Feedback'],
      ['Attenuation',          '−42dB peak (20Hz–1kHz)'],
      ['Microphone Array',     'Quad-mic MEMS beamforming array'],
      ['Processing Speed',     '50,000 recalculations / second'],
    ],
  },
  {
    title: 'Wireless & Connectivity',
    rows: [
      ['Bluetooth Version',    'Bluetooth 5.3 (Multipoint Dual Device)'],
      ['Supported Codecs',     'aptX Lossless, aptX Adaptive, AAC, SBC'],
      ['Battery Life',         '40 Hours (ANC On) / 55 Hours (ANC Off)'],
      ['Charging Speed',       '10 min charge = 4 hours playback (USB-C)'],
    ],
  },
  {
    title: 'Physical Dimensions',
    rows: [
      ['Weight',               '261 grams'],
      ['Chassis Material',     'CNC 6061 Aluminium & Anodised Alloy'],
      ['Water Resistance',     'IPX4 Weather & Sweat resistant'],
    ],
  },
]

export default function Specifications() {
  return (
    <section id="specifications" className="section-wrap" style={{ background: '#0c0c0c' }} aria-label="Technical Specifications">
      <div className="container-inner">
        <div className="eyebrow">
          <div className="eyebrow-line" />
          <span className="eyebrow-text">Technical Data</span>
        </div>
        <h2 className="section-title">Every detail, documented.</h2>
        <p className="section-desc">Complete specifications for the AURIX ONE flagship wireless headphone.</p>

        <div className="mt-12 border-t border-border" role="table" aria-label="AURIX ONE Technical Specifications">
          {specGroups.map(g => (
            <div key={g.title} role="rowgroup">
              <div className="text-[10px] font-semibold tracking-wider4 uppercase text-red py-7 pb-[10px] border-b border-border">{g.title}</div>
              {g.rows.map(([key, val]) => (
                <div key={key} className="spec-row" role="row">
                  <div className="spec-key" role="cell">{key}</div>
                  <div className="spec-val" role="cell">{val}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
