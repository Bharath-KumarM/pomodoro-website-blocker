import React from 'react'
import ReactDOM from 'react-dom'
import BlockedScreen from './BlockedScreen'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "./index.scss";


const router = createBrowserRouter([
  {
    path: "/",
    element: <div>I am root!</div>,
  },
  {
    path: "/src/pages/blocked-screen/blocked-screen.html/*",
    element: <BlockedScreen />,
  },
  {
    path: "/src",
    element: <div>Hmmmm!  2...</div>,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
// ReactDOM.render(
//   <React.StrictMode>
//     <BlockedScreen />
//   </React.StrictMode>,
//   document.getElementById('root')
// )

