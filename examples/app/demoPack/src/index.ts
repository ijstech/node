import * as Hello from './hello';
import {Employee, Context} from './model/demo.pdm';

export class Demo{
    hello(): string{
        return Hello.hello();
    }
    async employee(employeeNumber: number): Promise<Employee>{
        let context = new Context();
        context.employee.query.where('employeeNumber','=',employeeNumber);
        let records = await context.employee.fetch();        
        let emp = records[0]        
        return records[0];
    }
}
export default Demo;