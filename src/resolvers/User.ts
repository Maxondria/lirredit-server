import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entitles/User";
import argon2 from "argon2";

@InputType()
class RegisterLoginInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("registerInput") { username, password }: RegisterLoginInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (password.length < 4) {
      return {
        errors: [
          {
            field: "password",
            message: "password must be atleast 4 characters long",
          },
        ],
      };
    }

    if (username.length >= 2) {
      const hashedPassword = await argon2.hash(password);
      const userExists = await em.findOne(User, { username });

      if (userExists) {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }

      const user = em.create(User, { username, password: hashedPassword });

      try {
        await em.persistAndFlush(user);
        req.session.userId = user.id;
        return { user };
      } catch ({ message }) {
        return {
          errors: [
            {
              field: "unknown",
              message,
            },
          ],
        };
      }
    }

    return {
      errors: [
        {
          field: "username",
          message: "username length should be 2 or more",
        },
      ],
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("loginInput") { username, password }: RegisterLoginInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "that username doesn't exist",
          },
        ],
      };
    }

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: "username",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    const id = req.session.userId;
    return em.findOne(User, { id });
  }
}
