import PDM from '@ijstech/pdm';

class StorageLog extends PDM.TRecord {
    @PDM.KeyField()
    guid: string;
    @PDM.DateField()
    createDate: Date;
    @PDM.StringField({size: 96})
    cid: string;
    @PDM.StringField({field: 'parent_cid',size: 96})
    parentCid: string;
    @PDM.IntegerField()
    size: number;
    @PDM.IntegerField()
    type: number;
    @PDM.StringField({size: 512})
    source: string;
}
export default class Context extends PDM.TContext {
    @PDM.RecordSet('scom_storage_log', StorageLog)
    storageLog: PDM.TRecordSet<StorageLog>;
};