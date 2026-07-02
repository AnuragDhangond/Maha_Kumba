import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18n';

import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Catch unhandled promise rejections (not caught by window.onerror)
window.addEventListener('unhandledrejection', function(event) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#fff0f0;color:#b71c1c;padding:20px;box-sizing:border-box;z-index:9999999;font-size:14px;overflow:auto;font-family:monospace';
  div.innerHTML = '<h2 style="margin-top:0">Diagnostics: Unhandled Promise Rejection</h2><p><b>Reason:</b> ' + (event.reason?.message || String(event.reason)) + '</p><pre style="white-space:pre-wrap;font-size:12px">' + (event.reason?.stack || 'No stack') + '</pre>';
  document.body.appendChild(div);
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
