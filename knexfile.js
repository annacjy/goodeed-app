const { DATABASE, HOSTNAME, PORT, USERNAME, PASSWORD } = process.env;

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',
      user: 'devtest',
      password: 'testing123',
      port: 5432,
      database: 'testdb',
    },
    migrations: {
      directory: './db/migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: HOSTNAME,
      user: USERNAME,
      password: PASSWORD,
      port: PORT,
      database: DATABASE,
    },
    ssl: true,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations',
    },
    useNullAsDefault: true,
  },
};
