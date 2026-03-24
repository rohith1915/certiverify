import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogin = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('cv_token', data.token)
      localStorage.setItem('cv_user', JSON.stringify(data.user))
      toast.success('Welcome back, ' + data.user.username + '!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>C</div>
          <div className={styles.logo}>CertiVerify</div>
        </div>
        <p className={styles.sub}>Certificate Management & Verification System</p>

        <form onSubmit={handleLogin}>
          <div className={styles.field}>
            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} placeholder="Enter username" required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter password" required />
          </div>
          <button type="submit" className={styles.btnLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Login as Admin'}
          </button>
        </form>

        <div className={styles.divider}>or</div>
        <Link to="/verify" className={styles.btnPublic}>
          Verify a Certificate (Public)
        </Link>
      </div>
    </div>
  )
}
