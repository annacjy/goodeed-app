import { gql } from 'apollo-server-micro';

const TypeDefs = gql`
  # <---- USER ----->
  type Location {
    lat: Float
    lng: Float
  }

  type User {
    username: String!
    password: String!
    displayName: String
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
    from: String!
    to: String!
    message: String!
    createdAt: String!
  }

  type MessageData {
    _id: String!
    participants: [String]!
    messages: [Chat]
  }

  type Chats {
    user: String!
    messageData: [MessageData]!
  }

  # <---- QUERY ----->
  type Query {
    userPost: [Posts]!
    posts: [Posts]!
    comments(id: String!): [Post]!
    chats: Chats!
    storedMessages(_id: String!): MessageData!
  }

  # <---- MUTATION ----->
  type Mutation {
    # <---- Authentication ----->
    login(username: String!, password: String!): AuthPayload
    register(username: String!, password: String!): AuthPayload
    # <---- Posts ----->
    createPost(text: String!, createdAt: String!): Posts
    postComment(text: String!, createdAt: String!, id: String!): Post
    # <---- Chat ----->
    postMessage(to: String!, message: String!, createdAt: String!): Chat
  }
`;

export default TypeDefs;
