import { ApolloServer } from 'apollo-server-micro';
import { makeExecutableSchema } from 'graphql-tools';
import jwt from 'jsonwebtoken';
import knex from 'knex';
import resolvers from 'apollo/resolvers';
import typeDefs from 'apollo/TypeDef';
import knexConfig from 'knexfile';

const environment = process.env.NODE_ENV;
const knexCFG = knexConfig[environment];

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
  schema,
  context: async ({ req }) => {
    // AUTHORIZATION
    let loggedUser;

    const token = req.headers.authorization ? req.headers.authorization.split('Bearer ')[1] : '';
    if (token) {
      const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (!user) throw new AuthenticationError('You must be logged in');

      loggedUser = user;
    }

    // DATABASE
    let db;

    if (!db) {
      try {
        db = knex(knexCFG);
      } catch (e) {
        console.log('--->error while connecting with graphql context (db)', e);
      }
    }

    return { db, loggedUser };
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/graphql' });
