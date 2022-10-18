import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx"
import './index.css'

ReactDOM.render(
  //StrictMode activates some additional warnings and checks
  <React.StrictMode>
    <App />
  </React.StrictMode>,

  document.getElementById('root'))