import React, { useState } from 'react';
import api from '../api';

export default function Login({ onDone }) {
  const [phone, setPhone] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState('start'); // start | verify
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const startOtp = async () => {
    setErr('');
    setLoading(true);
    try {
      await api.post('/api/auth/start-otp', { phone, invite_code: inviteCode });
      setPhase('verify');
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message);
    } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    setErr('');
    setLoading(true);
    try {
      await api.post('/api/auth/resend-otp', { phone, invite_code: inviteCode });
      setErr('OTP resent successfully');
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
          <input placeholder="Phone (+91...)" value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%', padding:8, marginBottom:8}} />
          <input placeholder="Invite Code (required for new users)" value={inviteCode} onChange={e=>setInviteCode(e.target.value)} style={{width:'100%', padding:8}} />
          <p style={{fontSize:12, color:'#6c757d', margin:'4px 0'}}>
            Invite code is only required for new users. Existing users can leave it blank.
          </p>
          <button onClick={startOtp} disabled={!phone || loading} style={{marginTop:12}}>Send OTP</button>
        </>
      ) : (
        <>
          <div style={{marginBottom:8}}>OTP sent to {phone}</div>
          <input placeholder="Enter OTP" value={code} onChange={e=>setCode(e.target.value)} style={{width:'100%', padding:8}} />
          <div style={{display:'flex', gap:8, marginTop:12}}>
            <button onClick={verifyOtp} disabled={!code || loading} style={{flex:1}}>Verify</button>
            <button onClick={resendOtp} disabled={loading} style={{flex:1, backgroundColor:'#6c757d'}}>Resend OTP</button>
          </div>
        </>
      )}
      {err && <div style={{color:'red', marginTop:8}}>{err}</div>}
    </div>
  );
}