/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cifragem simétrica em repouso (AES-256-GCM) para segredos sensíveis guardados
 * no banco — em especial o certificado digital A1 (.pfx) e a sua senha de cada
 * instrutor.
 *
 * A chave é derivada de uma variável de ambiente (NUNCA versionada):
 *   - CERT_ENC_KEY  → chave dedicada (recomendado). Qualquer string longa.
 *   - fallback: JWT_SECRET (já obrigatório para a aplicação rodar).
 *
 * Formato do texto cifrado: base64(iv).base64(tag).base64(ciphertext)
 */

import crypto from 'node:crypto';

function key(): Buffer {
  // Prefere uma chave dedicada; cai para o JWT_SECRET por compatibilidade com o
  // material já cifrado. NUNCA usa chave vazia (isso tornaria o .pfx dos
  // instrutores decifrável com uma chave pública conhecida).
  const secret = process.env.CERT_ENC_KEY || process.env.JWT_SECRET || '';
  if (!secret) {
    throw new Error('CERT_ENC_KEY/JWT_SECRET ausente: impossível cifrar/decifrar certificados com segurança.');
  }
  // Deriva uma chave de 32 bytes (AES-256) de forma estável a partir do segredo.
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/** Cifra um texto. Retorna null se a entrada for vazia. */
export function encryptSecret(plaintext: string): string | null {
  if (!plaintext) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${enc.toString('base64')}`;
}

/** Decifra um texto previamente cifrado por encryptSecret. Retorna null em falha. */
export function decryptSecret(payload: string | null | undefined): string | null {
  if (!payload) return null;
  try {
    const [ivB64, tagB64, dataB64] = payload.split('.');
    if (!ivB64 || !tagB64 || !dataB64) return null;
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const dec = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]);
    return dec.toString('utf8');
  } catch {
    return null;
  }
}

/**
 * Assinatura ELETRÔNICA (não-ICP): HMAC-SHA256 determinístico dos dados
 * canônicos do certificado, usando o segredo do servidor. Serve como prova de
 * autoria/integridade (MP 2.200-2/2001, art. 10, §2º) quando o instrutor não
 * possui um certificado ICP-Brasil A1 cadastrado.
 */
export function electronicSign(data: string): string {
  return crypto.createHmac('sha256', key()).update(data, 'utf8').digest('base64');
}
