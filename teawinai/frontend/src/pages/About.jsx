export default function About() {
  return (
    <div className="page">
      <div className="hero-content" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="eyebrow">
          <span className="eyebrow-pill">About Us</span>
        </div>
        <h1 className="hero-title" style={{ marginBottom: '24px' }}>
          Discover Thailand's Hidden Gems
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: 'rgba(255,255,255,0.8)', 
          maxWidth: '700px', 
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          The Emerald Editorial is your ultimate guide to exploring Thailand's most beautiful destinations, 
          from ancient temples to pristine beaches.
        </p>
      </div>
    </div>
  )
}
