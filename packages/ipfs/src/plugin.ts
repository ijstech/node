/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
///<amd-module name="@ijstech/ipfs"/>
export { CidCode, ICidData, ICidInfo} from './types';
export { cidToHash, hashContent, hashFile, hashItems, parse} from './utils';
export { FileManager, FileManagerHttpTransport, IFileManagerTransport, IFileManagerTransporterOptions} from './fileManager';