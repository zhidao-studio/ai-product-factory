declare module '@ohos.security.cryptoFramework' {
  interface DataBlob {
    data: Uint8Array;
  }

  interface Random {
    generateRandomSync(length: number): DataBlob;
  }

  interface PubKey {}

  interface PriKey {}

  interface SymKey {}

  interface KeyPair {
    pubKey: PubKey;
    priKey: PriKey;
  }

  interface AsyKeyGenerator {
    convertKey(pubKey: DataBlob | null, priKey: DataBlob | null): Promise<KeyPair>;
  }

  interface SymKeyGenerator {
    convertKey(key: DataBlob): Promise<SymKey>;
  }

  type CryptoMode = number;

  interface Cipher {
    init(mode: CryptoMode, key: PubKey | PriKey | SymKey, params: null): Promise<void>;
    doFinal(data: DataBlob): Promise<DataBlob | null>;
  }

  interface CryptoFramework {
    CryptoMode: {
      ENCRYPT_MODE: CryptoMode;
      DECRYPT_MODE: CryptoMode;
    };
    createRandom(): Random;
    createSymKeyGenerator(transformation: string): SymKeyGenerator;
    createAsyKeyGenerator(transformation: string): AsyKeyGenerator;
    createCipher(transformation: string): Cipher;
  }

  const cryptoFramework: CryptoFramework;
  export default cryptoFramework;
}

type CryptoFrameworkPublicKey = import('@ohos.security.cryptoFramework').PubKey;
type CryptoFrameworkPrivateKey = import('@ohos.security.cryptoFramework').PriKey;
type CryptoFrameworkSymmetricKey = import('@ohos.security.cryptoFramework').SymKey;

declare module '@ohos.buffer' {
  interface HarmonyBuffer {
    buffer: ArrayBuffer;
    byteOffset: number;
    length: number;
    toString(encoding?: string): string;
  }

  interface BufferModule {
    from(value: string, encoding?: string): HarmonyBuffer;
    from(value: Uint8Array): HarmonyBuffer;
  }

  const buffer: BufferModule;
  export default buffer;
}

declare module '@ohos.data.preferences' {
  interface Preferences {
    get(key: string, defaultValue: string): Promise<unknown>;
    put(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
    flush(): Promise<void>;
  }

  interface DataPreferences {
    getPreferences(context: unknown, name: string): Promise<Preferences>;
  }

  const dataPreferences: DataPreferences;
  export default dataPreferences;
}
