import {Context} from 'koa';
import Fs from 'fs';
import Path from 'path';
import Url from 'url';
import {promisify} from 'util';
import Request from './request';

const Stat = promisify(Fs.stat);
const RootDir = Path.resolve(__dirname, '..');
const ApiPath = '/api/1.0/module';

function html(baseUrl: string, form?: string){
    let result = `
    <!DOCTYPE html><html>
    <head>
        <meta id="viewport-meta" name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width"/>
        <link href="${baseUrl}/assets/style/WebUI-1.2.280.css" rel="stylesheet" type="text/css">
        <link href="${baseUrl}/assets/style/default.css" rel="stylesheet" type="text/css">
        <link href="${baseUrl}/assets/libs/fontawesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"  type="text/css">
        <script src="${baseUrl}/assets/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
        <script src="${baseUrl}/assets/WebUI-1.2.281.js"></script>        
        <script>
            var module = {};
            var formData = ${form}; 
            application.api = {
                'createFormByPath': "${Path.join(baseUrl, ApiPath)}"
            };        
        	$(document).ready(function(){
        		var form = application.createForm(formData);
                form.visible = true;
        	});
        </script>
    </head>
    <body></body>
    </html>`;
    return result;
};
export function resolveFilePath(rootPaths: string[], filePath: string): string{    
    let rootPath = Path.resolve(...rootPaths);    
    let result = Path.join(rootPath, filePath);
    return result.startsWith(rootPath) ? result : undefined;
};
async function readAsset(ctx: Context, path: string){
    try{
        path = resolveFilePath([RootDir], path);
        let stat = await Stat(path);
        if (stat.isDirectory())
            return;
        ctx.set('Content-Length', stat.size.toString());
        ctx.set('Last-Modified', stat.mtime.toUTCString());
        ctx.type = Path.extname(Path.basename(path));
        ctx.body = Fs.createReadStream(path);         
    }
    catch(err){};
};
function getScript(module: any){
    if (!module.es6 && !module.script) 
        return '';

    let result = '';       
    if (module.reference){        
        for (let i = module.reference.length -1; i > -1; i --){
            let ref = module.reference[i];
            result += getScript(ref);
        }
    };
    if (module.path)
        result += `$CURR_PATH = "${module.path}";`

    result += module.es6 || module.script || '';
    if (module.path && module.path.slice(-3) == '.ts'){
        let path = module.path;        
        path = path.substring(0, path.length -3);
        result += 
        `if (module && module.exports){
            module.paths['${path.toLowerCase()}'] = module.exports;
            module.exports = null;    
        }`
    };
    return result;
};
async function getModule(config:any, moduleId?: string): Promise<any>{
    let result = await Request.post(config.host, {
        path: moduleId || config.mainForm,
        token: config.token,    
        working: true,    
        script: true,
        code: true
    });  
    if (typeof(result) == 'string')
        result = JSON.parse(result);
    return result;      
}
async function getRemoteScript(config: any, moduleId?: string): Promise<any>{
    try{
        let result = await getModule(config, moduleId);
        return {
            form: result.form,
            moduleName: result.moduleName,
            className: result.className,
            require: result.requiredModules,
            script: getScript(result)
        };
    }
    catch(err){        
        console.error(err);
        return;
    };
};
async function route(ctx: Context, options: any){
    let baseUrl = options.baseUrl;
    if (ctx.url == baseUrl){
        let module = await getModule(options, options.package);
        let pack = JSON.parse(module.code);
        let data = await getRemoteScript(options);
        ctx.body = html(options.baseUrl, JSON.stringify(data));
    }
    else if (ctx.url == Path.join(baseUrl, ApiPath)){
        let data = (<any>ctx.request).body;
        if (data && data.fileName){
            let module = await getModule(options, options.package);
            let pack = JSON.parse(module.code);
            let fileName = data.fileName.toLowerCase();
            let form: any;
            let moduleId: string;
            for (let v in pack.modules){
                let f = v.toLowerCase();                
                if (f[0] != '/')
                    f = '/' + f;
                if (f == fileName){
                    moduleId = pack.modules[v];
                    form = await getModule(options, moduleId);
                    break;
                }

            }            
            if (form){
                let result = {
                    data: {
                        file: {
                            id: moduleId
                        },
                        reference: [],
                        moduleName: form.moduleName,
                        className: form.className,
                        script: form.es6 || form.compiledScript || form.script,
                        form: form.form
                    }
                };
                ctx.body = result;
            }
        }
    }
    else{ 
        let url = Url.parse(ctx.url).pathname;
        let path = url.slice(baseUrl.length);
        await readAsset(ctx, path);
    };
};
export default route;