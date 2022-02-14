import * as PDM from '@ijstech/pdm';

export class Customer extends PDM.TRecord{
    @PDM.KeyField()
    guid: string;        
    @PDM.RefTo<Context>('employee', 'salesRepEmployeeGuid')
    salesRep: Promise<Employee>;
    @PDM.IntegerField()
    customerNumber: number;
    @PDM.StringField()
    customerName: string;
    @PDM.StringField()
    contactLastName: string;
    @PDM.StringField()
    contactFirstName: string;
    @PDM.StringField()
    phone: string;
    @PDM.StringField()
    addressLine1: string;
    @PDM.StringField()
    addressLine2: string;
    @PDM.StringField()
    city: string;
    @PDM.StringField()
    state: string;
    @PDM.StringField({size: 15})
    postalCode: string;
    @PDM.StringField()
    country: string;
    @PDM.DecimalField({size: 10, decimals: 2})
    creditLimit: number;
};
export class Employee extends PDM.TRecord{
    @PDM.KeyField()
    guid: string;
    @PDM.IntegerField()
    employeeNumber: number;
    @PDM.RefTo<Context>('office', 'officeGuid')
    office: Promise<Office>;
    @PDM.RefTo<Context>('employee', 'reportsToGuid')
    reportTo: Promise<Employee>
    @PDM.StringField()
    lastName: string;
    @PDM.StringField()
    firstName: string;
    @PDM.StringField()
    extension: string;
    @PDM.StringField()
    email: string;
    @PDM.StringField()
    jobTitle: string;
};
export class Office extends PDM.TRecord{
    @PDM.KeyField()
    guid: string;  
    @PDM.StringField({size: 10})
    officeCode: string;
    @PDM.StringField()
    city: string;
    @PDM.StringField()
    phone: string;
    @PDM.StringField()
    addressLine1: string;
    @PDM.StringField()
    addressLine2: string;
    @PDM.StringField()
    state: string;
    @PDM.StringField()
    country: string;
    @PDM.StringField({size: 15})
    postalCode: string;
    @PDM.StringField({size: 10})
    territory: string;
}
export class OrderDetails extends PDM.TRecord{
    @PDM.KeyField()
    guid: string;
    @PDM.RefTo<Context>('order', 'orderGuid')
    order: Promise<Order>;
    @PDM.RefTo<Context>('product', 'productGuid')
    product: Promise<Product>;
    @PDM.IntegerField()
    quantityOrdered: number;
    @PDM.DecimalField()
    priceEach: number;
    @PDM.IntegerField({size: 6})
    orderLineNumber: number;
}
export class Order extends PDM.TRecord{
    @PDM.KeyField()
    guid: string;  
    @PDM.OneToMany<OrderDetails>(OrderDetails, 'order', 'orderDetails', 'orderGuid')
    orderDetails: PDM.TRecordSet<OrderDetails>;
    @PDM.IntegerField()
    orderNumber: number;
    @PDM.RefTo<Context>('customer', 'customerGuid')
    customer: Promise<Customer>;
    @PDM.DateField()
    orderDate: Date;
    @PDM.DateField()
    requiredDate: Date;
    @PDM.DateField()
    shippedDate: Date;
    @PDM.StringField({size: 15})
    status: string;
    @PDM.StringField({dataType: 'mediumText'})
    comments: string;
}
export class Payment extends PDM.TRecord{
    @PDM.KeyField()
    guid: string;  
    @PDM.RefTo<Context>('customer', 'customerGuid')
    customer: Promise<Customer>;
    @PDM.StringField()
    checkNumber: string;
    @PDM.DateField()
    paymentDate: Date;
    @PDM.DecimalField()
    amount: number;
}
export class ProductLine extends PDM.TRecord{
    @PDM.KeyField()
    guid: string;  
    @PDM.StringField()
    productLine: string;
    @PDM.StringField({size:4000})
    textDescription: string;
    @PDM.StringField({dataType: 'text'})
    htmlDescription: string;
    @PDM.BlobField()
    image: string;
};
export class Product extends PDM.TRecord{
    @PDM.KeyField()
    guid: string;  
    @PDM.RefTo<Context>('productLine', 'productLineGuid')
    productLine: Promise<ProductLine>;
    @PDM.StringField({size: 15})
    productCode: string;
    @PDM.StringField({size: 70})
    productName: string;
    @PDM.StringField({size: 10})
    productScale: string;
    @PDM.StringField()
    productVendor: string;
    @PDM.StringField()
    productDescription: string;
    @PDM.IntegerField()
    quantityInStock: number;
    @PDM.DecimalField()
    buyPrice: number;
    @PDM.DecimalField()
    MSRP: number;
};
export class Context extends PDM.TContext {
    @PDM.RecordSet('customers', Customer)
    customer: PDM.TRecordSet<Customer>;    
    @PDM.RecordSet('employees', Employee)
    employee: PDM.TRecordSet<Employee>;
    @PDM.RecordSet('offices', Office)
    office: PDM.TRecordSet<Office>;
    @PDM.RecordSet('orders', Order)
    order: PDM.TRecordSet<Order>;
    @PDM.RecordSet('payments', Payment)
    payment: PDM.TRecordSet<Payment>;
    @PDM.RecordSet('productLines', ProductLine)
    productLine: PDM.TRecordSet<ProductLine>;
    @PDM.RecordSet('products', Product)
    product: PDM.TRecordSet<Product>;
};
export default Context;