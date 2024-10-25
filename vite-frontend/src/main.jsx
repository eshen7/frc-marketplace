import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from './pages/Login'; 
import Signup from './pages/Signup';
import Request from './pages/Request'; 
import Fulfill from './pages/Fulfill'; 

const ErrorPage = () => <p> Sorry, this page does not exist</p>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/request',
    element: <Request />,
  },
  {
    path: '/fulfill',
    element: <Fulfill />,
  },
  {
    path: '*',
    element: <p>Page not found</p>,
  },
]);

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// initializes root if root hasn't been created yet --- only time createRoot should be called
let root;
if (!rootElement._reactRoot) {
  root = createRoot(rootElement);
  rootElement._reactRoot = root; // marks root as initialized
}

//render application
const renderApp =() => {
  if (root) {
    root.render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
   );
  }
};
//initial application rendering
renderApp();

//hmr
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    //re renders the app on module replacement
    renderApp();
  });
}

