import { EntityManager } from "@mikro-orm/core";
import { Request, Response } from "express";

type Session = {
  userId?: number;
};

export type MyContext = {
  em: EntityManager<any> & EntityManager;
  req: Request & { session: Session };
  res: Response;
};
