import { ICompilerResult, IPackage } from '@ijstech/tsc';
import { Storage } from '@ijstech/storage';
import { IRouterPluginMethod } from '@ijstech/types';
export { IPackage };
export interface IRoute {
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
}
export interface ISCConfig {
    src?: string;
    router?: {
        routes: IRoute[];
    };
}
export declare function matchRoute(pack: IDomainRouter, route: IRoute, url: string): any;
export interface IDomainRouter {
    baseUrl: string;
    packagePath: string;
    options?: IDomainOptions;
}
export interface IDomainWorker {
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
    private domainRouters;
    private domainWorkers;
    packageImporter?: PackageImporter;
    constructor(options?: IOptions);
    addDomainRouter(domain: string, router: IDomainRouter): Promise<void>;
    addDomainWorker(domain: string, worker: IDomainWorker): Promise<void>;
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
    getScript(packageName: string, fileName?: string): Promise<IPackageScript>;
    getPackage(name: string, version?: string): Promise<Package>;
}
