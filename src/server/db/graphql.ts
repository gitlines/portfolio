import { IResolvers } from 'apollo-server-express';
import { DocumentNode } from 'graphql';
import { UserResolvers, UserTypes } from './user';

export const typeDefs: DocumentNode[] = [UserTypes];

export const resolvers: IResolvers = {
   Query: Object.assign({}, UserResolvers.Query),
   Mutation: Object.assign({}, UserResolvers.Mutation),
   Subscription: Object.assign({}, UserResolvers.Subscription),
};
