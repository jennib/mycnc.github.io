import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './renderer/i18n'
import { configureMonaco } from '@mycnc/shared';

// Configure Monaco loader
configureMonaco();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
