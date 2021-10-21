declare module '*.gif' {
  export default "" as string; 
}
declare module '*.png'{
  export default "" as string; 
}

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
  
  export function connectToDaemonRpc(uriOrConfigOrConnection: MoneroRpcConnection): MoneroDaemonRpc;
  
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
  
  declare class MoneroTxWallet {
    getReceivedTimestamp(): number;
    getFee(): BigInteger;
    getIncomingAmount(): BigInteger;
    getHeight(): number;
    getHash(): string;
    isConfirmed(): boolean;
  }
  
  declare class MoneroRpcConnection {
    constructor(uriOrConfigOrConnection);
  }
  
  declare class MoneroDaemonRpc {
    async getBlockHeaderByHeight(height: number): Promise<MoneroBlockHeader>;
    async getRpcConnection(): Promise<MoneroRpcConnection>;
    async getHeight(): Promise<number>;
  }
  
  declare class MoneroBlockHeader {
    getTimestamp(): number;
  }
  
  declare module MoneroUtils {
    function validatePrivateViewKey(viewKey: string): void;
    function isValidAddress(address: string, networkType: MoneroNetworkType): boolean;
  }
  

  
  declare class MoneroWalletFull{
    async addListener(listener: MoneroWalletListener): Promise<void>;
    async sync(listener: any, startHeight: any, allowConcurrentCalls: bool): Promise<any>;
    async startSyncing(syncPeriod: any): Promise<void>;
    async isSynced(): Promise<bool>;
    async getHeightByDate(year: number, month: number, day: number): Promise<number>;
    async getTx(hash: string): Promise<MoneroTxWallet>;
    async getTxs(query: any): Promise<MoneroTxWallet[]>;
    async getPrivateViewKey(): Promise<string>;
    async getAddress(accountIdx: int, subaddressIdx: int): Promise<string>;
    
  }
  
  declare class MoneroWalletListener {
    
  }
  
  declare class MoneroOutputWallet {
    getTx(): MoneroTxWallet;
  }
 
  //function BigInteger(n: number): Uint8Array;
  
  declare class BigInteger {
    BigInteger(): Uint8Array;
    BigInteger(n: number): Uint8Array;
  }
  
  
  module.exports = MoneroWalletFull;
}

declare module 'jsbn';