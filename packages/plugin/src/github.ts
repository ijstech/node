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
export async function getFile(options: {
    org: string,
    repo: string,
    filePath: string,
    token: string
}): Promise<any>{
    let result = await get(`https://api.github.com/repos/${options.org}/${options.repo}/contents/${options.filePath}`, {
        "User-Agent": 'ijstech_secure_node',
        Authorization: `token ${options.token}`,
        Accept: 'application/vnd.github.v3.raw'
    })
    return result;
}
export default {
    getFile
};