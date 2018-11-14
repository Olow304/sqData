import { ref, firebaseAuth } from '../config/firebase';

export function auth(email, password){
    return firebaseAuth().createUserWithEmailAndPassword(email, password).then((user) => {saveUser(user)})
}

export function logout(){
    return firebaseAuth().signOut();
}

export function login(email, password){
    return firebaseAuth().signInWithEmailAndPassword(email, password);
}

export function resetPassword(email){
    return firebaseAuth().sendPasswordResetEmail(email);
}

export function saveUser(user){
    return ref.child(`users/${user.uid}/info`)
    .set({
        uid: user.uid,
        
    }).then(() => {
        console.log("Here is user info: ", user)
    })

}