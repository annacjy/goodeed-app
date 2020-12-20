import { gql } from 'apollo-server-micro';

const TypeDefs = gql`
  # <---- USER ----->
  type Location {
    lat: Float
    lng: Float
  }

  type User {
    username: String!
    password: String
    displayName: String!
    userImage: String
    location: Location
  }

  # <---- AUTH ----->
  type StatusPayload {
    ok: Boolean!
    message: String
  }

  type AuthPayload {
    token: String
    status: StatusPayload
    username: String
  }

  # <---- POSTS ----->
  type Post {
    text: String
    user: User
    createdAt: String
  }

  type Posts {
    _id: String!
    content: Post
    status: String
    comments: [Post]
  }

  # <---- CHAT ----->
  type Chat {
    id: Int!
    from: String!
    message: String!
  }

  # <---- QUERY ----->
  type Query {
    users: [User]!
    chats: [Chat]!
    posts: [Posts]!
  }

  # <---- MUTATION ----->
  type Mutation {
    # <---- Authentication ----->
    login(username: String!, password: String!): AuthPayload
    register(username: String!, password: String!): AuthPayload
    # <---- Posts ----->
    createPost(text: String!, createdAt: String!): Posts
    # <---- Chat ----->
    sendMessage(from: String!, message: String!): Chat
  }
`;

export default TypeDefs;
