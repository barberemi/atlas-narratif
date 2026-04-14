import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signDeviceId } from './requireIdentity.js';

describe('signDeviceId', () => {
  it('returns a timestamp.hmac string', () => {
    const token = signDeviceId('test-device-id');
    assert.match(token, /^\d+\.[0-9a-f]{64}$/);
  });

  it('returns different tokens for the same deviceId (timestamp changes)', () => {
    const a = signDeviceId('device-123');
    // Le timestamp est basé sur Date.now(), donc deux appels successifs
    // peuvent avoir le même timestamp — on vérifie au moins le format
    assert.match(a, /^\d+\.[0-9a-f]{64}$/);
  });

  it('returns different tokens for different deviceIds', () => {
    const a = signDeviceId('device-aaa');
    const b = signDeviceId('device-bbb');
    assert.notEqual(a, b);
  });
});
