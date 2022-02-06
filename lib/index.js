"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IWorkerPlugin = exports.IRouterPlugin = exports.AppServer = void 0;
var app_1 = require("@ijstech/app");
Object.defineProperty(exports, "AppServer", { enumerable: true, get: function () { return app_1.AppServer; } });
var types_1 = require("@ijstech/types");
Object.defineProperty(exports, "IRouterPlugin", { enumerable: true, get: function () { return types_1.IRouterPlugin; } });
Object.defineProperty(exports, "IWorkerPlugin", { enumerable: true, get: function () { return types_1.IWorkerPlugin; } });
