import { ICompilerResult, IPackage } from '@ijstech/tsc';
import { Storage } from '@ijstech/storage';
import { IRouterPluginMethod } from '@ijstech/types';
export { IPackage };
export interface ISCConfig {
    src?: string;
    router?: {
        routes: {
            methods: IRouterPluginMethod[];
            url: string;
            module: string;
            moduleScript?: string;
            params?: any;
            plugins?: {
                cache?: boolean;
                db?: boolean;
            };
            dependencies?: {
                [packageName: string]: string;
            };
        }[];
    };
}
export declare class Package {
    private manager;
    private packagePath;
    private scripts;
    private packageConfig;
    scconfig: ISCConfig;
    constructor(manager: PackageManager, packagePath: string);
    private getFileContent;
    get name(): string;
    get path(): string;
    get version(): string;
    init(): Promise<void>;
    private fileImporter;
    getScript(fileName?: string): Promise<ICompilerResult>;
}
interface IOptions {
    storage?: Storage;
}
export declare type PackageImporter = (packageName: string, version?: string) => Promise<Package>;
export interface IPackageScript {
    script?: string;
    dts?: string;
    dependencies?: {
        [name: string]: IPackage;
    };
}
export declare class PackageManager {
    private options;
    private packagesByPath;
    private packagesByVersion;
    private packagesByName;
    packageImporter?: PackageImporter;
    constructor(options?: IOptions);
    addPackage(packagePath: string): Promise<Package>;
    getScript(packageName: string, fileName?: string): Promise<IPackageScript>;
    getPackage(name: string, version?: string): Promise<Package>;
}
