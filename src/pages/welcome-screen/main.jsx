import React from 'react'
import ReactDOM from 'react-dom'
import WelcomeScreen from './WelcomeScreen'

import "./index.scss";
import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(
  <React.StrictMode>
    <WelcomeScreen />
  </React.StrictMode>
)


// ReactDOM.render(
//   <React.StrictMode>
//     <WelcomeScreen />
//   </React.StrictMode>,
//   document.getElementById('root')
// )

