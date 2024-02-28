import { ICidData } from './types';
export declare function hashFile(file: string | Uint8Array, options?: {
    version?: number;
    chunkSize?: number;
}): Promise<ICidData>;
export declare function hashDir(dirPath: string, version?: number): Promise<ICidData>;
