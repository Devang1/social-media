import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from './redux/store.js';
import './index.css'
import App from './App.jsx'
import { SocketProvider } from "./context/socketContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <SocketProvider>
            <App />
          </SocketProvider>,
      </Provider>
    </BrowserRouter>
  </StrictMode >,
)
