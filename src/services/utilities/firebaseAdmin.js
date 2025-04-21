import admin from 'firebase-admin';

if (!admin.apps.length) {
	try {
		admin.initializeApp({
			credential: admin.credential.cert({
				projectId: process.env.FIREBASE_PROJECT_ID,
				clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
				privateKey: process.env.FIREBASE_PRIVATE_KEY,
			}),
			databaseURL: process.env.FIREBASE_DATABASE_URL,
		});
	} catch (e) {
		console.log('Firebase Admin failed to initialize:', e.stack);
	}
}

export default admin;
