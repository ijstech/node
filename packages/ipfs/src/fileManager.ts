/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual BSL 1.1/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { hashFile, hashContent, hashItems, parse } from './utils';
import { ICidData, ICidInfo, CidCode} from './types';


export interface ISignature{
    pubKey: string;
    timestamp: number;
    sig: string;
};
export interface ISignerData {
    action: string;
    timestamp: number;
    data?: any;
};
export interface ISigner {
    sign(data: ISignerData, schema: object): Promise<ISignature>;
};
interface IFileManagerOptions {
    transport?: IFileManagerTransport;
    endpoint?: string;
    signer?: ISigner;
    rootCid?: string;
};
export interface IUploadEndpoints {
    [cid: string]: {
        exists?: boolean,
        url: string,method?: string,
        headers?: {[key: string]: string}
    }
};
export type IGetUploadUrlResult = {
    success: true,
    data: IUploadEndpoints    
};
export interface IRootInfo{
    success: boolean;
    data: {
        cid: string;
        used: number;
        quota: number;
    };    
};
export interface IResult{
    success: boolean;
    data?: any;
};
export interface IFileManagerTransport {
    applyUpdate(node: FileNode): Promise<IResult>;
    getCidInfo(cid: string): Promise<ICidInfo | undefined>;
    getRoot(): Promise<IRootInfo>;
    getUploadUrl(cidInfo: ICidInfo): Promise<IGetUploadUrlResult | undefined>;
};

