import { StateKey, TransferState } from '@angular/platform-browser';

/**
 * Mock class for TransferState to be used in unit tests.
 * @extends {TransferState}
 */
export class TransferStateMock extends TransferState {
   /**
    * Data store.
    * @type {{ [key: string]: any }}
    */
   private data: { [key: string]: any } = {};

   /**
    * Get a value from the data store.
    * @template T
    * @param {StateKey<T>} key
    * @param {T} defaultValue
    * @returns {T}
    */
   get<T>(key: StateKey<T>, defaultValue: T): T {
      return this.data[key] || defaultValue;
   }

   /**
    * Sets a value in the data store.
    * @template T
    * @param {StateKey<T>} key
    * @param {T} value
    */
   set<T>(key: StateKey<T>, value: T): void {
      this.data[key] = value;
   }

   /**
    * Removes a value from the data store.
    * @template T
    * @param {StateKey<T>} key
    */
   remove<T>(key: StateKey<T>): void {
      delete this.data[key];
   }

   /**
    * Checks if a key is present in the data store.
    * @template T
    * @param {StateKey<T>} key
    * @returns {boolean}
    */
   hasKey<T>(key: StateKey<T>): boolean {
      return !!this.data[key];
   }

   /**
    * Noop mock for onSerialize.
    * @template T
    * @param {StateKey<T>} key
    * @param {() => T} callback
    */
   onSerialize<T>(key: StateKey<T>, callback: () => T): void {}

   /**
    * Noop mock for toJson.
    * @returns {string}
    * @memberof TransferStateMock
    */
   toJson(): string {
      return '';
   }
}
