import PropTypes from 'prop-types';
import '../styles/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from '../components/Header';
import Footer from '../components/Footer';
import MessageIcon from '../components/Messaging/MessageIcon';

import { Montserrat } from 'next/font/google';
import { AuthProvider } from '../services/context/AuthContext';
import { ChatProvider } from '../services/context/ChatContext';

const montserrat = Montserrat({
	subsets: ['latin'],
	weight: ['100', '200', '300', '400', '500', '600'],
	style: ['normal', 'italic'],
	variable: '--font-montserrat',
});

function MyApp({ Component, pageProps }) {
	return (
		<AuthProvider>
			<ChatProvider>
				<main className={montserrat.className}>
					<Header />
					<Component {...pageProps} />
					<Footer />
					<MessageIcon />
				</main>
			</ChatProvider>
		</AuthProvider>
	);
}

MyApp.propTypes = {
	Component: PropTypes.elementType.isRequired,
	pageProps: PropTypes.object.isRequired,
};

export default MyApp;
