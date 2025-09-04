import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRouter from './routes/users';
import authRouter from './routes/auth';
import swaggerRouter from './routes/swagger';
import authentication from './authentication';
import cookieParser from 'cookie-parser';

const server = express();
const port: number = parseInt(process.env.PORT ?? '', 10) || 4000;
server.use(express.json());
server.use(cookieParser());
server.use(cors());

server.use(authentication.authenticate);

server.use("/", userRouter);
server.use("/",authRouter);
server.use("/", swaggerRouter);

server.listen(port, () => {
  console.log(`Volume Server started on port ${port} ...`);
});
