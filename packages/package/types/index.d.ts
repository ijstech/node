import { ICompilerResult, IPackage } from '@ijstech/tsc';
import { Storage } from '@ijstech/storage';
export { IPackage };
export declare class Package {
    private manager;
    private packagePath;
    private scripts;
    private packageConfig;
    private scconfig;
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
export declare type PackageImporter = (packageName: string, version?: string) => Promise<IPackage>;
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
    addPackage(pack: string | IPackage): Promise<IPackage>;
    getScript(packageName: string, fileName?: string): Promise<IPackageScript>;
    getPackage(name: string, version?: string): Promise<IPackage>;
}
