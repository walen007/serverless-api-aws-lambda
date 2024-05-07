import { isValidPhoneNumber } from 'libphonenumber-js';
import { ICustomer, IEmployee } from '../../../types';
import { filterProps } from './filter-props';

// Matches both regular alphabet and unicode characters, min 2 characters.
const nameRegx = /^[\p{L}\p{M}'\s-]{2,}$/u;

export const validateEmployee = (employee: IEmployee): boolean => {
  const { employee_id, first_name, last_name, telephone } = employee;

  if (!employee_id) {
    return false;
  }

  if (!nameRegx.test(first_name) || !nameRegx.test(last_name)) {
    return false;
  }

  if (!telephone || !isValidPhoneNumber(telephone)) {
    return false;
  }

  return true;
};

export const validateEmployeeUpdate = (employee: Partial<IEmployee>): Partial<IEmployee> | boolean => {
  const { first_name, last_name, telephone } = filterProps(employee, ['first_name', 'last_name', 'telephone'], 'in');
  const data: Partial<IEmployee> = {};

  if (first_name && nameRegx.test(first_name)) {
    data.first_name = first_name;
  }

  if (last_name && nameRegx.test(last_name)) {
    data.last_name = last_name;
  }

  if (telephone && isValidPhoneNumber(telephone)) {
    data.telephone = telephone;
  }

  if (Object.keys(data).length > 0) return data;
  return false;
};

// TODO: ad stricter validations
export const isValidCustomer = (customer: ICustomer): boolean => {
  const { customer_id, customer_name, email, password } = customer;

  if (!customer_id) {
    return false;
  }

  if (!nameRegx.test(customer_name)) {
    return false;
  }

  if (!email) {
    return false;
  }

  if (!password) {
    return false;
  }

  return true;
};
