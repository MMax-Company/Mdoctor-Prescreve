const crypto = require('crypto')

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

if (!ENCRYPTION_KEY) {
  throw new Error('❌ ENCRYPTION_KEY n\u00e3o configurada')
}

const ENCRYPTION_KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, 'hex')

function encrypt(text) {
  if (text === null || text === undefined) return ''
  
  const value = String(text)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY_BUFFER, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':')
}

function decrypt(text) {
  if (!text) return ''
  
  try {
    const parts = text.split(':')
    if (parts.length !== 3) throw new Error('Formato inv\u00e1lido')
    
    const [ivHex, authTagHex, encryptedHex] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const encryptedText = Buffer.from(encryptedHex, 'hex')
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY_BUFFER, iv)
    decipher.setAuthTag(authTag)
    
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()])
    return decrypted.toString('utf8')
  } catch (e) {
    console.error('❌ Erro ao descriptografar:', e.message)
    return ''
  }
}

module.exports = { encrypt, decrypt }
