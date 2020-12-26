const knex = require('knex');
const config = require('./knexfile');

export const connection = knex(config);
