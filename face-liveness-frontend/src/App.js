import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import FaceLivenessDetector from './components/FaceLivenessDetector';
import Login from './components/Login';
import api from './api';
import awsExports from './aws-exports';
import './App.css';

Amplify.configure(awsExports);

export default function App() {
  const [result, setResult] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authed, setAuthed] = useState(!!localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null); // pending, verified, failed

  const checkProcessingStatus = async () => {
    try {
      const { data } = await api.get('/api/users/me');
      setProfile(data);
      
      // Determine user status based on backend response
      if (data.uid) {
        // User has been verified and has a uid
        setProcessingStatus('verified');
      } else if (data.pending && data.status === 'pending') {
        // User has submitted face for verification but is still pending
        setProcessingStatus('pending');
      } else if (data.status === 'failed') {
        // User's face verification failed
        setProcessingStatus('failed');
      } else {
        // New user who hasn't done face verification yet
        setProcessingStatus('new');
      }
    } catch (e) {
      // token invalid/expired -> clear and force login
      localStorage.removeItem('access_token');
      setAuthed(false);
    }
  };

  useEffect(() => {
    const t = localStorage.getItem('access_token');
    if (!t) return;
    
    setLoading(true);
    checkProcessingStatus().finally(() => setLoading(false));
  }, [authed]);

  // Poll for status updates when user is in pending state
  useEffect(() => {
    if (processingStatus !== 'pending') return;
    
    const interval = setInterval(async () => {
      await checkProcessingStatus();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [processingStatus]);

  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  return (
    <div className="App">
      <header style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Face Liveness Detection & Registration</h1>
      </header>
      <main style={{ padding: '20px' }}>
        {loading && <div>Loading your profile…</div>}
        {!loading && processingStatus === 'verified' && profile?.uid ? (
          <div style={{ padding: 16, border: '1px solid #28a745', borderRadius: 12, backgroundColor: '#d4edda' }}>
            <h3 style={{ color: '#155724' }}>✅ Verification Complete</h3>
            <p>Your face has been successfully verified and registered!</p>
            <pre style={{ backgroundColor: '#f8f9fa', padding: 10, borderRadius: 4 }}>
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
        ) : processingStatus === 'pending' ? (
          <div style={{ padding: 16, border: '1px solid #ffc107', borderRadius: 12, backgroundColor: '#fff3cd' }}>
            <h3 style={{ color: '#856404' }}>⏳ Verification In Progress</h3>
            <p>Your face is being processed for verification. This may take a few minutes.</p>
            <p>We'll automatically update when verification is complete.</p>
            <div style={{ marginTop: 16 }}>
              <div style={{ 
                width: '100%', 
                height: 4, 
                backgroundColor: '#f0f0f0', 
                borderRadius: 2, 
                overflow: 'hidden' 
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#ffc107',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
              </div>
              <p style={{ fontSize: 12, color: '#856404', marginTop: 8 }}>
                Checking status every 30 seconds...
              </p>
            </div>
          </div>
        ) : processingStatus === 'failed' ? (
          <div style={{ padding: 16, border: '1px solid #dc3545', borderRadius: 12, backgroundColor: '#f8d7da' }}>
            <h3 style={{ color: '#721c24' }}>❌ Verification Failed</h3>
            <p>Your face verification was not successful. Please try again.</p>
            <button 
              onClick={() => {
                setProcessingStatus('new');
                setResult(null);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : processingStatus === 'new' ? (
          <>
            <FaceLivenessDetector onResult={(r) => { 
              setResult(r); 
              // After face detection, check status immediately
              setTimeout(() => checkProcessingStatus(), 1000);
            }} />
            {result && (
              <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
                <h3>Liveness Detection Result:</h3>
                <pre>{JSON.stringify(result, null, 2)}</pre>
                {!result.success && (
                  <div style={{ 
                    marginTop: 10, 
                    padding: 10, 
                    backgroundColor: '#fff3cd', 
                    borderRadius: 4,
                    border: '1px solid #ffc107'
                  }}>
                    <p style={{ margin: 0, color: '#856404' }}>
                      Face detection completed. Your verification is now being processed in the background.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: 16, border: '1px solid #6c757d', borderRadius: 12, backgroundColor: '#f8f9fa' }}>
            <h3 style={{ color: '#495057' }}>Loading...</h3>
            <p>Checking your verification status...</p>
          </div>
        )}
      </main>
    </div>
  );
}