export interface IFileManagerTransporterOptions {
    endpoint?: string;
    signer?: ISigner;
};
export class FileManagerHttpTransport implements IFileManagerTransport {
    private options: IFileManagerTransporterOptions;
    private updated: {[key: string]: boolean} = {};
    constructor(options?: IFileManagerTransporterOptions){
        this.options = options || {};
        this.options.endpoint = this.options.endpoint || '';
    };
    async applyUpdate(node: FileNode): Promise<IResult>{
        let cidInfo = node.cidInfo;
        if (cidInfo && !this.updated[cidInfo.cid]){
            let result = await this.getUploadUrl(cidInfo, node.isRoot);
            let endpoints = result?.data;
            if (await node.isFolder()){
                let url = endpoints?.[cidInfo.cid];
                if (!url?.exists && cidInfo.bytes && url?.url){
                    let method = url?.method || 'PUT';
                    let headers = url?.headers || {};
                    headers['Content-Type'] = headers['Content-Type'] || 'application/octet-stream';
                    headers['Content-Length'] = cidInfo.bytes.length.toString();

                    let res = await fetch(url.url, {
                        method: method,
                        headers: headers,
                        body: cidInfo.bytes
                    });
                    if (!res.ok)
                        throw new Error(res.statusText); 
                };
            }
            else if (cidInfo.links?.length && cidInfo.links?.length > 0){
                let offset = 0;
                for (let link of cidInfo.links){
                    let url = endpoints?.[link.cid];
                    if (url?.url && !url?.exists){
                        let method = url?.method || 'PUT';
                        let headers = url?.headers || {};
                        headers['Content-Type'] = headers['Content-Type'] || 'application/octet-stream';    
                        headers['Content-Length'] = link.size.toString();
                        let body: any;
                        if (node.fileContent)
                            body = node.fileContent?.slice(offset, offset + link.size)
                        else if (node.file){
                            let chunk = node.file.slice(offset, offset + link.size);
                            body = chunk;
                        };
                        offset += link.size;
                        let res = await fetch(url.url, {
                            method: method,
                            headers: headers,
                            body: body
                        });
                        if (!res.ok)
                            throw new Error(res.statusText);
                    };
                };
                if (cidInfo.bytes){
                    let url = endpoints?.[cidInfo.cid];
                    if (url?.url && !url?.exists){
                        let method = url?.method || 'PUT';
                        let headers = url?.headers || {};
                        headers['Content-Type'] = headers['Content-Type'] || 'application/octet-stream';
                        headers['Content-Length'] = cidInfo.bytes.length.toString();
                        let res = await fetch(url.url, {
                            method: method,
                            headers: headers,
                            body: cidInfo.bytes
                        });
                        if (!res.ok)
                            throw new Error(res.statusText);  
                    }; 
                };
            }
            else if (endpoints?.[cidInfo.cid]){
                let url = endpoints[cidInfo.cid];
                if (!url?.exists){
                    let method = url?.method || 'PUT';
                    let headers = url?.headers || {};
                    headers['Content-Type'] = headers['Content-Type'] || 'application/octet-stream';
                    headers['Content-Length'] = cidInfo.size.toString();
                    let body: any;
                    if (node.fileContent)
                        body = node.fileContent
                    else if (node.file){
                        body = node.file
                    };
                    let res = await fetch(url.url, {
                        method: method,
                        headers: headers,
                        body: body
                    });
                    if (!res.ok)
                        throw new Error(res.statusText);
                };
            };
            this.updated[cidInfo.cid] = true;
        };
        if (node.isRoot){
            return this.updateRoot(node);
        };   
        return {
            success: true
        };
    };
    async updateRoot(node: FileNode): Promise<IResult>{
        let signature: ISignature|undefined;
        if (this.options.signer){
            signature = await this.options.signer.sign({
                action: 'UPDATE_ROOT',
                timestamp: new Date().getTime(),
                data: {
                    cid: node.cid
                }
            }, {
                action: 'string',
                timestamp: 'number',
                data: 'object'
            });
        };
        let result = await fetch(`${this.options.endpoint}/api/ipfs/v0`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'UPDATE_ROOT',
                signature: signature,
                data: {
                    cid: node.cid
                }
            })
        });  
        return await result.json();
    };
    async getCidInfo(cid: string): Promise<ICidInfo | undefined> {
        let cidInfo = parse(cid);
        if (cidInfo.code == CidCode.DAG_PB){
            let data = await fetch(`${this.options.endpoint}/stat/${cid}`);
            if (data.status == 200){
                return await data.json();
            }
        }
        else
            return cidInfo;
    };
    async getRoot(): Promise<IRootInfo>{
        let signature: ISignature|undefined;
        if (this.options.signer)
            signature = await this.options.signer.sign({
                action: 'GET_ROOT',
                timestamp: new Date().getTime()
            }, {
                action: 'string',
                timestamp: 'number'
            });
        let result = await fetch(`${this.options.endpoint}/api/ipfs/v0`, {
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'GET_ROOT',
                    signature: signature
                })
        });
        return await result.json();
    };
    async getUploadUrl(cidInfo: ICidInfo, isRoot?: boolean): Promise<IGetUploadUrlResult | undefined> {
        let req: ICidInfo = {
            cid: cidInfo.cid,
            name: cidInfo.name,
            size: cidInfo.size,
            type: cidInfo.type,
            links: []
        };
        let signature: ISignature;        
        if (cidInfo.links){
            for (let link of cidInfo.links){
                req.links?.push({
                    cid: link.cid,
                    name: link.name,
                    size: link.size
                });
            };
        };
        if (this.options.signer){
            let timestamp = new Date().getTime();
            signature = await this.options.signer.sign({
                action: 'GET_UPLOAD_URL',
                timestamp: timestamp,
                data: req
            }, {
                action: 'string',
                timestamp: 'number',
                data: 'object'
            });
            let result = await fetch(`${this.options.endpoint}/api/ipfs/v0`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'GET_UPLOAD_URL',
                    signature: signature,
                    data: req
                })
            });
            return await result.json();
        }
        else{
            let result = await fetch(`${this.options.endpoint}/api/ipfs/v0`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: req
                })
            });
            return await result.json();
        }        
    };
};
export class FileNode {
    private _name: string;
    private _parent: FileNode;
    protected _items: FileNode[];
    private _cidInfo: ICidData | undefined;
    private _isFile: boolean;
    private _isFolder: boolean;
    private _file: File | undefined;
    private _fileContent: string | Uint8Array | undefined;
    private _isModified: boolean;
    private _owner: FileManager;
    public isRoot: boolean;
    constructor(owner: FileManager, name: string, parent?: FileNode, cidInfo?: ICidData){
        this._owner = owner;
        this._name = name;
        if (parent){
            this._parent = parent;
            if (!cidInfo)
                this._parent.addItem(this);
        };
        this._items = [];
        this._cidInfo = cidInfo;
        this._isFile = cidInfo?.type=='file' || false;
        this._isFolder = cidInfo?.type=='dir' || true;

        if (this._cidInfo?.type == 'dir'){
            this._cidInfo.links?.forEach(link => {
                this._items.push(new FileNode(this._owner, link.name || '', this, link));
            });
        };
    };
    get cid(): string{
        return this._cidInfo?.cid || '';
    };
    async checkCid(): Promise<void>{
        if (this._cidInfo && this._cidInfo.type == undefined){
            this._cidInfo = await this._owner.getCidInfo(this._cidInfo.cid);
            if (this._cidInfo?.type == 'dir'){
                this._isFolder = true;
                this._isFile = false;
                this._items = [];
                if (this._cidInfo.links){
                    for (let i = 0; i < this._cidInfo.links.length; i++){
                        let link = this._cidInfo.links[i];
                        if (link?.name){
                            let node = new FileNode(this._owner, link.name, this, link);
                            this._items.push(node);
                        };
                    };
                };
            }
            else{
                this._isFolder = false;
                this._isFile = true;
            }
        };
    };
    get fullPath(): string{
        let path = this._name;
        let parent = this._parent;
        while (parent){
            path = parent.name + '/' + path;
            parent = parent.parent;
        };
        return path;
    };
    get isModified(): boolean {
        return this._isModified;
    };
    modified(value?: boolean){
        if (value === false)
            return this._isModified = false;

        this._isModified = true;
        this._cidInfo = undefined;
        if (this._parent)
            this._parent.modified();
    };
    get name(): string {
        return this._name;
    };
    set name(value: string) {
        if (this._name != value){
            this._name = value;
            this.modified();
        };
    };
    get parent(): FileNode {
        return this._parent;
    };
    set parent(value: FileNode) {
        if (this._parent != value){
            if (this._parent){
                let idx = this._parent._items.indexOf(this);
                if (idx >= 0){
                    this._parent._items.splice(idx, 1);
                    this._parent.modified();
                };
            };      
            this._parent = value;  
            this._parent._items.push(this);
            this.modified();
        };
    };
    async itemCount(): Promise<number> {
        await this.checkCid()
        return this._items.length;
    };
    async items(index: number): Promise<FileNode>{
        await this.checkCid();
        let item = this._items[index]; 
        return item;
    };
    async addFile(name: string, file: File): Promise<FileNode>{
        await this.checkCid();
        return this._owner.addFileTo(this, name, file);
    };
    async addFileContent(name: string, content: Uint8Array | string): Promise<FileNode>{
        await this.checkCid();
        if (typeof(content) == 'string')
            content = new TextEncoder().encode(content);
        return this._owner.addFileTo(this, name, content);
    };
    async addItem(item: FileNode){
        if (this._items.indexOf(item) < 0){
            this._items.push(item);
            this.modified();
        };
    };
    removeItem(item: FileNode){
        let idx = this._items.indexOf(item);
        if (idx >= 0){
            this._items.splice(idx, 1);
            this.modified();
        };
    };
    async findItem(name: string): Promise<FileNode | undefined>{
        let item = this._items.find(item => item.name == name);
        return item;
    };
    get cidInfo(): ICidData | undefined {
        return this._cidInfo;
    };
    async isFile(): Promise<boolean> {
        await this.checkCid();
        return this._isFile;
    };
    async isFolder(): Promise<boolean> {
        await this.checkCid();
        return this._isFolder;
    };
    get file(): File | undefined {
        return this._file;
    };
    set file(value: File | undefined) {
        this._isFile = true;
        this._isFolder = false;
        this._file = value;
        this._fileContent = undefined;
        this.modified();
    };
    get fileContent(): string | Uint8Array | undefined{ 
        return this._fileContent;
    };
    set fileContent(value: string | Uint8Array | undefined) {
        this._isFile = true;
        this._isFolder = false;
        this._file = undefined;
        this._fileContent = value;
        this.modified();
    };
    async hash(): Promise<ICidData | undefined>{
        if (!this._cidInfo){
            if (this._isFile){
                if (this._fileContent)
                    this._cidInfo = await hashContent(this._fileContent)
                else if (this._file)
                    this._cidInfo = await hashFile(this._file);
            }
            else if (this._isFolder){
                let items: ICidInfo[] = [];
                for (let i = 0; i < this._items.length; i++){
                    let item = this._items[i];
                    let cidInfo = await item.hash();
                    if (cidInfo){
                        cidInfo.name = item.name;
                        items.push(cidInfo);
                    }
                };
                this._cidInfo = await hashItems(items);
            };
        };
        return this._cidInfo;
    };
};
export class FileManager {
    private transporter: IFileManagerTransport;
    private rootNode: FileNode | undefined;
    private options: IFileManagerOptions;
    public quota: number;
    public used: number;
    constructor(options?: IFileManagerOptions) {
        this.options = options || {};
        if (this.options?.transport)
            this.transporter = this.options.transport
        else
            this.transporter = new FileManagerHttpTransport(this.options);
    };
    async addFileTo(folder: FileNode, filePath: string, file: File | Uint8Array): Promise<FileNode>{
        if (filePath.startsWith('/'))
            filePath = filePath.substr(1);
        let paths = filePath.split('/');
        let node = folder;
        for (let path of paths){
            let item = await folder.findItem(path);
            if (!item)
                item = new FileNode(this, path, node)
            else
                await item.checkCid();
            node = item;
        };
        if (file instanceof Uint8Array) {
            node.fileContent = file;
        }
        else {
            node.file = file;            
        };
        return node;
    };
    async addFile(filePath: string, file: File): Promise<FileNode | undefined>{
        if (!filePath.startsWith('/'))
            filePath = '/' + filePath;
        let fileNode = await this.getFileNode(filePath);        
        if (fileNode){
            fileNode.file = file;      
            return fileNode;
        }
    };
    async addFileContent(filePath: string, content: Uint8Array | string): Promise<FileNode | undefined>{
        if (!filePath.startsWith('/'))
            filePath = '/' + filePath;
        let fileNode = await this.getFileNode(filePath);
        if (fileNode){
            if (typeof(content) == 'string')
                fileNode.fileContent = new TextEncoder().encode(content);
            else
                fileNode.fileContent = content;
            return fileNode;
        };        
    };
    async getCidInfo(cid: string): Promise<ICidInfo | undefined> {
        return await this.transporter?.getCidInfo(cid);
    };
    private async updateNode(fileNode: FileNode): Promise<void>{
        if (fileNode.isModified){
            await fileNode.hash();
            if (await fileNode.isFolder()){
                let count = await fileNode.itemCount();
                for (let i = 0; i < count; i++){
                    let item = await fileNode.items(i);
                    await this.updateNode(item);
                };
            };
            await this.transporter.applyUpdate(fileNode);
            fileNode.modified(false);
        };
    };
    async applyUpdates(): Promise<FileNode | undefined>{
        if (this.rootNode){
            await this.updateNode(this.rootNode);
            return this.rootNode;
        };        
    };
    delete(fileNode: FileNode){
        if (fileNode.parent)
            fileNode.parent.removeItem(fileNode);
    };
    async getFileNode(path: string): Promise<FileNode | undefined> {
        if (!path.startsWith('/'))
            path = '/' + path;
        let paths = path.split('/');
        let node = await this.getRootNode();
        for (let i = 1; i < paths.length; i++) {
            let path = paths[i];
            if (node){
                let item = await node.findItem(path);
                if (!item) {
                    item = new FileNode(this, path, node);
                }
                else
                    await item.checkCid();
                node = item;
            }
            else
                break;   
        };
        return node;
    };
    async getRootNode(): Promise<FileNode | undefined> {
        if (!this.rootNode){
            if (this.options.rootCid)
                this.rootNode = await this.setRootCid(this.options.rootCid);
            else{
                let result = await this.transporter.getRoot();
                let data = result.data;
                if (data.cid)
                    this.rootNode = await this.setRootCid(data.cid)
                else
                    this.rootNode = new FileNode(this, '/', undefined, );
                this.quota = data.quota;
                this.used = data.used;
            };
            if (this.rootNode)
                this.rootNode.isRoot = true;
        };
        return this.rootNode;        
    };
    reset() {
        this.rootNode = undefined;
    };
    async setRootCid(cid: string): Promise<FileNode | undefined>{      
        this.options.rootCid = cid;  
        let cidInfo = await this.transporter.getCidInfo(cid);
        if (cidInfo){
            this.rootNode = new FileNode(this, '/', undefined, cidInfo);
            this.rootNode.isRoot = true;
            await this.rootNode.checkCid();
            return this.rootNode;
        }
        else
            this.options.rootCid = undefined;
    };
    move(fileNode: FileNode, newParent: FileNode){
        if (fileNode.parent)
            fileNode.parent.removeItem(fileNode);
        fileNode.parent = newParent;
    };
};