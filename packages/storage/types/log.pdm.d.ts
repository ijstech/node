import PDM from '@ijstech/pdm';
export declare class StorageUploadLog extends PDM.TRecord {
    guid: string;
    uploadDate: Date;
    source: string;
}
export declare class StorageUploadItem extends PDM.TRecord {
    guid: string;
    logGuid: string;
    parentCid: string;
    cid: string;
    size: number;
    type: number;
}
export declare class Context extends PDM.TContext {
    uploadLog: PDM.TRecordSet<StorageUploadLog>;
    uploadItem: PDM.TRecordSet<StorageUploadItem>;
}
export default Context;
