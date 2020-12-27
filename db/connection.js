import knex from 'knex';
import knexConfig from 'knexfile';

const environment = process.env.NODE_ENV;
const config = knexConfig[environment];

export const connection = knex(config);
