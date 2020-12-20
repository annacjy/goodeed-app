import { gql } from 'apollo-server-micro';

const TypeDefs = gql`
  type User {
    username: String!
    email: String!
  }

  type StatusPayload {
    ok: Boolean!
    message: String
  }

  type AuthPayload {
    token: String
    status: StatusPayload
    username: String
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
    login(username: String!, password: String!): AuthPayload
    register(username: String!, password: String!): AuthPayload
    sendMessage(from: String!, message: String!): Chat
  }
`;

export default TypeDefs;
