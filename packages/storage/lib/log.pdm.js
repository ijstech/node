"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = exports.StorageUploadItem = exports.StorageUploadLog = void 0;
const pdm_1 = __importDefault(require("@ijstech/pdm"));
class StorageUploadLog extends pdm_1.default.TRecord {
}
exports.StorageUploadLog = StorageUploadLog;
__decorate([
    pdm_1.default.KeyField()
], StorageUploadLog.prototype, "guid", void 0);
__decorate([
    pdm_1.default.DateTimeField({ field: 'upload_date' })
], StorageUploadLog.prototype, "uploadDate", void 0);
__decorate([
    pdm_1.default.StringField({ size: 512 })
], StorageUploadLog.prototype, "source", void 0);
__decorate([
    pdm_1.default.IntegerField()
], StorageUploadLog.prototype, "size", void 0);
class StorageUploadItem extends pdm_1.default.TRecord {
}
exports.StorageUploadItem = StorageUploadItem;
__decorate([
    pdm_1.default.KeyField()
], StorageUploadItem.prototype, "guid", void 0);
__decorate([
    pdm_1.default.StringField({ field: "log_guid" })
], StorageUploadItem.prototype, "logGuid", void 0);
__decorate([
    pdm_1.default.StringField({ field: 'parent_cid', size: 96 })
], StorageUploadItem.prototype, "parentCid", void 0);
__decorate([
    pdm_1.default.StringField({ size: 96 })
], StorageUploadItem.prototype, "cid", void 0);
__decorate([
    pdm_1.default.IntegerField()
], StorageUploadItem.prototype, "size", void 0);
__decorate([
    pdm_1.default.IntegerField()
], StorageUploadItem.prototype, "type", void 0);
class Context extends pdm_1.default.TContext {
}
exports.Context = Context;
__decorate([
    pdm_1.default.RecordSet('scom_storage_upload_log', StorageUploadLog)
], Context.prototype, "uploadLog", void 0);
__decorate([
    pdm_1.default.RecordSet('scom_storage_upload_item', StorageUploadItem)
], Context.prototype, "uploadItem", void 0);
;
exports.default = Context;
