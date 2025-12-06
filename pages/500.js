export default function Custom500() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          500 - Server Error
        </h1>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Something went wrong on our end.
        </p>
        <a
          href="/"
          style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Go to Homepage
        </a>
      </div>
    </div>
  )
}
