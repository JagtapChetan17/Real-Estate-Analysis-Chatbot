// Chat bubble styles
export const chatBubble = {
  user: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    borderRadius: '18px 18px 4px 18px',
    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)',
    color: 'white',
  },
  bot: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: '18px 18px 18px 4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    color: '#1e293b',
  },
}

// Avatar styles
export const avatar = {
  user: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  bot: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
  },
}

// Input bar styles
export const inputBar = {
  container: {
    background: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '24px',
    padding: '8px 16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  input: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    width: '100%',
    fontSize: '16px',
    color: '#1e293b',
    padding: '8px 12px',
  },
}

// Card styles
export const card = {
  primary: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #f1f5f9',
  },
  gradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
  },
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
  },
}

// Button styles
export const button = {
  primary: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '600',
    padding: '12px 24px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
  },
  secondary: {
    background: 'white',
    borderRadius: '12px',
    color: '#475569',
    fontWeight: '600',
    padding: '12px 24px',
    border: '2px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
  },
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '600',
    padding: '12px 24px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
  },
}

// Table styles
export const table = {
  header: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderBottom: '2px solid #e2e8f0',
    fontWeight: '600',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#475569',
  },
  row: {
    borderBottom: '1px solid #f1f5f9',
    hover: {
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    },
  },
  cell: {
    padding: '12px 16px',
    fontSize: '14px',
  },
}