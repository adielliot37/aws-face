import React, { useState } from 'react';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import api from '../api';

function FaceLivenessDetectorComponent({ onResult }) {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createLivenessSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post('/api/faces/liveness/create-session');
      setSessionId(data.sessionId);
    } catch (err) {
      setError('Failed to create liveness session: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/api/faces/liveness/process-results', { sessionId });
      onResult?.(data);
      setSessionId(null);
    } catch (err) {
      setError('Failed to process liveness results: ' + (err.response?.data?.detail || err.message));
      onResult?.({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    console.error('Liveness detection error:', error);
    setError('Liveness detection failed: ' + error.message);
    setSessionId(null);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Processing...</div>;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
      <button onClick={() => { setError(null); setSessionId(null); }}>Try Again</button>
    </div>
  );

  if (!sessionId) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Face Liveness Detection</h2>
      <p>Click the button below to start the liveness detection process.</p>
      <button onClick={createLivenessSession} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Start Liveness Check
      </button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#212529' }}>Look at the camera and follow instructions</h2>
        <p style={{ margin: '0', fontSize: '14px', color: '#6c757d', lineHeight: '1.4' }}>Photosensitivity warning: This check flashes different colors. Use caution if you are photosensitive.</p>
      </div>
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e9ecef' }}>
        <FaceLivenessDetector sessionId={sessionId} region="us-east-1" onAnalysisComplete={handleAnalysisComplete} onError={handleError} />
      </div>
    </div>
  );
}

export default FaceLivenessDetectorComponent;