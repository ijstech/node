"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IWorkerPlugin = exports.IRouterPlugin = exports.AppServer = void 0;
var app_1 = require("@ijstech/app");
Object.defineProperty(exports, "AppServer", { enumerable: true, get: function () { return app_1.AppServer; } });
var plugin_1 = require("@ijstech/plugin");
Object.defineProperty(exports, "IRouterPlugin", { enumerable: true, get: function () { return plugin_1.IRouterPlugin; } });
Object.defineProperty(exports, "IWorkerPlugin", { enumerable: true, get: function () { return plugin_1.IWorkerPlugin; } });
