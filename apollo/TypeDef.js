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
    user: UserInfo
  }

  # <---- POSTS ----->
  type Post {
    text: String
    user: BasicUserInfo
    image: String
    createdAt: String
  }

  type Posts {
    _id: String!
    content: Post
    status: String
    comments: [Post]
    location: Location
  }

  type PostsWithHasMoreInfo {
    hasMore: Boolean
    content: [Posts!]
  }

  # <---- CHAT ----->
  type Chat {
    from: String!
    to: String!
    message: String!
    createdAt: String!
  }

  type BasicUserInfo {
    username: String!
    displayName: String
    userImage: String
  }

  type MessageData {
    _id: String!
    participants: [String]
    username: String!
    userChatInfo: BasicUserInfo
    lastMessage: Chat
    messages: [Chat]
    lastUpdatedAt: String
  }

  # <---- QUERY ----->
  type Query {
    # <---- User ----->
    user(token: String!): UserInfo!
    userPost: [Posts]!

    # <---- Posts ----->
    posts(offset: Int): PostsWithHasMoreInfo!
    userBorrowedPosts: [Posts]!
    comments(id: String!): [Post]!

    # <---- Chats ----->
    chats: [MessageData]!
    storedMessages(_id: String!): MessageData!
    chatUser(username: String!): BasicUserInfo!
  }

  # <---- MUTATION ----->
  type Mutation {
    # <---- Authentication ----->
    login(username: String!, password: String!): AuthPayload
    register(username: String!, password: String!): AuthPayload

    # <---- User ----->
    updateUser(fieldsToUpdate: UserInput!): StatusPayload

    # <---- Posts ----->
    createPost(text: String!, image: String, createdAt: String!): Posts
    postComment(text: String!, createdAt: String!, id: String!): Post
    updatePostStatus(id: String!): StatusPayload
    removePost(id: String!): StatusPayload

    # <---- Chat ----->
    postMessage(to: String!, message: String!, createdAt: String!): Chat
  }
`;

export default TypeDefs;
