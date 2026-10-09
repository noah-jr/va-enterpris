/**
 * Script: Gerar Par de Chaves RSA para Certificação AGT
 * =====================================================
 *
 * Conforme a Portaria 312/18 e o Anexo I do Decreto Executivo,
 * o software de faturação certificado pela AGT deve usar um par
 * de chaves assimétricas RSA para assinatura digital dos documentos.
 *
 * Este script gera:
 *   1. Chave Privada (RSA 2048 bits) → guardar em AGT_PRIVATE_KEY_PEM
 *   2. Chave Pública                → submeter à AGT na Declaração Modelo 8
 *
 * Uso:
 *   node scripts/gerar-chaves-agt.cjs
 *
 * Output:
 *   - Chave privada:  server/agt/chave-privada.pem
 *   - Chave pública:   server/agt/chave-publica.pem
 *   - Chave pública (Base64, formato AGT): server/agt/chave-publica-base64.txt
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '..', 'agt');

// Tamanho da chave: 2048 bits (recomendado AGT; mínimo regulatório 1024)
const KEY_SIZE = 2048;

function main() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  GERAÇÃO DE CHAVES RSA — CERTIFICAÇÃO AGT');
    console.log('  Portaria 312/18 | Decreto Executivo Anexo I');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Algoritmo: RSA-${KEY_SIZE}`);
    console.log('');

    // --- Gerar par de chaves ---
    console.log('  [1/3] A gerar par de chaves RSA...');
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: KEY_SIZE,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
    });

    // --- Criar diretório de output ---
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // --- Guardar chave privada ---
    const privPath = path.join(OUTPUT_DIR, 'chave-privada.pem');
    fs.writeFileSync(privPath, privateKey);
    console.log(`  ✅  Chave privada guardada em: ${privPath}`);

    // --- Guardar chave pública (PEM) ---
    const pubPath = path.join(OUTPUT_DIR, 'chave-publica.pem');
    fs.writeFileSync(pubPath, publicKey);
    console.log(`  ✅  Chave pública guardada em:   ${pubPath}`);

    // --- Extrair chave pública no formato Base64 (para submissão AGT) ---
    const pubKeyB64Path = path.join(OUTPUT_DIR, 'chave-publica-base64.txt');
    const pubKeyBase64 = publicKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\n/g, '')
        .trim();
    fs.writeFileSync(pubKeyB64Path, pubKeyBase64);
    console.log(`  ✅  Chave pública (Base64) em:     ${pubKeyB64Path}`);

    // --- Mostrar fingerprint SHA-256 ---
    const fingerprint = crypto.createHash('sha256').update(publicKey).digest('hex');
    console.log('');
    console.log('  Fingerprint (SHA-256):');
    console.log(`  ${fingerprint.match(/.{1,4}/g)?.join(' ') || fingerprint}`);

    // --- Resumo para registo AGT ---
    console.log('');
    console.log('───────────────────────────────────────────────────────');
    console.log('  INSTRUÇÕES PARA REGISTO NO PORTAL AGT');
    console.log('───────────────────────────────────────────────────────');
    console.log('');
    console.log('  1. Submeta a Declaração Modelo 8 no portal da AGT');
    console.log('     (https://www.agt.minfin.gov.ao)');
    console.log('');
    console.log('  2. Anexe a chave pública no formato PEM:');
    console.log(`     → ${pubPath}`);
    console.log('');
    console.log('  3. Configure no ambiente de produção:');
    console.log('');
    console.log('     AGT_PRIVATE_KEY_PEM="$(cat agt/chave-privada.pem)"');
    console.log('     AGT_CERTIFICATE_NUMBER="XXX/AGT/AAAA"');
    console.log('     AGT_KEY_VERSION="1"');
    console.log('');
    console.log('  4. O n.º de certificado (XXX/AGT/AAAA) será atribuído');
    console.log('     pela AGT após aprovação do registo.');
    console.log('');
    console.log('  ⚠️  NUNCA partilhe a chave privada!');
    console.log('     A chave privada é EXCLUSIVA do fabricante do software');
    console.log('     e deve ser mantida em segredo (HSM ou env var).');
    console.log('');
    console.log('  ⚠️  Backup obrigatório! Guarde a chave privada');
    console.log('     num local seguro. Sem ela não pode emitir faturas.');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
}

main();
