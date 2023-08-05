import React from 'react'
import ReactDOM from 'react-dom'
import BlockedScreen from './BlockedScreen'

import "./index.scss";

import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(
  <React.StrictMode>
    <BlockedScreen />
  </React.StrictMode>
)

// ReactDOM.render(
//   <React.StrictMode>
//     <BlockedScreen />
//   </React.StrictMode>,
//   document.getElementById('root')
// )

