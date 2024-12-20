import { User } from '../../types.js';
import { faker } from '@faker-js/faker';

export function getUsers(amount: number) {
  return Array(amount).fill(null).map(() => {
    const id = faker.string.uuid();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const isActive = faker.datatype.boolean();

    return { id, firstName, lastName, isActive };
  }) satisfies User[];
}
