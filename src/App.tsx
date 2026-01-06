import { useState } from 'react'
import SignIn from './components/SignIn'
import Success from './components/Success'

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)

  return (
    <>
      {isSignedIn ? (
        <Success />
      ) : (
        <SignIn onSignInSuccess={() => setIsSignedIn(true)} />
      )}
    </>
  )
}

export default App
