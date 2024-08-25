import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyAKA75bTQ4z_KnA79nhorCIDUTqfrYKEZo",
  authDomain: "stockstore-d2ec2.firebaseapp.com",
  projectId: "stockstore-d2ec2",
  storageBucket: "stockstore-d2ec2.appspot.com",
  messagingSenderId: "504566287350",
  appId: "1:504566287350:web:0a57b69dab3110c5b195d7",
  measurementId: "G-57E9ZLV0EZ"
 };
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };