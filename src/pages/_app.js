import PropTypes from 'prop-types';
import '../styles/global.css';
import { AuthProvider } from '../services/context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Header';
import Footer from '../components/Footer'; // ✅ Correct import now
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
});

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <main className={montserrat.className}>
        <Header />
        <Component {...pageProps} />
        <Footer />
      </main>
    </AuthProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;
