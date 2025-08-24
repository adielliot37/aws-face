import React, { useState } from 'react';
import api from '../api';

export default function Login({ onDone }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState('start'); // start | verify
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const startOtp = async () => {
    setErr('');
    setLoading(true);
    try {
      await api.post('/api/auth/start-otp', { phone });
      setPhase('verify');
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message);
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/verify-otp', { phone, code });
      localStorage.setItem('access_token', data.access_token);
      onDone?.();
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{maxWidth: 360, margin: '24px auto', padding: 16, border: '1px solid #eee', borderRadius: 12}}>
      <h3>Login with OTP</h3>
      {phase === 'start' ? (
        <>
          <input placeholder="Phone (+91...)" value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%', padding:8}} />
          <button onClick={startOtp} disabled={!phone || loading} style={{marginTop:12}}>Send OTP</button>
        </>
      ) : (
        <>
          <div style={{marginBottom:8}}>OTP sent to {phone}</div>
          <input placeholder="Enter OTP" value={code} onChange={e=>setCode(e.target.value)} style={{width:'100%', padding:8}} />
          <button onClick={verifyOtp} disabled={!code || loading} style={{marginTop:12}}>Verify</button>
        </>
      )}
      {err && <div style={{color:'red', marginTop:8}}>{err}</div>}
    </div>
  );
}