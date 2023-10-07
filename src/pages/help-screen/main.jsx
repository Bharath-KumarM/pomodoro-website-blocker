import React from 'react'
import HelpScreen from './HelpScreen'

import "./index.scss";
import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(
  <React.StrictMode>
    <HelpScreen />
  </React.StrictMode>
)
