import React, { useState } from 'react'
import { waakyeApi } from '../api/waakyeApi'
import toast from 'react-hot-toast'
import { Upload, CheckCircle, FileText, Store, UtensilsCrossed, TrendingUp, Warehouse } from 'lucide-react'

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [branchId, setBranchId] = useState('1')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const branches = [
    { id: '1', name: 'Branch A - Accra Mall', type: 'retail' },
    { id: '2', name: 'Branch B - Madina Market', type: 'retail' },
    { id: '3', name: 'Branch C - Tema Station', type: 'retail' },
    { id: '4', name: 'Central Kitchen', type: 'kitchen' },
  ]

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)
    try {
      const response = await waakyeApi.uploadFile(parseInt(branchId), selectedFile)
      setUploadResult(response.data)
      toast.success('File uploaded successfully!')
    } catch (error) {
      toast.error('Upload failed: ' + (error.response?.data?.detail || error.message))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2d3748', marginBottom: 8 }}>Upload Inventory Data</h2>
      <p style={{ color: '#718096', marginBottom: 24 }}>
        Branch managers upload their inventory files. Supports CSV, Excel, PDF, and Images.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 className="card-title">📤 Upload File</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#4a5568' }}>
              Select Branch
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                background: 'white',
              }}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} {b.type === 'kitchen' ? '🏭' : '🏪'}</option>
              ))}
            </select>
          </div>

          <div
            className={`upload-area ${dragActive ? 'dragging' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <Upload size={40} color="#a0aec0" style={{ marginBottom: 12 }} />
            <p style={{ color: '#4a5568', marginBottom: 4 }}>
              {selectedFile ? selectedFile.name : 'Drag & drop or click to select'}
            </p>
            <p style={{ color: '#a0aec0', fontSize: 13 }}>
              Supports CSV, Excel (.xlsx), PDF, JPG, PNG
            </p>
            <input
              id="file-input"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png"
            />
          </div>

          {selectedFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f7fafc', borderRadius: 8 }}>
              <FileText size={20} color="#4299e1" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{selectedFile.name}</div>
                <div style={{ fontSize: 12, color: '#718096' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
          >
            {uploading ? 'Uploading...' : 'Upload Inventory File'}
          </button>

          {uploadResult && (
            <div style={{ marginTop: 16, padding: 16, background: '#f0fff4', borderRadius: 8, border: '1px solid #48bb78' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#276749' }}>
                <CheckCircle size={20} />
                <strong>Upload Successful!</strong>
              </div>
              <div style={{ fontSize: 14, color: '#2f855a', marginTop: 4 }}>
                Processed {uploadResult.records_processed || 0} records
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">📋 Supply Chain Flow</h3>
          <div style={{ fontSize: 14, color: '#4a5568', lineHeight: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <Warehouse size={16} color="#48bb78" />
              <strong>Warehouse Central</strong>
              <span style={{ color: '#a0aec0' }}>→</span>
              <Warehouse size={16} color="#ed8936" />
              <strong>Warehouse Annex</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', marginLeft: 40 }}>
              <Store size={16} color="#9f7aea" />
              <strong>Branch Stores</strong>
              <span style={{ color: '#a0aec0' }}>→</span>
              <UtensilsCrossed size={16} color="#f687b3" />
              <strong>Branch Kitchens</strong>
              <span style={{ color: '#a0aec0' }}>→</span>
              <TrendingUp size={16} color="#4299e1" />
              <strong>Sales</strong>
            </div>
            
            <div style={{ marginTop: 16, padding: 12, background: '#ebf8ff', borderRadius: 8 }}>
              <p style={{ fontSize: 13, color: '#2b6cb0' }}>
                <strong>💡 Tip:</strong> Upload files for any branch. The system automatically tracks 
                inventory across the entire supply chain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadPage