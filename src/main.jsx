import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-right" toastOptions={{
                    duration: 3000,
                    style: { background: '#1a3c5e', color: '#fff', borderRadius: '8px' }
                }} />
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
