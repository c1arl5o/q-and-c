import { useState, useEffect } from 'react'
import { supabase } from './config/supabaseClient'
import SignIn from './components/SignIn'
import Onboarding from './components/Onboarding'
import Success from './components/Success'

type AppView = 'signin' | 'onboarding' | 'success';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('signin')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserStatus()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkOnboardingStatus()
      } else {
        setCurrentView('signin')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUserStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        await checkOnboardingStatus()
      } else {
        setCurrentView('signin')
      }
    } catch (error) {
      console.error('Error checking user status:', error)
      setCurrentView('signin')
    } finally {
      setLoading(false)
    }
  }

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user has completed onboarding
        const onboardingCompleted = user.user_metadata?.onboarding_completed
        
        if (onboardingCompleted) {
          setCurrentView('success')
        } else {
          setCurrentView('onboarding')
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  const handleSignInSuccess = async () => {
    // After sign in/sign up, check if onboarding is needed
    await checkOnboardingStatus()
  }

  const handleOnboardingComplete = () => {
    setCurrentView('success')
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>
  }

  return (
    <>
      {currentView === 'signin' && (
        <SignIn onSignInSuccess={handleSignInSuccess} />
      )}
      {currentView === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      {currentView === 'success' && (
        <Success />
      )}
    </>
  )
}

export default App
