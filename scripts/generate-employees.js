import fs from 'fs';
import converter from 'json-2-csv';
import { faker } from '@faker-js/faker';

const LIST_SIZE = 950;
const TEL_REGX = /49[0-9]{11,12}/;

const generateEmployee = () => ({
  employee_id: faker.string.uuid().replace(/-/g, ''),
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  telephone: '+' + faker.helpers.fromRegExp(TEL_REGX),
});

let employees = [];

employees = faker.helpers.multiple(generateEmployee, {
  count: LIST_SIZE,
});

fs.writeFileSync(`scripts/samples/employees-${LIST_SIZE}.csv`, converter.json2csv(employees));
fs.writeFileSync(`scripts/samples/employees-${LIST_SIZE}.json`, JSON.stringify(employees));
