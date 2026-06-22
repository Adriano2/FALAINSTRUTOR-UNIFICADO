/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Assinatura digital ICP-Brasil dos certificados emitidos.
 *
 * O certificado A1 (.pfx) e a sua senha JAMAIS ficam no repositório. Eles são
 * lidos exclusivamente de variáveis de ambiente em produção (Render):
 *   - ICP_PFX_BASE64   → conteúdo do .pfx codificado em base64
 *   - ICP_PFX_PASSWORD → senha do certificado
 *   - ICP_PFX_PATH     → (alternativa local) caminho para o arquivo .pfx
 *
 * Quando configurado, o módulo extrai a identidade real do certificado
 * (titular, emissor, número de série, validade) e assina criptograficamente
 * (RSA SHA-256) os dados de cada certificado emitido. Sem configuração, o
 * módulo fica inativo e a plataforma usa a identidade informada no painel.
 */

import fs from 'node:fs';
import forge from 'node-forge';

export interface IcpSignerInfo {
  holder: string;
  cpf?: string;
  issuer: string;
  serial: string;
  validFrom: string;
  validUntil: string;
}

let privateKey: forge.pki.rsa.PrivateKey | null = null;
let signerInfo: IcpSignerInfo | null = null;
let initialized = false;

/**
 * Extrai a chave privada e a identidade (titular, emissor, série, validade) de
 * um certificado A1 (.pfx) qualquer. Usado tanto pelo certificado global quanto
 * pelo certificado individual de cada instrutor. Retorna null em qualquer falha
 * (inclusive senha incorreta).
 */
export function extractPfx(
  buffer: Buffer,
  password: string,
): { info: IcpSignerInfo; key: forge.pki.rsa.PrivateKey } | null {
  try {
    const der = forge.util.createBuffer(buffer.toString('binary'));
    const asn1 = forge.asn1.fromDer(der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password);

    const shrouded = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
    const plain = p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag];
    const keyBag = (shrouded && shrouded[0]) || (plain && plain[0]);

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
    const cert = certBags && certBags[0] && certBags[0].cert;
    if (!keyBag || !keyBag.key || !cert) return null;

    const subjectCN = (cert.subject.getField('CN')?.value as string) || '';
    const issuerCN = (cert.issuer.getField('CN')?.value as string) || 'ICP-Brasil';
    const [holderRaw, cpf] = subjectCN.split(':');

    return {
      key: keyBag.key as forge.pki.rsa.PrivateKey,
      info: {
        holder: titleCase(holderRaw || subjectCN),
        cpf: cpf ? cpf.trim() : undefined,
        issuer: issuerCN,
        serial: (cert.serialNumber || '').toUpperCase(),
        validFrom: formatDate(cert.validity.notBefore),
        validUntil: formatDate(cert.validity.notAfter),
      },
    };
  } catch {
    return null;
  }
}

/** Assina (RSA SHA-256) com uma chave privada específica. */
export function signWithKey(
  key: forge.pki.rsa.PrivateKey,
  data: string,
): { signature: string; algorithm: string } {
  const md = forge.md.sha256.create();
  md.update(data, 'utf8');
  return { signature: forge.util.encode64(key.sign(md)), algorithm: 'SHA256withRSA' };
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b([a-zà-ú])/g, (m) => m.toUpperCase())
    .trim();
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function loadPfxBuffer(): Buffer | null {
  if (process.env.ICP_PFX_BASE64) {
    try {
      return Buffer.from(process.env.ICP_PFX_BASE64, 'base64');
    } catch {
      return null;
    }
  }
  if (process.env.ICP_PFX_PATH) {
    try {
      return fs.readFileSync(process.env.ICP_PFX_PATH);
    } catch {
      return null;
    }
  }
  return null;
}

function init(): void {
  if (initialized) return;
  initialized = true;

  const password = process.env.ICP_PFX_PASSWORD;
  const buffer = loadPfxBuffer();
  if (!buffer || !password) return;

  const extracted = extractPfx(buffer, password);
  if (!extracted) {
    console.error('[ICP] Falha ao carregar o certificado .pfx (verifique o arquivo e a senha).');
    return;
  }
  privateKey = extracted.key;
  signerInfo = extracted.info;
  console.log(`[ICP] Certificado digital global carregado: ${signerInfo.holder} (válido até ${signerInfo.validUntil}).`);
}

export function isIcpConfigured(): boolean {
  init();
  return !!privateKey && !!signerInfo;
}

export function getSignerInfo(): IcpSignerInfo | null {
  init();
  return signerInfo;
}

/**
 * Assina criptograficamente (RSA SHA-256) os dados canônicos de um certificado.
 * A assinatura é determinística e pode ser conferida com a chave pública do
 * certificado ICP-Brasil. Retorna null se o módulo não estiver configurado.
 */
export function signPayload(data: string): { signature: string; algorithm: string } | null {
  init();
  if (!privateKey) return null;
  const md = forge.md.sha256.create();
  md.update(data, 'utf8');
  const signature = privateKey.sign(md);
  return { signature: forge.util.encode64(signature), algorithm: 'SHA256withRSA' };
}
