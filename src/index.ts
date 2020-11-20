import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import MikroORMConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/User";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { __prod__, COOKIE_NAME, SESSION_SECRET, TEN_YEARS } from "./constants";

const RedisStore = connectRedis(session);
const redisClient = redis.createClient();

const main = async () => {
  const orm = await MikroORM.init(MikroORMConfig);
  await orm.getMigrator().up();

  const app = express();

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: TEN_YEARS,
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax",
      },
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () =>
    console.log("Server started on: http://localhost:4000")
  );
};

main().catch((error) => console.log(error));
