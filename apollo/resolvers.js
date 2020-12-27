import { connection } from 'db/connection';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { BCRYPT_SALT_ROUNDS, JWT_SECRET_KEY } = process.env;

const resolvers = {
  Query: {
    users(_parent, _args, { db }, _info) {
      return db
        .select('*')
        .from('users')
        .orderBy('id');
    },
    posts: async (_parent, _args, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      return await db
        .collection('posts')
        .find()
        .toArray();
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

      const filteredChats = allChats.filter(({ participants }) => participants.includes(loggedUser.username));

      return { messageData: filteredChats, user: loggedUser.username };
    },
    storedMessages: async (_parent, { _id }, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      const objId = new ObjectId(_id);

      const chat = await db.collection('chats').findOne({ _id: objId });
      chat.messages = chat.messages.reverse();

      return chat;
    },
  },
  Mutation: {
    // <---- AUTHENTICATION ---->
    register: async (_parent, args, _context, _info) => {
      const trx = await connection.transaction();

      try {
        const { username, password } = args;

        if (!username || !password) return { status: { ok: false, message: 'All fields are required.' } };
        const user = await trx('users')
          .where({ username })
          .transacting(trx);

        if (user.length)
          return { status: { ok: false, message: 'This username already exists. Please pick another username.' } };

        const hash = await bcrypt.hash(password, Number(BCRYPT_SALT_ROUNDS));
        const newUser = {
          username,
          displayName: username,
          password: hash,
        };
        await trx('users')
          .insert(newUser)
          .transacting(trx);

        trx.commit();
        return { status: { ok: true } };
      } catch (error) {
        trx.rollback();
        return { status: { ok: false, message: error } };
      }
    },
    login: async (_parent, args, _context, _info) => {
      const trx = await connection.transaction();

      try {
        const { username, password } = args;

        if (!username || !password) return { status: { ok: false, message: 'All fields are required.' } };

        const user = await trx('users')
          .where({ username })
          .transacting(trx);

        if (!user.length) return { status: { ok: false, message: "This username doesn't exist." } };

        const match = await bcrypt.compare(password, user[0].password);
        trx.commit();

        if (match) {
          const token = jwt.sign(JSON.stringify(user[0]), JWT_SECRET_KEY);

          return jwt.verify(token, JWT_SECRET_KEY, (error, decoded) => {
            return error
              ? { status: { ok: false, message: 'Something went wrong. Please try again' } }
              : { status: { ok: true }, token, username: decoded.username };
          });
        } else {
          return { status: { ok: false, message: 'Invalid password.' } };
        }
      } catch (error) {
        trx.rollback();
        return { status: { ok: false, message: error } };
      }
    },

    // <---- POSTS ---->
    createPost: async (_parent, args, { db, loggedUser }, _info) => {
      if (!loggedUser) throw new AuthenticationError('you must be logged in');

      const { text, createdAt } = args;

      const Posts = db.collection('posts');

      const newPost = {
        content: {
          text,
          user: {
            username: loggedUser.username,
          },
          createdAt,
        },
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

    // <---- CHATS ---->
    postMessage: async (_parent, args, { db, loggedUser }, _info) => {
      const { to, message, createdAt } = args;

      // find chats participants where it includes both from and to
      const Chats = db.collection('chats');

      const allChats = await Chats.find().toArray();
      const matchedMessages = allChats.find(
        ({ participants }) => participants.includes(loggedUser.username) && participants.includes(to)
      );

      const newMessage = {
        from: loggedUser.username,
        to,
        message,
        createdAt,
      };

      // if chats already exist, update Chat object to the Chats
      if (matchedMessages) {
        await Chats.findOneAndUpdate(
          { _id: matchedMessages._id },
          { $set: { messages: [...matchedMessages.messages, newMessage] } }
        );
      } else {
        // else, insert new Chat object with the participants
        await Chats.insertOne({
          participants: [loggedUser.username, to],
          messages: [newMessage],
        });
      }
    },
  },
};

export default resolvers;
