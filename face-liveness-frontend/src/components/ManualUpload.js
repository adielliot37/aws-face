import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

function ManualUpload({ onResult }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('face', selectedFile);

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/faces/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onResult(response.data);
    } catch (error) {
      onResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', margin: '20px 0' }}>
      <h3>Manual Upload (for testing)</h3>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      <button 
        onClick={handleUpload} 
        disabled={!selectedFile || loading}
        style={{ marginLeft: '10px' }}
      >
        {loading ? 'Processing...' : 'Upload & Process'}
      </button>
    </div>
  );
}

export default ManualUpload;