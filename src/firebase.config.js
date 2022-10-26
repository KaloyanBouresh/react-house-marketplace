import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBB6lp0Dv4R2yr-CSB_k-vyNGPmPDGhcCA",
    authDomain: "react-house-marketplace-6c7d0.firebaseapp.com",
    projectId: "react-house-marketplace-6c7d0",
    storageBucket: "react-house-marketplace-6c7d0.appspot.com",
    messagingSenderId: "980671115986",
    appId: "1:980671115986:web:b4494ea676cf63b434330b"
};

// Initialize Firebase
// eslint-disable-next-line no-unused-vars
const app = initializeApp(firebaseConfig);

export const db = getFirestore();