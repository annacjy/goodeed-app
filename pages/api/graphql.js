import { ApolloServer } from 'apollo-server-micro';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import schema from 'apollo/schema';
let cloudinary = require('cloudinary').v2;

let db;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const apolloServer = new ApolloServer({
  schema,
  context: async ({ req }) => {
    let loggedUser;

    const token = req.headers.authorization ? req.headers.authorization.split('Bearer ')[1] : '';
    if (token) {
      const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (!user) throw new AuthenticationError('You must be logged in');

      loggedUser = user;
    }

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

    return { db, loggedUser };
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/graphql' });
