import { useState, useEffect } from 'react'
import { supabase } from './config/supabaseClient'
import SignIn from './components/SignIn'
import Success from './components/Success'

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>
  }

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
