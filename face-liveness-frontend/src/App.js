import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import FaceLivenessDetector from './components/FaceLivenessDetector';
import DebugComponent from './components/DebugComponent';
import awsExports from './aws-exports';
import './App.css';

Amplify.configure(awsExports);

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="App">
      <header style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Face Liveness Detection & Registration</h1>
      </header>
      
      <main style={{ padding: '20px' }}>
        <FaceLivenessDetector onResult={setResult} />
        
        {/* Debug component - remove in production */}
        <DebugComponent />
        
        {result && (
          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
            <h3>Result:</h3>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;