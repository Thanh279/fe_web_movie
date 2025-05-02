import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './Home.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="895110505394-8cgdapjh8tprl968tu7ekg6pauflca0e.apps.googleusercontent.com">

    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
)
