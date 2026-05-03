import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

// Env vars needed before import
process.env.ATLAS_ENCRYPTION_KEY = randomBytes(32).toString('base64');
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://atlas:atlas_dev@localhost:5432/atlas';

const { encrypt, decrypt, generateDek, wrapDek, unwrapDek, isEncryptionEnabled } = await import('./crypto.js');

describe('crypto', () => {
  const dek = generateDek();

  it('isEncryptionEnabled returns true when key is set', () => {
    assert.equal(isEncryptionEnabled(), true);
  });

  describe('encrypt / decrypt', () => {
    it('round-trips a string', () => {
      const plain = 'Frodon Sacquet est un hobbit';
      const cipher = encrypt(plain, dek);
      assert.match(cipher, /^enc:v1:/);
      assert.notEqual(cipher, plain);
      assert.equal(decrypt(cipher, dek), plain);
    });

    it('round-trips an array (JSONB)', () => {
      const arr = ['Strider', 'Elessar', 'Aragorn'];
      const cipher = encrypt(arr, dek);
      assert.match(cipher, /^enc:v1:/);
      const decrypted = decrypt(cipher, dek);
      assert.deepEqual(JSON.parse(decrypted), arr);
    });

    it('round-trips an object (JSONB)', () => {
      const obj = { lat: 48.8, lng: 2.3 };
      const cipher = encrypt(obj, dek);
      const decrypted = decrypt(cipher, dek);
      assert.deepEqual(JSON.parse(decrypted), obj);
    });

    it('returns null for null input', () => {
      assert.equal(encrypt(null, dek), null);
      assert.equal(decrypt(null, dek), null);
    });

    it('returns undefined for undefined input', () => {
      assert.equal(encrypt(undefined, dek), undefined);
      assert.equal(decrypt(undefined, dek), undefined);
    });

    it('returns plaintext when dek is null', () => {
      assert.equal(encrypt('test', null), 'test');
    });

    it('returns ciphertext as-is when dek is null on decrypt', () => {
      const cipher = encrypt('test', dek);
      assert.equal(decrypt(cipher, null), cipher);
    });

    it('passes through non-encrypted strings on decrypt', () => {
      assert.equal(decrypt('just plain text', dek), 'just plain text');
    });

    it('generates different ciphertexts for the same plaintext (random IV)', () => {
      const plain = 'same text';
      const a = encrypt(plain, dek);
      const b = encrypt(plain, dek);
      assert.notEqual(a, b);
      assert.equal(decrypt(a, dek), plain);
      assert.equal(decrypt(b, dek), plain);
    });

    it('handles empty string', () => {
      const cipher = encrypt('', dek);
      assert.match(cipher, /^enc:v1:/);
      assert.equal(decrypt(cipher, dek), '');
    });

    it('handles unicode / emojis', () => {
      const plain = 'Le Seigneur des Anneaux 💍';
      assert.equal(decrypt(encrypt(plain, dek), dek), plain);
    });

    it('handles large strings', () => {
      const plain = 'x'.repeat(100_000);
      assert.equal(decrypt(encrypt(plain, dek), dek), plain);
    });
  });

  describe('wrapDek / unwrapDek', () => {
    it('round-trips a DEK', () => {
      const kek = generateDek();
      const originalDek = generateDek();
      const wrapped = wrapDek(originalDek, kek);
      assert.equal(typeof wrapped, 'string');
      const unwrapped = unwrapDek(wrapped, kek);
      assert.equal(Buffer.compare(unwrapped, originalDek), 0);
    });

    it('fails with wrong KEK', () => {
      const kek1 = generateDek();
      const kek2 = generateDek();
      const originalDek = generateDek();
      const wrapped = wrapDek(originalDek, kek1);
      assert.throws(() => unwrapDek(wrapped, kek2));
    });
  });
});
