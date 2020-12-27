const { DATABASE, HOSTNAME, PORT, USERNAME, PASSWORD } = process.env;

module.exports = {
  development: {
    client: 'pg',
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
    client: 'pg',
    connection: {
      host: HOSTNAME,
      user: USERNAME,
      password: PASSWORD,
      port: PORT,
      database: DATABASE,
    },
    ssl: true,
    pool: {
      min: 3,
      max: 10,
    },
    searchPath: ['knex', 'public'],
    migrations: {
      directory: './db/migrations',
    },
    useNullAsDefault: true,
  },
};
