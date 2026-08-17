import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

/** Crea una cuenta Ethereal de prueba la primera vez y la reutiliza */
async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter

  // Opción A: Ethereal — cuenta de prueba automática, sin credenciales reales
  const testAccount = await nodemailer.createTestAccount()
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  console.log('\n📧 Cuenta Ethereal de prueba creada:')
  console.log(`   Usuario: ${testAccount.user}`)
  console.log(`   Contraseña: ${testAccount.pass}`)

  return transporter
}

/**
 * Envía el código de recuperación al correo indicado.
 * En modo desarrollo (Ethereal) imprime la URL de vista previa en consola.
 */
export async function enviarCodigo(correo: string, codigo: string): Promise<void> {
  const t = await getTransporter()

  const info = await t.sendMail({
    from: '"RideUJAP 🚗" <no-reply@rideujap.edu.ve>',
    to: correo,
    subject: 'Código de recuperación — RideUJAP',
    text: `Tu código de recuperación de RideUJAP es: ${codigo}\n\nExpira en 10 minutos.\n\nSi no solicitaste este código, ignora este mensaje.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#0b6e4f;margin-top:0;">RideUJAP</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Tu código de verificación es:</p>
        <div style="font-size:2rem;font-weight:bold;letter-spacing:0.4rem;text-align:center;padding:1rem;background:#f0faf5;border-radius:6px;color:#0b6e4f;">
          ${codigo}
        </div>
        <p style="font-size:0.85rem;color:#666;margin-top:1.5rem;">
          Expira en <strong>10 minutos</strong>. Si no solicitaste este código, ignora este mensaje.
        </p>
      </div>
    `,
  })

  // Imprime la URL de vista previa para la demo académica
  const previewUrl = nodemailer.getTestMessageUrl(info)
  if (previewUrl) {
    console.log('\n📬 Correo de recuperación enviado (Ethereal preview):')
    console.log(`   → ${previewUrl}\n`)
  }
}
