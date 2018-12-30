// FIREBASE METHODS
// Initialize Firebase

/* globals firebase */

const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
};

firebase.initializeApp(config);


const firebasedb = firebase.database();
const firebaseauth = firebase.auth();

export { firebase, firebasedb, firebaseauth };
