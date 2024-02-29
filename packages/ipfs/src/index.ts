/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
export { CidCode, ICidData, ICidInfo} from './types';
// export { CidCode, ICidData, ICidInfo};
export { cidToHash, hashChunks, hashContent, hashItems, parse} from './utils';
export { hashDir, hashFile } from './node';
export { FileManager, FileManagerHttpTransport, IFileManagerTransport, IFileManagerTransporterOptions, ISignature, ISigner} from './fileManager';