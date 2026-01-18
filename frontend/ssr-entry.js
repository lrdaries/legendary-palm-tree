
// SSR Entry Point
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from '../src/App';

export default function render(req, res) {
  const html = ReactDOMServer.renderToString(<App />);
  return html;
}
