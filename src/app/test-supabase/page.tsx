/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestSupabasePage() {
  const [result, setResult] = useState<string>('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  const testConnection = async () => {
    try {
      setResult('Testing connection...')
      
      // Test 1: Check if we can reach Supabase
      const { error: healthError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (healthError) {
        setResult(`Database connection error: ${healthError.message}`)
        return
      }

      setResult('✅ Database connection successful!')

      // Test 2: Try to get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setResult(prev => prev + `\n❌ Session error: ${sessionError.message}`)
      } else if (session) {
        setResult(prev => prev + `\n✅ Current session found: ${session.user.email}`)
      } else {
        setResult(prev => prev + '\n❌ No active session')
      }

      // Test 3: Show environment status
      const envStatus = `
Environment Variables:
- SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
- SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
      `
      setResult(prev => prev + '\n' + envStatus)

    } catch (error: any) {
      setResult(`Unexpected error: ${error.message}`)
    }
  }

  const testSignUp = async () => {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'Test123456!'

    try {
      setResult('Testing sign up...')
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      if (error) {
        setResult(`Sign up error: ${JSON.stringify(error, null, 2)}`)
      } else {
        setResult(`Sign up successful: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error: any) {
      setResult(`Unexpected sign up error: ${error.message}`)
    }
  }

  const testCustomLogin = async () => {
    if (!email || !password) {
      setResult('Please enter both email and password')
      return
    }

    try {
      setResult('Testing login...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        setResult(`Login error: ${JSON.stringify({
          message: error.message,
          status: error.status,
          name: error.name,
        }, null, 2)}`)
      } else {
        setResult(`Login successful! User: ${data.user?.email}`)
      }
    } catch (error: any) {
      setResult(`Unexpected login error: ${error.message}`)
    }
  }

  const buttonStyle = {
    padding: '12px 24px',
    margin: '8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>
        Supabase Connection Test
      </h1>
      
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={testConnection}
          style={{ ...buttonStyle, backgroundColor: '#3B82F6' }}
        >
          Test Database Connection
        </button>

        <button
          onClick={testSignUp}
          style={{ ...buttonStyle, backgroundColor: '#10B981' }}
        >
          Test Sign Up
        </button>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Test Login with Your Credentials
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="your@email.com"
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="your-password"
          />
        </div>
        
        <button
          onClick={testCustomLogin}
          style={{ 
            ...buttonStyle, 
            backgroundColor: '#6366F1',
            width: '100%',
            margin: '0'
          }}
        >
          Test Login
        </button>
      </div>

      <pre style={{ 
        padding: '16px', 
        backgroundColor: '#F3F4F6', 
        borderRadius: '4px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap'
      }}>
        {result || 'Click a button to test...'}
      </pre>

      <div style={{ 
        marginTop: '32px', 
        padding: '16px', 
        backgroundColor: '#FEF3C7', 
        borderRadius: '4px' 
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Debug Info:</p>
        <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}</p>
        <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'NOT SET'}</p>
      </div>
    </div>
  )
}