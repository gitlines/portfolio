import chalk from 'chalk';
import { connect } from 'mongoose';

const user = process.env.DB_USER || '';
const password = process.env.DB_PASSWORD || '';
const server = process.env.DB_SERVER || '';
const dbName = process.env.DB_NAME || '';
const credentials = user.length && password.length ? `${user}:${password}@` : '';
const db = `mongodb://${credentials}${server}/${dbName}`;

export const connectMongo = () => {
   return connect(
      db,
      { useCreateIndex: true, useNewUrlParser: true }
   )
      .then(() => console.log(chalk.green(`Connected to database at ${server}`)))
      .catch((err) => {
         console.error(chalk.red(`Error connecting database: ${err}`));
         throw err;
      });
};
