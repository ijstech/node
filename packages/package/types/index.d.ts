import { ICompilerResult, IPackage } from '@ijstech/tsc';
import { IStorageOptions } from '@ijstech/storage';
import { IRouterPluginMethod, IDomainOptions } from '@ijstech/types';
export { IPackage };
export interface IRoute {
    methods: IRouterPluginMethod[];
    url: string;
    module: string;
    moduleScript?: ICompilerResult;
    params?: any;
    worker?: string;
    plugins?: {
        cache?: boolean;
        db?: boolean;
        wallet?: boolean;
        fetch?: boolean;
    };
    dependencies?: string[];
}
export interface IWorker {
    module: string;
    moduleScript?: ICompilerResult;
    params?: any;
    worker?: string;
    plugins?: {
        cache?: boolean;
        db?: boolean;
        wallet?: boolean;
        fetch?: boolean;
    };
    dependencies?: string[];
}
export interface ISCConfig {
    src?: string;
    type?: string;
    scheduler?: {
        schedules: [
            {
                id: string;
                worker: string;
            }
        ];
    };
    router?: {
        routes: IRoute[];
    };
    workers?: {
        [name: string]: IWorker;
    };
}
export declare function matchRoute(pack: IDomainRouterPackage, route: IRoute, url: string): any;
export interface IDomainRouterPackage {
    id?: string;
    baseUrl: string;
    packagePath: string;
    params?: any;
    options?: IDomainOptions;
}
export interface IDomainWorkerPackage {
    packagePath: string;
    options?: IDomainOptions;
}
export declare class Package {
    private manager;
    private scripts;
    private packageConfig;
    private packageName;
    private packageVersion;
    scconfig: ISCConfig;
    private packagePath;
    constructor(manager: PackageManager, packagePath: string, options?: {
        name?: string;
        version?: string;
    });
    getFileContent(filePath: string): Promise<string>;
    getSourceContent(filePath: string): Promise<{
        fileName: string;
        content: string;
    }>;
    get name(): string;
    get path(): string;
    get version(): string;
    init(): Promise<void>;
    private fileImporter;
    getScript(fileName?: string): Promise<ICompilerResult>;
}
export interface IPackageOptions {
    storage?: IStorageOptions;
    packages?: IPackages;
}
export declare type PackageImporter = (packageName: string, version?: string) => Promise<Package>;
export interface IPackageScript {
    errors?: any[];
    script?: string;
    dts?: string;
    dependencies?: {
        [name: string]: IPackage;
    };
}
export interface IPackages {
    [name: string]: {
        version?: string;
        path: string;
    }[];
}
export declare class PackageManager {
    private options;
    private storage;
    private packagesByPath;
    private packagesByVersion;
    private packagesByName;
    private domainRouterPackages;
    private packages;
    packageImporter?: PackageImporter;
    constructor(options?: IPackageOptions);
    addDomainRouter(domain: string, pack: IDomainRouterPackage): Promise<void>;
    addPackage(packagePath: string, packageOptions?: {
        name?: string;
        version?: string;
    }): Promise<Package>;
    getDomainRouter(ctx: {
        domain: string;
        method: string;
        url: string;
    }): Promise<{
        id: string;
        pack: Package;
        route: IRoute;
        options: IDomainOptions;
        params: any;
    }>;
    getFileContent(packagePath: string, filePath: string): Promise<string>;
    getPackageWorker(pack: IDomainWorkerPackage, workerName: string): Promise<IWorker>;
    getScript(packageName: string, fileName?: string): Promise<IPackageScript>;
    getPackage(name: string, version?: string): Promise<Package>;
    register(packages: IPackages): Promise<void>;
}
