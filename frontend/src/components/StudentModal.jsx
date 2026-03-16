import { useState, useEffect } from 'react'
import styles from './Modal.module.css'

const COURSES = ['BCA', 'MCA', 'BSC', 'B.TECH', 'Arts', 'MBA', 'BBA', 'B.COM', 'M.TECH']

export default function StudentModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ name: '', email: '', roll: '', course: 'BCA', year: '', cert_id: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initial) {
      setForm({ name: initial.name, email: initial.email, roll: initial.roll, course: initial.course, year: initial.year, cert_id: initial.cert_id })
    } else {
      setForm({ name: '', email: '', roll: '', course: 'BCA', year: new Date().getFullYear().toString(), cert_id: '' })
    }
  }, [initial, open])

  if (!open) return null

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(form)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{initial ? 'Edit Student' : 'Add Student'}</h3>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handle} placeholder="e.g. Rohith" required />
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handle} placeholder="rohith@gmail.com" required />
            </div>
            <div className={styles.field}>
              <label>Roll Number</label>
              <input name="roll" value={form.roll} onChange={handle} placeholder="101" required />
            </div>
            <div className={styles.field}>
              <label>Course</label>
              <select name="course" value={form.course} onChange={handle}>
                {COURSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Year</label>
              <input name="year" value={form.year} onChange={handle} placeholder="2026" required />
            </div>
            <div className={styles.field}>
              <label>Certificate ID <span style={{color:'var(--text-muted)',fontWeight:400}}>(auto if blank)</span></label>
              <input name="cert_id" value={form.cert_id} onChange={handle} placeholder="CERT006" />
            </div>
          </div>

          <div className={styles.btns}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btnSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
