import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { BCRYPT_SALT_ROUNDS, JWT_SECRET_KEY } = process.env;

// TODO: separate resolvers and TypeDefs into "modules" (user, posts, chat)
const resolvers = {
  Query: {
    users(_parent, _args, { db }, _info) {
      return db
        .collection('users')
        .findOne()
        .then(data => {
          return data.users;
        });
    },
    posts: async (_parent, _args, { db }, _info) => {
      return await db
        .collection('posts')
        .find()
        .toArray();
    },
  },
  Mutation: {
    // <---- AUTHENTICATION ---->
    register: async (_parent, args, { db }, _info) => {
      const { username, password } = args;

      const Users = db.collection('users');

      if (!username || !password) return { status: { ok: false, message: 'All fields are required.' } };

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

      const Users = db.collection('users');

      if (!username || !password) return { status: { ok: false, message: 'All fields are required.' } };

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

    // <---- POSTS ---->
    createPost: async (_parent, args, { db, loggedUser }, _info) => {
      const { text, createdAt } = args;

      const Posts = db.collection('posts');
      const Users = db.collection('users');

      const userPayload = await Users.findOne({ username: loggedUser.username });

      const newPost = {
        content: {
          text,
          user: {
            username: userPayload.username,
          },
          createdAt,
        },
        status: 'TO_BORROW',
        comments: [],
      };

      await Posts.insertOne(newPost);

      return newPost;
    },
  },
};

export default resolvers;
