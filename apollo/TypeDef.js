import { gql } from 'apollo-server-micro';

const TypeDefs = gql`
  # <---- USER ----->
  type Location {
    lat: Float
    lng: Float
    address: String
  }

  input LocationInput {
    lat: Float
    lng: Float
    address: String
  }

  type User {
    username: String!
    password: String!
    displayName: String
    userImage: String
    location: Location
  }

  type UserInfo {
    username: String!
    displayName: String
    userImage: String
    location: Location
  }

  input UserInput {
    displayName: String
    userImage: String
    location: LocationInput
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
    location: Location
  }

  # <---- CHAT ----->
  type Chat {
    from: String!
    to: String!
    message: String!
    createdAt: String!
  }

  type ChatUserInfo {
    username: String!
    displayName: String
    userImage: String
  }

  input ChatUserInfoInput {
    username: String!
    displayName: String
    userImage: String
  }

  type MessageData {
    _id: String!
    participants: [ChatUserInfo]
    username: String!
    messages: [Chat]
    lastUpdatedAt: String
  }

  # <---- QUERY ----->
  type Query {
    user(token: String!): UserInfo!
    userPost: [Posts]!
    posts: [Posts]!
    comments(id: String!): [Post]!
    chats: [MessageData]!
    storedMessages(_id: String!): MessageData!
    chatUser(username: String!): ChatUserInfo!
  }

  # <---- MUTATION ----->
  type Mutation {
    # <---- Authentication ----->
    login(username: String!, password: String!): AuthPayload
    register(username: String!, password: String!): AuthPayload
    # <---- User ----->
    updateUser(fieldsToUpdate: UserInput!): StatusPayload
    # <---- Posts ----->
    createPost(text: String!, createdAt: String!): Posts
    postComment(text: String!, createdAt: String!, id: String!): Post
    updatePostStatus: Post
    # <---- Chat ----->
    postMessage(to: ChatUserInfoInput!, message: String!, createdAt: String!): Chat
  }
`;

export default TypeDefs;
