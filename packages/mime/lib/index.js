"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_json_1 = __importDefault(require("./types.json"));
let types = {};
for (let n in types_json_1.default) {
    let a = types_json_1.default[n];
    for (let i = 0; i < a.length; i++)
        types[a[i]] = n;
}
;
function getType(path) {
    let ext = (path.split('.').pop() || '').toLowerCase();
    return types[ext];
}
;
function getExtension(type) {
    let extension = types_json_1.default[type.toLowerCase()];
    if (extension)
        return extension[0];
    else
        return '';
}
exports.default = {
    getType,
    getExtension
};
