import { ApolloServer } from 'apollo-server-micro';
import { makeExecutableSchema } from 'graphql-tools';
import { MongoClient } from 'mongodb';
import resolvers from './resolvers';
import typeDefs from './TypeDef';
import jwt from 'jsonwebtoken';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
  schema,
  context: async ({ req, res }) => {
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

    // TODO: change DB to POSTGRES
    if (!db) {
      try {
        const dbClient = new MongoClient(process.env.MONGO_DB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        if (!dbClient.isConnected()) await dbClient.connect();
        db = dbClient.db('graphql-test'); // database name
      } catch (e) {
        console.log('--->error while connecting with graphql context (db)', e);
      }
    }

    // console.log('user from gql====', loggedUser);
    return { db, loggedUser };
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/graphql' });
