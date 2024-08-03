// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQI8ieDkKxTSIS70aYGBvw6ITzxk6AVbA",
  authDomain: "inventory-mgt-e41bc.firebaseapp.com",
  projectId: "inventory-mgt-e41bc",
  storageBucket: "inventory-mgt-e41bc.appspot.com",
  messagingSenderId: "444361152785",
  appId: "1:444361152785:web:ac1fc499a383e8c14b14b0",
  measurementId: "G-KSCD4SXB94"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}