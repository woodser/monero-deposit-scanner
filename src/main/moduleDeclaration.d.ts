declare module '*.gif';
declare module '*.png';

type MoneroRpcConfig = {
  uri: string,
  username?: string,
  password?: string,
  rejectUnauthorized?: boolean
}

declare module 'monero-javascript' {
  declare module LibraryUtils {
    function loadFullModule(): Promise<MoneroWalletFull>;
    function loadKeysModule(): Promise<MoneroWalletKeys>;
  }
  
  export function createWalletFull(config: {
    path?: string,
    password?: string,
    networkType?: string | number,
    mnemonic?: string,
    seedOffset?: string,
    primaryAddress?: string,
    privateViewKey?: string,
    privateSpendKey?: string,
    restoreHeight?: number,
    language?: string,
    serverUri?: string,
    serverUsername?: string,
    serverPassword?: string,
    rejectUnauthorized?: boolean,
    server?: MoneroRpcConnection | MoneroRpcConfig,
    proxyToWorker?: boolean,
    fs?: fs
  }): MoneroWalletFull
  
  declare module MoneroNetworkType {
    const MAINNET: number;
    const STAGENET: number;
    const TESTNET: number;
  }
  
  declare module MoneroWalletListener {
    
    export class MoneroWalletListener {

    }
    


  }
  
  declare module MoneroUtils {
    function validatePrivateViewKey(viewKey: string): void;
    function isValidAddress(address: string, networkType: MoneroNetworkType): boolean;
  }
  

  
  declare class MoneroWalletFull{
    async addListener(listener: MoneroWalletListener): Promise<void>;
    async startSyncing(): Promise<void>;
  }
 
  //function BigInteger(n: number): Uint8Array;
  
  declare class BigInteger {
    BigInteger(): Uint8Array;
    BigInteger(n: number): Uint8Array;
  }
  
  
  module.exports = MoneroWalletFull;
}

declare module 'jsbn';