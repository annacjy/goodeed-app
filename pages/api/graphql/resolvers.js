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
  },
  Mutation: {
    signup: async (_parent, _args, _context, _info) => {},
    login: async (_parent, _args, _context, _info) => {},
  },
};

export default resolvers;
