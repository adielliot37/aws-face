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

  useEffect(() => {
    const t = localStorage.getItem('access_token');
    if (!t) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/users/me');
        setProfile(data);
      } catch (e) {
        // token invalid/expired -> clear and force login
        localStorage.removeItem('access_token');
        setAuthed(false);
      } finally { setLoading(false); }
    })();
  }, [authed]);

  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  return (
    <div className="App">
      <header style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Face Liveness Detection & Registration</h1>
      </header>
      <main style={{ padding: '20px' }}>
        {loading && <div>Loading your profile…</div>}
        {!loading && profile?.uid ? (
          <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 12 }}>
            <h3>Welcome back</h3>
            <pre>{JSON.stringify(profile, null, 2)}</pre>
          </div>
        ) : (
          <>
            <FaceLivenessDetector onResult={(r) => { setResult(r); /* refresh profile */ setAuthed(a=>a); }} />
            {result && (
              <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
                <h3>Result:</h3>
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}