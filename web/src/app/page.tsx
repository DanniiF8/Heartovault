export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0a1628',
      color: '#e8f4ff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
        Heartovault
      </h1>
      <p style={{ opacity: 0.7 }}>
        A tua coleção Heartopia
      </p>
    </main>
  )
}