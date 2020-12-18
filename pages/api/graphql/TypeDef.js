import { gql } from 'apollo-server-micro';

const TypeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    blog: String
    stars: Int
  }

  type Chat {
    id: Int!
    from: String!
    message: String!
  }

  type Query {
    users: [User]!
    chats: [Chat]
  }

  type Mutation {
    sendMessage(from: String!, message: String!): Chat
  }
`;

export default TypeDefs;
