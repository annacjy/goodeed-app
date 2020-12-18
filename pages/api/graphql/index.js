import { ApolloServer } from 'apollo-server-micro';
import { makeExecutableSchema } from 'graphql-tools';
import { MongoClient } from 'mongodb';
import resolvers from './resolvers';
import typeDefs from './TypeDef';

const { Server } = require('socket.io');

require('dotenv').config();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

let db;

const apolloServer = new ApolloServer({
  schema,
  context: async ({ req, res }) => {
    // AUTHORIZATION
    console.log(req.headers.authorization);
    // SOCKET
    if (!res.socket.server.io) {
      console.log('*First use, starting socket.io');

      const io = new Server(res.socket.server);

      io.on('connection', socket => {
        console.log('user connected');
        console.log(socket.id + 'connected');

        socket.on('hello', msg => {
          socket.emit('onMessage', msg);
        });

        socket.on('disconnect', () => {
          console.log(socket.id + 'diconnected');
        });
      });

      res.socket.server.io = io;
    } else {
      console.log('socket.io already running');
    }

    // DATABASE
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

    return { db };
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/graphql' });
