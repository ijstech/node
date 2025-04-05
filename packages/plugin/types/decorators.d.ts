import { ITaskOptions, IStepConfig } from '@ijstech/types';
export declare function step(config?: IStepConfig): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function task(options: ITaskOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
