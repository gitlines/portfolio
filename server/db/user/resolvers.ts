import { IResolvers, PubSub } from 'apollo-server-express';
import { User } from './model';

const subscription = new PubSub();

enum UserChannels {
   USER_ADDED = 'USER_ADDED',
   USER_EDITED = 'USER_EDITED',
   USER_DELETED = 'USER_DELETED',
}

export const UserResolvers: IResolvers = {
   Query: {
      user: (root, args) => User.findOne(args),
      users: (root, args) => User.find({}),
   },
   Mutation: {
      addUser: async (root, { id, name, email }) => {
         const newUser = await new User({ id, name, email }).save();
         subscription.publish(UserChannels.USER_ADDED, { userAdded: newUser });
         return newUser;
      },
      editUser: (root, { id, name, email }) => User.findOneAndUpdate({ id }, { $set: { name, email } }),
      deleteUser: (root, args) => User.findOneAndRemove(args),
   },
   Subscription: {
      userAdded: {
         subscribe: () => subscription.asyncIterator(UserChannels.USER_ADDED),
      },
   },
};
