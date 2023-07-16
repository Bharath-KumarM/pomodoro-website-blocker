import React from 'react'
// import ReactDOM from 'react-dom'
import RestrictedScreen from './RestrictedScreen'
import { createRoot } from 'react-dom/client';

import "./index.scss";

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(
  <React.StrictMode>
    <RestrictedScreen />
  </React.StrictMode>
);
// ReactDOM.render(
//   document.getElementById('root')
// )

