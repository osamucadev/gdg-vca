import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { app } from './config'

const auth = getAuth(app)

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function signOut() {
  await firebaseSignOut(auth)
}

export { auth }
