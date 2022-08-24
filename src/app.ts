import * as express from 'express';
import { createServer, proxy } from 'aws-serverless-express';
import * as createError from 'http-errors';
import indexRouter from './routes';
import usersRouter from './routes/users';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({ message: err.message });
});

const server = createServer(app);

export const handler = (event, context) => {
  proxy(server, event, context);
};
