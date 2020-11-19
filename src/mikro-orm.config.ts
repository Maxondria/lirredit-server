import { __prod__ } from "./constants";
import { Post } from "./entitles/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

export default {
  dbName: "lireddit",
  user: "postgres",
  password: "postgres",
  debug: !__prod__,
  type: "postgresql",
  port: 5433,
  host: "localhost",
  entities: [Post],
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  },
} as Parameters<typeof MikroORM.init>[0];
