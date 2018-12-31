import { gql } from 'apollo-server-express';
import { DocumentNode } from 'graphql';

export const UserTypes: DocumentNode = gql`
   type User {
      id: String!
      name: String!
      email: String!
   }

   type Query {
      user(id: String!): User
      users: [User]
   }

   type Mutation {
      addUser(id: String!, name: String!, email: String!): User
      editUser(id: String, name: String, email: String): User
      deleteUser(id: String, name: String, email: String): User
   }

   type Subscription {
      userAdded: User
   }
`;
