import PDM from '@ijstech/pdm';

export class StorageUploadLog extends PDM.TRecord {
    @PDM.KeyField()
    guid: string;
    @PDM.DateTimeField({field: 'upload_date'})
    uploadDate: Date;    
    @PDM.StringField({size: 512})
    source: string;
}
export class StorageUploadItem extends PDM.TRecord {
    @PDM.KeyField()
    guid: string;    
    @PDM.StringField({field: "log_guid"})
    logGuid: string;
    @PDM.StringField({field: 'parent_cid',size: 96})
    parentCid: string;
    @PDM.StringField({size: 96})
    cid: string;    
    @PDM.IntegerField()
    size: number;
    @PDM.IntegerField()
    type: number; //1: dir, 2: file
}
export class Context extends PDM.TContext {
    @PDM.RecordSet('scom_storage_upload_log', StorageUploadLog)
    uploadLog: PDM.TRecordSet<StorageUploadLog>;
    @PDM.RecordSet('scom_storage_upload_item', StorageUploadItem)
    uploadItem: PDM.TRecordSet<StorageUploadItem>;
};
export default Context;