/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/

import Https from 'https';
import Http from 'http';
import Url from 'url';
export function post(urlString: string, data: any, headers?: any): Promise<any>{
    return request('POST', urlString, data, headers)
}
export function get(urlString: string, headers?: any): Promise<any>{
    return request('GET', urlString, undefined, headers)
}
export function request(method: string, urlString: string, data: any, headers?: any): Promise<any>{    
    return new Promise(function(resolve, reject){        
        let url = Url.parse(urlString);
        headers = headers || {};
        if (typeof(data) != 'undefined'){
            if (typeof(data) != 'string'){
                data = JSON.stringify(data);
                if (!headers['Content-Type'])
                    headers['Content-Type'] = 'application/json';
            }
            headers['Content-Length'] = data.length;
        }                
        let options = {
            hostname: url.hostname,
            path: url.path,
            method: method,
            headers: headers
        };
        function callback(res: any){  
            let data = '';
            let contentType = res.headers['content-type'];            
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', ()=>{
                if (contentType && contentType.indexOf('json'))                
                    resolve(JSON.parse(data))
                else
                    resolve(data)
            })
        }
        let req: Http.ClientRequest;     
        if (url.protocol == 'https:')
            req = Https.request(options, callback)
        else
            req = Http.request(options, callback);
        
        req.on('error', (err)=>{
            reject(err);
        })
        req.write(data || '');
        req.end();
    })
};
export default {
    get,
    post
};