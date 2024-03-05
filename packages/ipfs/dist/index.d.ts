/// <reference types="node" />
declare module "types" {
    export enum CidCode {
        DAG_PB = 112,
        RAW = 85
    }
    export interface ICidData {
        cid: string;
        links?: ICidInfo[];
        name?: string;
        size: number;
        type?: 'dir' | 'file';
        code?: CidCode;
        multihash?: any;
        bytes?: Uint8Array;
    }
    export interface ICidInfo {
        cid: string;
        links?: ICidInfo[];
        name?: string;
        size: number;
        type?: 'dir' | 'file';
    }
}
declare module "utils" {
    import { ICidData, ICidInfo } from "types";
    export function parse(cid: string, bytes?: Uint8Array): ICidData;
    export interface IHashChunk {
        size: number;
        dataSize: number;
        cid: {
            toString: () => string;
        };
    }
    export function hashChunk(data: Buffer, version?: number): Promise<IHashChunk>;
    export function hashChunks(chunks: IHashChunk[] | ICidInfo[], version?: number): Promise<ICidData>;
    export function hashItems(items?: ICidInfo[], version?: number): Promise<ICidData>;
    export function hashContent(content: string | Uint8Array, version?: number): Promise<ICidData>;
    export function hashFile(file: File | Uint8Array, version?: number): Promise<ICidData>;
    export function cidToHash(cid: string): string;
}
declare module "fileManager" {
    import { ICidData, ICidInfo } from "types";
    export interface ISignature {
        pubKey: string;
        timestamp: number;
        sig: string;
    }
    export interface ISignerData {
        action: string;
        timestamp: number;
        data?: any;
    }
    export interface ISigner {
        sign(data: ISignerData, schema: object): Promise<ISignature>;
    }
    interface IFileManagerOptions {
        transport?: IFileManagerTransport;
        endpoint?: string;
        signer?: ISigner;
        rootCid?: string;
    }
    export interface IUploadEndpoints {
        [cid: string]: {
            exists?: boolean;
            url: string;
            method?: string;
            headers?: {
                [key: string]: string;
            };
        };
    }
    export type IGetUploadUrlResult = {
        success: true;
        data: IUploadEndpoints;
    };
    export interface IRootInfo {
        success: boolean;
        data: {
            cid: string;
            used: number;
            quota: number;
        };
    }
    export interface IResult {
        success: boolean;
        data?: any;
    }
    export interface IFileManagerTransport {
        applyUpdate(node: FileNode): Promise<IResult>;
        getCidInfo(cid: string): Promise<ICidInfo | undefined>;
        getRoot(): Promise<IRootInfo>;
        getUploadUrl(cidInfo: ICidInfo): Promise<IGetUploadUrlResult | undefined>;
    }
    export interface IFileManagerTransporterOptions {
        endpoint?: string;
        signer?: ISigner;
    }
    export class FileManagerHttpTransport implements IFileManagerTransport {
        private options;
        private updated;
        constructor(options?: IFileManagerTransporterOptions);
        applyUpdate(node: FileNode): Promise<IResult>;
        updateRoot(node: FileNode): Promise<IResult>;
        getCidInfo(cid: string): Promise<ICidInfo | undefined>;
        getRoot(): Promise<IRootInfo>;
        getUploadUrl(cidInfo: ICidInfo, isRoot?: boolean): Promise<IGetUploadUrlResult | undefined>;
    }
    export class FileNode {
        private _name;
        private _parent;
        protected _items: FileNode[];
        private _cidInfo;
        private _isFile;
        private _isFolder;
        private _file;
        private _fileContent;
        private _isModified;
        private _owner;
        isRoot: boolean;
        constructor(owner: FileManager, name: string, parent?: FileNode, cidInfo?: ICidData);
        get cid(): string;
        checkCid(): Promise<void>;
        get fullPath(): string;
        get isModified(): boolean;
        modified(value?: boolean): boolean;
        get name(): string;
        set name(value: string);
        get parent(): FileNode;
        set parent(value: FileNode);
        itemCount(): Promise<number>;
        items(index: number): Promise<FileNode>;
        addFile(name: string, file: File): Promise<FileNode>;
        addFileContent(name: string, content: Uint8Array | string): Promise<FileNode>;
        addItem(item: FileNode): Promise<void>;
        removeItem(item: FileNode): void;
        findItem(name: string): Promise<FileNode | undefined>;
        get cidInfo(): ICidData | undefined;
        isFile(): Promise<boolean>;
        isFolder(): Promise<boolean>;
        get file(): File | undefined;
        set file(value: File | undefined);
        get fileContent(): string | Uint8Array | undefined;
        set fileContent(value: string | Uint8Array | undefined);
        hash(): Promise<ICidData | undefined>;
    }
    export class FileManager {
        private transporter;
        private rootNode;
        private options;
        quota: number;
        used: number;
        constructor(options?: IFileManagerOptions);
        addFileTo(folder: FileNode, filePath: string, file: File | Uint8Array): Promise<FileNode>;
        addFile(filePath: string, file: File): Promise<FileNode | undefined>;
        addFileContent(filePath: string, content: Uint8Array | string): Promise<FileNode | undefined>;
        getCidInfo(cid: string): Promise<ICidInfo | undefined>;
        private updateNode;
        applyUpdates(): Promise<FileNode | undefined>;
        delete(fileNode: FileNode): void;
        getFileNode(path: string): Promise<FileNode | undefined>;
        getRootNode(): Promise<FileNode | undefined>;
        reset(): void;
        setRootCid(cid: string): Promise<FileNode | undefined>;
        move(fileNode: FileNode, newParent: FileNode): void;
    }
}
/// <amd-module name="@ijstech/ipfs" />
declare module "@ijstech/ipfs" {
    /*!-----------------------------------------------------------
    * Copyright (c) IJS Technologies. All rights reserved.
    * Released under dual AGPLv3/commercial license
    * https://ijs.network
    *-----------------------------------------------------------*/
    export { CidCode, ICidData, ICidInfo } from "types";
    export { cidToHash, hashContent, hashFile, hashItems, parse } from "utils";
    export { FileManager, FileManagerHttpTransport, IFileManagerTransport, IFileManagerTransporterOptions } from "fileManager";
}
