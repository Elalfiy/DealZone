import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary onError={(error, errorInfo) => {
      // Keep logging minimal; devtools will show the stack as well.
      console.error('App crashed:', error)
      console.error(errorInfo)
    }}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

