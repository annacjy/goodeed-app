exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments().primary();
    table
      .string('username', 128)
      .unique()
      .notNullable();
    table.string('displayName', 128).notNullable();
    table.string('password', 255).notNullable();
    table.string('userImage', 255).nullable();
    table.json('location').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
