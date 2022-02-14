import * as PDM from '@ijstech/pdm';
export declare class Customer extends PDM.TRecord {
    guid: string;
    salesRep: Promise<Employee>;
    customerNumber: number;
    customerName: string;
    contactLastName: string;
    contactFirstName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    creditLimit: number;
}
export declare class Employee extends PDM.TRecord {
    guid: string;
    employeeNumber: number;
    office: Promise<Office>;
    reportTo: Promise<Employee>;
    lastName: string;
    firstName: string;
    extension: string;
    email: string;
    jobTitle: string;
}
export declare class Office extends PDM.TRecord {
    guid: string;
    officeCode: string;
    city: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    state: string;
    country: string;
    postalCode: string;
    territory: string;
}
export declare class OrderDetails extends PDM.TRecord {
    guid: string;
    order: Promise<Order>;
    product: Promise<Product>;
    quantityOrdered: number;
    priceEach: number;
    orderLineNumber: number;
}
export declare class Order extends PDM.TRecord {
    guid: string;
    orderDetails: PDM.TRecordSet<OrderDetails>;
    orderNumber: number;
    customer: Promise<Customer>;
    orderDate: Date;
    requiredDate: Date;
    shippedDate: Date;
    status: string;
    comments: string;
}
export declare class Payment extends PDM.TRecord {
    guid: string;
    customer: Promise<Customer>;
    checkNumber: string;
    paymentDate: Date;
    amount: number;
}
export declare class ProductLine extends PDM.TRecord {
    guid: string;
    productLine: string;
    textDescription: string;
    htmlDescription: string;
    image: string;
}
export declare class Product extends PDM.TRecord {
    guid: string;
    productLine: Promise<ProductLine>;
    productCode: string;
    productName: string;
    productScale: string;
    productVendor: string;
    productDescription: string;
    quantityInStock: number;
    buyPrice: number;
    MSRP: number;
}
export declare class Context extends PDM.TContext {
    customer: PDM.TRecordSet<Customer>;
    employee: PDM.TRecordSet<Employee>;
    office: PDM.TRecordSet<Office>;
    order: PDM.TRecordSet<Order>;
    payment: PDM.TRecordSet<Payment>;
    productLine: PDM.TRecordSet<ProductLine>;
    product: PDM.TRecordSet<Product>;
}
export default Context;
