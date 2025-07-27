import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './slidemenu.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './utility/store'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './utility/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
    <ThemeProvider>
    <App />
    </ThemeProvider>
    </Provider>
    </BrowserRouter>
  </StrictMode>,
)
