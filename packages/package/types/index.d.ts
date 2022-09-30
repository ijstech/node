import { ICompilerResult, IPackage } from '@ijstech/tsc';
import { IStorageOptions } from '@ijstech/storage';
import { IRouterPluginMethod } from '@ijstech/types';
export { IPackage };
export interface IRoute {
    methods: IRouterPluginMethod[];
    url: string;
    module: string;
    moduleScript?: ICompilerResult;
    params?: any;
    plugins?: {
        cache?: boolean;
        db?: boolean;
    };
    dependencies?: {
        [packageName: string]: string;
    };
}
export interface IWorker {
    module: string;
    moduleScript?: ICompilerResult;
    params?: any;
    plugins?: {
        cache?: boolean;
        db?: boolean;
    };
    dependencies?: {
        [packageName: string]: string;
    };
}
export interface ISCConfig {
    src?: string;
    router?: {
        routes: IRoute[];
    };
    workers?: {
        [name: string]: IWorker;
    };
}
export declare function matchRoute(pack: IDomainRouterPackage, route: IRoute, url: string): any;
export interface IDomainRouterPackage {
    baseUrl: string;
    packagePath: string;
    options?: IDomainOptions;
}
export interface IDomainWorkerPackage {
    packagePath: string;
    options?: IDomainOptions;
}
export interface IDomainOptions {
    plugins?: {
        db?: {
            mysql?: {
                host: string;
                user: string;
                password: string;
                database: string;
            };
        };
        cache?: {
            redis?: {
                host: string;
                password?: string;
                db?: number;
            };
        };
    };
}
export declare class Package {
    private manager;
    private scripts;
    private packageConfig;
    scconfig: ISCConfig;
    private packagePath;
    constructor(manager: PackageManager, packagePath: string);
    getFileContent(filePath: string): Promise<string>;
    get name(): string;
    get path(): string;
    get version(): string;
    init(): Promise<void>;
    private fileImporter;
    getScript(fileName?: string): Promise<ICompilerResult>;
}
interface IOptions {
    storage?: IStorageOptions;
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
    private storage;
    private packagesByPath;
    private packagesByVersion;
    private packagesByName;
    private domainRouterPackages;
    packageImporter?: PackageImporter;
    constructor(options?: IOptions);
    addDomainRouter(domain: string, pack: IDomainRouterPackage): Promise<void>;
    addPackage(packagePath: string): Promise<Package>;
    getDomainRouter(ctx: {
        domain: string;
        method: string;
        url: string;
    }): Promise<{
        pack: Package;
        route: IRoute;
        options: IDomainOptions;
        params: any;
    }>;
    getFileContent(pack: Package, filePath: string): Promise<string>;
    getPackageWorker(pack: IDomainWorkerPackage, workerName: string): Promise<IWorker>;
    getScript(packageName: string, fileName?: string): Promise<IPackageScript>;
    getPackage(name: string, version?: string): Promise<Package>;
}
