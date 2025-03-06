import React from 'react';
import logo from './logo.svg';
import './App.css';
import { AuthProvider } from './context/AuthContext.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import MapComponent from './MapComponent'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Welcome to the Tutor in Your Area (TIYA) website! Here, you'll find available tutors nearby.
          </p>

          <p>

          </p>

          {/*Shows a map of the tutor's location */}
          <MapComponent /> 

          <div>
            {}
            This is a test div for additional information.
          </div>
        </header>
      </div>
    </AuthProvider>
  );
}

export default App;
