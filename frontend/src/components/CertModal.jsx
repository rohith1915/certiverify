import { jsPDF } from 'jspdf'
import styles from './Modal.module.css'
import certStyles from './CertModal.module.css'

export default function CertModal({ open, onClose, student }) {
  if (!open || !student) return null

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    // Background
    doc.setFillColor(15, 17, 23)
    doc.rect(0, 0, 297, 210, 'F')

    // Border
    doc.setDrawColor(91, 95, 255)
    doc.setLineWidth(3)
    doc.rect(10, 10, 277, 190)
    doc.setLineWidth(1)
    doc.setDrawColor(91, 95, 255, 0.4)
    doc.rect(14, 14, 269, 182)

    // Title
    doc.setTextColor(91, 95, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('CertVerify', 148.5, 45, { align: 'center' })

    doc.setTextColor(160, 168, 204)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('CERTIFICATE OF COMPLETION', 148.5, 55, { align: 'center' })

    // Divider
    doc.setDrawColor(80, 80, 120)
    doc.setLineWidth(0.5)
    doc.line(60, 62, 237, 62)

    doc.setTextColor(136, 136, 170)
    doc.setFontSize(11)
    doc.text('This is to certify that', 148.5, 75, { align: 'center' })

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(30)
    doc.setFont('helvetica', 'bold')
    doc.text(student.name, 148.5, 92, { align: 'center' })

    doc.setTextColor(160, 168, 204)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('has successfully completed', 148.5, 104, { align: 'center' })

    doc.setTextColor(160, 160, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(student.course, 148.5, 117, { align: 'center' })

    doc.setTextColor(136, 136, 170)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Year: ${student.year}`, 148.5, 128, { align: 'center' })

    doc.line(60, 138, 237, 138)

    doc.setTextColor(136, 136, 170)
    doc.setFontSize(10)
    doc.text('Certificate ID', 148.5, 149, { align: 'center' })
    doc.setTextColor(91, 95, 255)
    doc.setFontSize(13)
    doc.setFont('courier', 'bold')
    doc.text(student.cert_id, 148.5, 159, { align: 'center' })

    doc.setTextColor(100, 100, 140)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Issued to: ${student.email}  |  Roll: ${student.roll}`, 148.5, 185, { align: 'center' })

    doc.save(`${student.cert_id}_${student.name}.pdf`)
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal}`} style={{ maxWidth: 460 }}>
        <div className={styles.header}>
          <h3>Certificate Preview</h3>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={certStyles.cert}>
          <div className={certStyles.certLogo}>CertVerify</div>
          <div className={certStyles.certSub}>CERTIFICATE OF COMPLETION</div>
          <hr className={certStyles.divider} />
          <div className={certStyles.issuedTo}>This is to certify that</div>
          <div className={certStyles.name}>{student.name}</div>
          <div className={certStyles.completed}>has successfully completed</div>
          <div className={certStyles.course}>{student.course}</div>
          <div className={certStyles.year}>Year: {student.year}</div>
          <hr className={certStyles.divider} />
          <div className={certStyles.certIdLabel}>Certificate ID</div>
          <div className={certStyles.certId}>{student.cert_id}</div>
          <div className={certStyles.email}>{student.email} &nbsp;|&nbsp; Roll: {student.roll}</div>
        </div>

        <div className={styles.btns}>
          <button className={styles.btnCancel} onClick={onClose}>Close</button>
          <button className={styles.btnSave} onClick={downloadPDF}>⬇ Download PDF</button>
        </div>
      </div>
    </div>
  )
}
