/* eslint-disable @typescript-eslint/no-explicit-any */

class MockSchema {
  createTable(): this {
    return this;
  }

  addColumn(): this {
    return this;
  }

  createIndex(): this {
    return this;
  }

  on(): this {
    return this;
  }

  columns(): this {
    return this;
  }

  unique(): this {
    return this;
  }
}

class MockDB {
  constructor(private schema: MockSchema) {}

  insertInto(): this {
    return this;
  }

  values(): this {
    return this;
  }

  returningAll(): this {
    return this;
  }

  where(): this {
    return this;
  }

  select(): this {
    return this;
  }

  selectAll(): this {
    return this;
  }

  selectFrom(): this {
    return this;
  }

  innerJoin(): this {
    return this;
  }

  updateTable(): this {
    return this;
  }

  set(): this {
    return this;
  }

  deleteFrom(): this {
    return this;
  }

  offset(): this {
    return this;
  }

  limit(): this {
    return this;
  }

  execute(): void {}

  executeTakeFirst(): any {
    return this;
  }

  executeTakeFirstOrThrow(): any {
    return this;
  }
}

const schema = new MockSchema();
export const db = new MockDB(schema);
