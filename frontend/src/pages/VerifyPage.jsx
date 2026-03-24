import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import styles from './VerifyPage.module.css'

export default function VerifyPage() {
  const [certId, setCertId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async e => {
    e.preventDefault()
    if (!certId.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.get(`/students/verify/${certId.trim()}`)
      setResult({ valid: true, student: data.student })
    } catch (err) {
      if (err.response?.status === 404) setResult({ valid: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.badge}>✦ Public Verification Portal</div>
        <h2 className={styles.title}>Verify Your <span>Certificate</span></h2>
        <p className={styles.sub}>Enter the certificate ID printed on your certificate to instantly verify its authenticity and view student details.</p>

        <form onSubmit={handleVerify} className={styles.form}>
          <input
            value={certId}
            onChange={e => setCertId(e.target.value)}
            placeholder="e.g. CERT001"
            className={styles.input}
          />
          <button type="submit" className={styles.btnVerify} disabled={loading}>
            {loading ? 'Checking...' : 'Verify'}
          </button>
        </form>

        {result && (
          <div className={result.valid ? styles.resultValid : styles.resultInvalid}>
            {result.valid ? (
              <>
                <div className={styles.resultTitle}>✅ Certificate Verified Successfully</div>
                <table className={styles.resultTable}>
                  <tbody>
                    {[
                      ['Name', result.student.name],
                      ['Email', result.student.email],
                      ['Roll No.', result.student.roll],
                      ['Course', result.student.course],
                      ['Year', result.student.year],
                      ['Certificate ID', result.student.cert_id],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td className={styles.rKey}>{k}</td>
                        <td className={styles.rVal}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <>
                <div className={styles.resultTitle}>❌ Certificate Not Found</div>
                <p className={styles.resultMsg}>No record found for <strong>{certId.toUpperCase()}</strong>. This certificate ID may be invalid or does not exist in our system.</p>
              </>
            )}
          </div>
        )}

        <Link to="/login" className={styles.back}>← Back to Login</Link>
      </div>
    </div>
  )
}
