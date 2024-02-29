import { ICidData, ICidInfo } from './types';
export interface ISignature {
    pubKey: string;
    data: any;
}
export interface ISigner {
    sign(data: any): Promise<ISignature>;
}
interface IFileManagerOptions {
    transport?: IFileManagerTransport;
    endpoint?: string;
    signer?: ISigner;
    rootCid?: string;
}
export declare type IGetUploadUrlResult = {
    [cid: string]: {
        exists?: boolean;
        url: string;
        method?: string;
        headers?: {
            [key: string]: string;
        };
    };
};
export interface IFileManagerTransport {
    applyUpdate(node: FileNode): Promise<void>;
    getCidInfo(cid: string): Promise<ICidInfo | undefined>;
    getUploadUrl(cidInfo: ICidInfo, isRoot?: boolean): Promise<IGetUploadUrlResult | undefined>;
}
export interface IFileManagerTransporterOptions {
    endpoint?: string;
    signer?: ISigner;
}
export declare class FileManagerHttpTransport implements IFileManagerTransport {
    private options;
    private updated;
    constructor(options?: IFileManagerTransporterOptions);
    applyUpdate(node: FileNode): Promise<void>;
    getCidInfo(cid: string): Promise<ICidInfo | undefined>;
    getUploadUrl(cidInfo: ICidInfo, isRoot?: boolean): Promise<IGetUploadUrlResult | undefined>;
}
export declare class FileNode {
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
export declare class FileManager {
    private transporter;
    private rootNode;
    private options;
    constructor(options?: IFileManagerOptions);
    addFileTo(folder: FileNode, filePath: string, file: File | Uint8Array): Promise<FileNode>;
    addFile(filePath: string, file: File): Promise<FileNode>;
    addFileContent(filePath: string, content: Uint8Array | string): Promise<FileNode>;
    getCidInfo(cid: string): Promise<ICidInfo | undefined>;
    private updateNode;
    applyUpdates(): Promise<FileNode>;
    delete(fileNode: FileNode): void;
    getFileNode(path: string): Promise<FileNode>;
    getRootNode(): Promise<FileNode>;
    reset(): void;
    setRootCid(cid: string): Promise<FileNode>;
    move(fileNode: FileNode, newParent: FileNode): void;
}
export {};
