import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const { error, info } = this.state;
      return (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: '#e8f5e9', color: '#1b5e20', padding: '20px',
          boxSizing: 'border-box', zIndex: 9999999, fontSize: '13px',
          overflow: 'auto', fontFamily: 'monospace'
        }}>
          <h2 style={{ marginTop: 0, color: 'green' }}>BUILD: v10 - ErrorBoundary</h2>
          <h3 style={{ color: '#b71c1c' }}>React Component Error</h3>
          <p><b>Message:</b> {error && error.toString()}</p>
          <p><b>Stack:</b></p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px', background: '#f1f8e9', padding: '10px', borderRadius: '4px' }}>
            {error && error.stack}
          </pre>
          <p><b>Component Stack:</b></p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px', background: '#f1f8e9', padding: '10px', borderRadius: '4px' }}>
            {info && info.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
