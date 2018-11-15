import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyAKCKQ4Zhqp96WcxROepTEZ9le_6FmzIAk",	
    authDomain: "final-faraday-project.firebaseapp.com",	   
    databaseURL: "https://final-faraday-project.firebaseio.com",
    projectId: "final-faraday-project",	  
    storageBucket: "final-faraday-project.appspot.com",	
    messagingSenderId: "644910716714"
};

firebase.initializeApp(config);

export const ref = firebase.database().ref();
export const database = firebase.database();
export const firebaseAuth = firebase.auth;
