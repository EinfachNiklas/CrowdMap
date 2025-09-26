import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import userRouter from './routes/users';
import authRouter from './routes/auth';
import swaggerRouter from './routes/swagger';
import geocodingRouter from './routes/geocoding';
import crowdEventRouter from './routes/crowdEvents';
import Authentication from './authentication';
import cookieParser from 'cookie-parser';

const server = express();
const port: number = parseInt(process.env.PORT ?? '', 10) || 4000;
server.set('trust proxy', 1);
server.use(express.json());
server.use(cookieParser());
server.use(cors({
  origin: "*",
  credentials: true
}));

server.use(Authentication.authenticate);

server.use("/", userRouter);
server.use("/", authRouter);
server.use("/", swaggerRouter);
server.use("/", geocodingRouter);
server.use("/", crowdEventRouter);


server.listen(port, () => {
  console.log(`Volume Server started on port ${port} ...`);
});
