// import 'react-devtools'
import React, { Children, StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from '../../components/App/App'
import './index.scss'


ReactDOM.createRoot(document.getElementById('root')).
    render(
        // <StrictMode>
            <App />
        // </StrictMode>
    )
