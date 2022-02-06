import { Context } from 'koa';
export declare function resolveFilePath(rootPaths: string[], filePath: string): string;
declare function route(ctx: Context, options: any): Promise<void>;
export default route;
