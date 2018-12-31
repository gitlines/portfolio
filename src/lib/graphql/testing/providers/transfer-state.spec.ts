import { makeStateKey } from '@angular/platform-browser';
import { TransferStateMock } from './transfer-state';

describe('GraphQl TransferStateMock', () => {
   it('should store keys', () => {
      const testTransfer = new TransferStateMock();
      const key = makeStateKey('key');
      const value = {};

      expect(testTransfer.hasKey(key)).toBeFalsy();
      expect(testTransfer.get(key, 'default')).toBe('default');
      testTransfer.set(key, value);
      expect(testTransfer.hasKey(key)).toBeTruthy();
      expect(testTransfer.get(key, 'default')).toBe(value);
      testTransfer.remove(key);
      expect(testTransfer.hasKey(key)).toBeFalsy();
      testTransfer.onSerialize(key, () => {});
      expect(testTransfer.toJson()).toBe('');
   });
});
