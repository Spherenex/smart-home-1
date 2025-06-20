// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
     apiKey: "AIzaSyBzXzocbdytn4N8vLrT-V2JYZ8pgqWrbC0",
  authDomain: "self-balancing-7a9fe.firebaseapp.com",
  databaseURL: "https://self-balancing-7a9fe-default-rtdb.firebaseio.com",
  projectId: "self-balancing-7a9fe",
  storageBucket: "self-balancing-7a9fe.firebasestorage.app",
  messagingSenderId: "1044959372723",
  appId: "1:1044959372723:web:609b6c64f6b1b058ba97c6",
  measurementId: "G-V6DEXSSVZ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database };