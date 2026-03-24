import { useNavigate } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('cv_user') || '{}')

  const logout = () => {
    localStorage.removeItem('cv_token')
    localStorage.removeItem('cv_user')
    navigate('/login')
  }

  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>CertiVerify</span>
      <div className={styles.right}>
        <span className={styles.user}>{user.username || 'Admin'}</span>
        <button className={styles.logout} onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}
