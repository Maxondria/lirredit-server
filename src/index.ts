import { MikroORM } from "@mikro-orm/core";
import MikroORMConfig from "./mikro-orm.config";
import { Post } from "./entitles/Post";

const main = async () => {
  const orm = await MikroORM.init(MikroORMConfig);

  const post = orm.em.create(Post, { title: "Sample 'em" });
  await orm.em.persistAndFlush(post);
};

main().catch((error) => console.log(error));
