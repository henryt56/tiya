import React from 'react';
import PropTypes from 'prop-types';
import '../styles/global.css';
import { AuthProvider } from '../context/AuthContext.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Header';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Header />
      <main>
        <Component {...pageProps} />
      </main>
    </AuthProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;
