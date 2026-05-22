function EmailInput({ email, onChange }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Correo del cliente
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        placeholder="cliente@email.com"
        style={{
          width: '100%',
          padding: '0.75rem',
          fontSize: '1rem',
          border: '1px solid #ccc',
          borderRadius: '6px',
          boxSizing: 'border-box'
        }}
      />
    </div>
  )
}

export default EmailInput