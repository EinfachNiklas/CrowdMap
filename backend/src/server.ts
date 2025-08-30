import express from 'express';
import cors from 'cors';
import userRouter from './routes/users';
import swaggerRouter from './routes/swagger';
import dotenv from 'dotenv';
dotenv.config();

const server = express();
const port: number = Number(process.env.PORT ?? 6060);
server.use(express.json());
server.use(cors());

server.use("/", userRouter);
server.use("/", swaggerRouter);

server.listen(port, () => {
  console.log(`Volume Server started on port ${port} ...`);
});
