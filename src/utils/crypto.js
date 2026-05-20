const crypto = require('crypto')
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY nao configurada')
if (!/^[a-fA-F0-9]{64}\$/.test(ENCRYPTION_KEY)) throw new Error('ENCRYPTION_KEY invalida')
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
    if (parts.length !== 3) throw new Error('Formato invalido')
    const [ivHex, authTagHex, encryptedHex] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const encryptedText = Buffer.from(encryptedHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY_BUFFER, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()])
    return decrypted.toString('utf8')
  } catch (e) {
    console.error('Erro ao descriptografar:', e.message)
    return ''
  }
}

function safeDecrypt(text, fallback = '') {
  try {
    return decrypt(text)
  } catch {
    return fallback
  }
}

function encryptObject(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(item => encryptObject(item))
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = encrypt(value)
    } else if (value && typeof value === 'object') {
      result[key] = encryptObject(value)
    } else {
      result[key] = value
    }
  }
  return result
}

function decryptObject(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(item => decryptObject(item))
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = safeDecrypt(value, value)
    } else if (value && typeof value === 'object') {
      result[key] = decryptObject(value)
    } else {
      result[key] = value
    }
  }
  return result
}

module.exports = { encrypt, decrypt, safeDecrypt, encryptObject, decryptObject }
