import { Employee } from './model/demo.pdm';
export declare class Demo {
    hello(): string;
    employee(employeeNumber: number): Promise<Employee>;
}
export default Demo;
