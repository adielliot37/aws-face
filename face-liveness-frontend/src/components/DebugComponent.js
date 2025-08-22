import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

function DebugComponent() {
  const [sessionId, setSessionId] = useState('');
  const [debugResult, setDebugResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testDebugEndpoint = async () => {
    if (!sessionId.trim()) {
      alert('Please enter a session ID');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/faces/liveness/debug-results`, {
        sessionId: sessionId.trim()
      });
      
      setDebugResult(response.data);
    } catch (error) {
      setDebugResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', margin: '20px 0' }}>
      <h3>Debug Liveness Results</h3>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Enter Session ID to debug"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          style={{ width: '300px', padding: '8px' }}
        />
        <button 
          onClick={testDebugEndpoint}
          disabled={loading}
          style={{ marginLeft: '10px', padding: '8px 16px' }}
        >
          {loading ? 'Testing...' : 'Debug Results'}
        </button>
      </div>
      
      {debugResult && (
        <div style={{ marginTop: '20px' }}>
          <h4>Debug Output:</h4>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            overflow: 'auto',
            maxHeight: '400px' 
          }}>
            {JSON.stringify(debugResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default DebugComponent;