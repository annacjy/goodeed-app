import { makeExecutableSchema } from 'graphql-tools';
import resolvers from 'apollo/resolvers';
import typeDefs from 'apollo/TypeDef';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
