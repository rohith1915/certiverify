import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import StudentModal from '../components/StudentModal'
import CertModal from '../components/CertModal'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState({ total: 0, courses: 0, latestYear: '-' })
  const [search, setSearch] = useState({ name: '', course: '', year: '' })
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('dashboard')

  // Modals
  const [addOpen, setAddOpen] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [certStudent, setCertStudent] = useState(null)

  // Verify tab
  const [verifyCertId, setVerifyCertId] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [verifyLoading, setVerifyLoading] = useState(false)

  const fileRef = useRef()
  const [fileName, setFileName] = useState('No file chosen')

  useEffect(() => { fetchStudents(); fetchStats() }, [])

  const fetchStudents = async (params = {}) => {
    setLoading(true)
    try {
      const { data } = await api.get('/students', { params })
      setStudents(data.students)
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/students/stats')
      setStats(data)
    } catch {}
  }

  const handleSearch = () => fetchStudents(search)
  const handleClear = () => { setSearch({ name: '', course: '', year: '' }); fetchStudents() }

  const handleSaveStudent = async (form) => {
    try {
      if (editStudent) {
        await api.put(`/students/${editStudent.id}`, form)
        toast.success('Student updated!')
      } else {
        await api.post('/students', form)
        toast.success('Student added!')
      }
      setAddOpen(false); setEditStudent(null)
      fetchStudents(); fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
      throw err
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return
    try {
      await api.delete(`/students/${id}`)
      toast.success('Student deleted')
      fetchStudents(); fetchStats()
    } catch { toast.error('Delete failed') }
  }

  const handleImport = async () => {
    const file = fileRef.current?.files[0]
    if (!file) { toast.error('Choose a CSV or Excel file first'); return }
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/students/import/excel', formData)
      toast.success(data.message)
      fetchStudents(); fetchStats()
      fileRef.current.value = ''; setFileName('No file chosen')
    } catch { toast.error('Import failed') }
  }

  const handleVerify = async e => {
    e.preventDefault()
    setVerifyLoading(true); setVerifyResult(null)
    try {
      const { data } = await api.get(`/students/verify/${verifyCertId.trim()}`)
      setVerifyResult({ valid: true, student: data.student })
    } catch (err) {
      if (err.response?.status === 404) setVerifyResult({ valid: false })
    } finally { setVerifyLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'dashboard' ? styles.tabActive : ''}`} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={`${styles.tab} ${tab === 'verify' ? styles.tabActive : ''}`} onClick={() => setTab('verify')}>Verify Certificate</button>
      </div>

      {tab === 'dashboard' && (
        <div>
          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard} style={{'--stat-color':'linear-gradient(135deg,#ff6b6b,#ffa500)'}}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statVal}>{stats.total}</div>
              <div className={styles.statLbl}>Total Students</div>
            </div>
            <div className={styles.statCard} style={{'--stat-color':'linear-gradient(135deg,#06ffa5,#00d2ff)'}}>
              <div className={styles.statIcon}>🎓</div>
              <div className={styles.statVal}>{stats.total}</div>
              <div className={styles.statLbl}>Certificates Issued</div>
            </div>
            <div className={styles.statCard} style={{'--stat-color':'linear-gradient(135deg,#a855f7,#00d2ff)'}}>
              <div className={styles.statIcon}>📚</div>
              <div className={styles.statVal}>{stats.courses}</div>
              <div className={styles.statLbl}>Courses</div>
            </div>
            <div className={styles.statCard} style={{'--stat-color':'linear-gradient(135deg,#ffa500,#a855f7)'}}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statVal}>{stats.latestYear || '-'}</div>
              <div className={styles.statLbl}>Latest Year</div>
            </div>
          </div>

          {/* Header */}
          <div className={styles.dashHeader}>
            <h2>Admin Dashboard</h2>
            <button className={styles.btnPrimary} onClick={() => { setEditStudent(null); setAddOpen(true) }}>+ Add Student</button>
          </div>

          {/* Upload row */}
          <div className={styles.uploadRow}>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
              onChange={e => setFileName(e.target.files[0]?.name || 'No file chosen')} />
            <span className={styles.fileName}>{fileName}</span>
            <button className={styles.btnUpload} onClick={() => fileRef.current.click()}>Choose File</button>
            <button className={styles.btnUpload} onClick={handleImport}>Upload</button>
          </div>

          {/* Search row */}
          <div className={styles.searchRow}>
            <input placeholder="Search name..." value={search.name} onChange={e => setSearch({ ...search, name: e.target.value })} />
            <input placeholder="Course..." value={search.course} onChange={e => setSearch({ ...search, course: e.target.value })} />
            <input placeholder="Year..." value={search.year} onChange={e => setSearch({ ...search, year: e.target.value })} />
            <button className={styles.btnSearch} onClick={handleSearch}>Search</button>
            <button className={styles.btnClear} onClick={handleClear}>Clear</button>
          </div>

          {/* Table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Roll</th><th>Course</th><th>Year</th><th>Certificate ID</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className={styles.empty}>Loading...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={8} className={styles.empty}>No students found.</td></tr>
                ) : students.map((s, i) => (
                  <tr key={s.id}>
                    <td className={styles.idx}>{i + 1}</td>
                    <td>{s.name}</td>
                    <td className={styles.email}>{s.email}</td>
                    <td>{s.roll}</td>
                    <td><span className={styles.courseBadge}>{s.course}</span></td>
                    <td>{s.year}</td>
                    <td className={styles.certId}>{s.cert_id}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={`${styles.btn} ${styles.btnGreen}`} onClick={() => setCertStudent(s)}>Download</button>
                        <button className={`${styles.btn} ${styles.btnYellow}`} onClick={() => { setEditStudent(s); setAddOpen(true) }}>Edit</button>
                        <button className={`${styles.btn} ${styles.btnRed}`} onClick={() => handleDelete(s.id, s.name)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'verify' && (
        <div className={styles.verifyWrap}>
          <div className={styles.verifyCard}>
            <h2>Verify Certificate</h2>
            <p>Enter a certificate ID to check its authenticity.</p>
            <form onSubmit={handleVerify} className={styles.verifyForm}>
              <input value={verifyCertId} onChange={e => setVerifyCertId(e.target.value)} placeholder="e.g. CERT001" />
              <button type="submit" className={styles.btnPrimary} disabled={verifyLoading}>
                {verifyLoading ? 'Checking...' : 'Verify'}
              </button>
            </form>
            {verifyResult && (
              <div className={verifyResult.valid ? styles.resultValid : styles.resultInvalid}>
                {verifyResult.valid ? (
                  <>
                    <div className={styles.resultTitle}>✓ Certificate Verified</div>
                    {Object.entries({ Name: verifyResult.student.name, Email: verifyResult.student.email, Course: verifyResult.student.course, Year: verifyResult.student.year, 'Certificate ID': verifyResult.student.cert_id }).map(([k, v]) => (
                      <div key={k} className={styles.resultRow}><span className={styles.rk}>{k}</span><span className={styles.rv}>{v}</span></div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className={styles.resultTitle}>✗ Not Found</div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No record found for <strong style={{ color: '#fff' }}>{verifyCertId.toUpperCase()}</strong>.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <StudentModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditStudent(null) }}
        onSave={handleSaveStudent}
        initial={editStudent}
      />
      <CertModal open={!!certStudent} onClose={() => setCertStudent(null)} student={certStudent} />
    </div>
  )
}
