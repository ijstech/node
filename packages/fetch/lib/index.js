"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugin = exports.Fetch = void 0;
exports.Fetch = {
    async get(url, data) {
        let result = await fetch(url, data);
        return {
            status: result.status,
            body: await result.text()
        };
    },
    async post(url, data) {
        if (data?.body && typeof (data.body) == 'object') {
            if (!data.headers || !data.headers['content-type']) {
                data.headers = data.headers || {};
                data.headers['content-type'] = 'application/json';
            }
            ;
            data.body = JSON.stringify(data.body);
        }
        ;
        let result = await fetch(url, {
            method: 'POST',
            headers: data ? data.headers : null,
            body: data ? data.body : null
        });
        return {
            status: result.status,
            body: await result.text()
        };
    }
};
const FetchPluginObject = {
    async get(url, data) {
        let result = await fetch(url, data);
        return JSON.stringify({
            status: result.status,
            body: await result.text()
        });
    },
    async post(url, data) {
        if (data?.body && typeof (data.body) != 'string')
            data.body = JSON.stringify(data.body);
        let result = await fetch(url, {
            method: 'POST',
            headers: data ? data.headers : null,
            body: data ? data.body : null
        });
        return JSON.stringify({
            status: result.status,
            body: await result.text()
        });
    }
};
function getPlugin() {
    return global.$$fetch_plugin;
}
exports.default = getPlugin();
function loadPlugin(worker, options) {
    if (worker.vm) {
        worker.vm.injectGlobalObject('$$fetch_plugin', FetchPluginObject);
        return '';
    }
    else
        global['$$fetch_plugin'] = exports.Fetch;
}
exports.loadPlugin = loadPlugin;
;
