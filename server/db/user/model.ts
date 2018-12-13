import { Document, model, Model, Schema } from 'mongoose';

const UserSchema = new Schema({
   id: {
      type: String,
      required: true,
      unique: true,
   },
   name: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
   },
});

export interface UserModel extends Document {
   id: string;
   name: string;
   email: string;
}

export const User: Model<UserModel> = model<UserModel>('User', UserSchema);
