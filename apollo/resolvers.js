import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { AuthenticationError } from 'apollo-server-core';
import { calcDistance } from 'utils/functions';

const { BCRYPT_SALT_ROUNDS, JWT_SECRET_KEY } = process.env;

const resolvers = {
  Query: {
    user: async (_parent, { token }, { db }, _info) => {
      const user = jwt.verify(token, JWT_SECRET_KEY, (error, decoded) => {
        return error ? null : decoded.username;
      });

      if (!user) throw new Error('Error verifying user');

      return await db.collection('users').findOne({ username: user });
    },
    posts: async (_parent, _args, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      const { location } = await db.collection('users').findOne({ username: loggedUser.username });

      const posts = await db
        .collection('posts')
        .find()
        .toArray();

      const postsByRecent = posts.reverse();

      if (location) {
        const compareDistance = (postLat, postLng) => calcDistance(postLat, postLng, location.lat, location.lng);

        // sort by distance (closest -> farthest)
        return postsByRecent.sort(
          (a, b) => compareDistance(a.location.lat, a.location.lng) - compareDistance(b.location.lat, b.location.lng)
        );
      } else {
        return postsByRecent;
      }
    },
    userPost: async (_parent, _args, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      const allPosts = await db
        .collection('posts')
        .find()
        .toArray();

      return allPosts.filter(({ content }) => content.user.username === loggedUser.username);
    },
    comments: async (_parent, { id }, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      const objId = new ObjectId(id);

      const post = await db.collection('posts').findOne({ _id: objId });

      return post.comments;
    },
    chats: async (_parent, _args, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      const allChats = await db
        .collection('chats')
        .find()
        .toArray();

      const username = loggedUser.username;

      const mappedChats = allChats.map(obj => {
        let rObj = {};
        rObj['username'] = username;
        return { ...obj, ...rObj };
      });

      const filteredChats = mappedChats
        .filter(({ participants }) => participants.filter(({ username }) => username.includes(loggedUser.username)))
        .sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt));

      return filteredChats;
    },
    storedMessages: async (_parent, { _id }, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      const objId = new ObjectId(_id);

      const chat = await db.collection('chats').findOne({ _id: objId });
      chat.messages = chat.messages.reverse();

      return chat;
    },
    chatUser: async (_parent, { username }, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      const user = await db.collection('users').findOne({ username });

      return {
        username: user.username,
        displayName: user.displayName,
        userImage: user.userImage,
      };
    },
  },
  Mutation: {
    // <---- AUTHENTICATION ---->
    register: async (_parent, args, { db }, _info) => {
      const { username, password } = args;

      if (!username || !password) return { status: { ok: false, message: 'All fields are required.' } };

      const Users = db.collection('users');
      try {
        const user = await Users.findOne({ username });

        if (user)
          return { status: { ok: false, message: 'This username already exists. Please pick another username.' } };

        const hash = await bcrypt.hash(password, Number(BCRYPT_SALT_ROUNDS));
        const newUser = {
          username,
          password: hash,
        };
        await Users.insertOne(newUser);

        return { status: { ok: true } };
      } catch (error) {
        return { status: { ok: false, message: error } };
      }
    },
    login: async (_parent, args, { db }, _info) => {
      const { username, password } = args;

      if (!username || !password) return { status: { ok: false, message: 'All fields are required.' } };
      const Users = db.collection('users');
      try {
        const user = await Users.findOne({ username });
        if (!user) return { status: { ok: false, message: "This username doesn't exist." } };

        const match = await bcrypt.compare(password, user.password);

        if (match) {
          const token = jwt.sign(JSON.stringify(user), JWT_SECRET_KEY);

          return jwt.verify(token, JWT_SECRET_KEY, (error, decoded) => {
            return error
              ? { status: { ok: false, message: 'Something went wrong. Please try again' } }
              : { status: { ok: true }, token, username: decoded.username };
          });
        } else {
          return { status: { ok: false, message: 'Invalid password.' } };
        }
      } catch (error) {
        return { status: { ok: false, message: error } };
      }
    },

    // <---- USER ---->
    updateUser: async (_parent, { fieldsToUpdate }, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      const user = await db.collection('users').findOne({ username: loggedUser.username });

      try {
        await db.collection('users').findOneAndUpdate({ _id: user._id }, { $set: { ...user, ...fieldsToUpdate } });

        return { ok: true, message: 'Update successful' };
      } catch (error) {
        return { ok: false, message: 'Something went wrong' };
      }
    },
    // <---- POSTS ---->
    createPost: async (_parent, args, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      const { text, createdAt } = args;

      const Posts = db.collection('posts');

      const { location } = await db.collection('users').findOne({ username: loggedUser.username });

      const newPost = {
        content: {
          text,
          user: {
            username: loggedUser.username,
          },
          createdAt,
        },
        location,
        status: 'TO_BORROW',
        comments: [],
      };

      await Posts.insertOne(newPost);

      return newPost;
    },
    postComment: async (_parent, args, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      const { text, createdAt, id } = args;

      const Posts = db.collection('posts');
      const objId = new ObjectId(id);

      const postCurrentComments = await Posts.findOne({ _id: objId });

      const newComment = {
        text,
        createdAt,
        user: { username: loggedUser.username },
      };

      await Posts.findOneAndUpdate(
        { _id: objId },
        { $set: { comments: [...postCurrentComments.comments, newComment] } }
      );

      return newComment;
    },
    updatePostStatus: async (_parent, args, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');
    },

    // <---- CHATS ---->
    postMessage: async (_parent, args, { db, loggedUser }, _info) => {
      const { to, message, createdAt } = args;

      // find chats participants where it includes both from and to
      const Chats = db.collection('chats');

      const allChats = await Chats.find().toArray();
      // participants.includes(loggedUser.username) && participants.includes(to.username)
      const matchedMessages = allChats.find(({ participants }) =>
        participants.map(({ username }) => username === loggedUser.username && username === to.username)
      );

      const newMessage = {
        from: loggedUser.username,
        to: to.username,
        message,
        createdAt,
      };

      const chatUserInfo = {
        username: loggedUser.username,
        displayName: loggedUser.displayName,
        userImage: loggedUser.userImage,
      };
      // if chats already exist, update Chat object to the Chats
      if (matchedMessages) {
        await Chats.findOneAndUpdate(
          { _id: matchedMessages._id },
          { $set: { messages: [...matchedMessages.messages, newMessage], lastUpdatedAt: `${new Date()}` } }
        );
      } else {
        // else, insert new Chat object with the participants
        await Chats.insertOne({
          participants: [chatUserInfo, to],
          messages: [newMessage],
          lastUpdatedAt: `${new Date()}`,
        });
      }
    },
  },
};

export default resolvers;
