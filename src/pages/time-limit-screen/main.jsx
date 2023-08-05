import React from 'react'
import ReactDOM from 'react-dom'
import TimeLimitScreen from './TimeLimitScreen'

import "./index.scss";
import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(
  <React.StrictMode>
    <TimeLimitScreen />
  </React.StrictMode>
)


// ReactDOM.render(
//   <React.StrictMode>
//     <TimeLimitScreen />
//   </React.StrictMode>,
//   document.getElementById('root')
// )

