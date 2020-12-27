let fs = require('fs');

const { DATABASE, HOSTNAME, PORT, USERNAME, PASSWORD, DATABASE_URL } = process.env;

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
      ssl: {
        ca: fs.readFileSync('./ca-certificate.crt'),
      },
    },
    pool: { min: 1, max: 22 },
    asyncStackTraces: true,
    useNullAsDefault: true,
  },
};
