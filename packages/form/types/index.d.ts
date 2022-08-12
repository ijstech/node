/*!-----------------------------------------------------------
* Copyright (c) IJS Technologies. All rights reserved.
* Released under dual AGPLv3/commercial license
* https://ijs.network
*-----------------------------------------------------------*/
import { Context } from 'koa';
export declare function resolveFilePath(rootPaths: string[], filePath: string): string;
declare function route(ctx: Context, options: any): Promise<void>;
export default route;
