import { PrismaClient } from '@prisma/client';
import { arg, enumType, extendType, idArg, inputObjectType, nonNull, objectType, stringArg } from 'nexus';
// import { compare } from 'bcrypt';
import { generateToken, getUserId } from '../utils/auth';
import { CoursePreference } from './Course/Preference';
import { Error } from './Error';
import { Response } from './Response';

export const AuthPayload = objectType({
  name: 'AuthPayload',
  description: 'Returned when a user logs in our logs out.',
  definition(t) {
    t.nonNull.boolean('success', { description: 'Whether auth operation was successful or not' });
    t.nonNull.string('token', { description: 'Auth token used for future requests' });
    t.string('message', { description: 'Optional error message if success is false' });
  },
});

export const ChangeUserPasswordInput = inputObjectType({
  name: 'ChangeUserPasswordInput',
  definition(t) {
    t.nonNull.string('currentPassword');
    t.nonNull.string('newPassword');
  },
});

export const CreateUserMutationResult = objectType({
  name: 'CreateUserMutationResult',
  definition(t) {
    t.nonNull.boolean('success');
    t.string('message');
    t.string('username');
    t.string('password');
  },
});

export const ResetPasswordMutationResult = objectType({
  name: 'ResetPasswordMutationResult',
  definition(t) {
    t.nonNull.boolean('success', { description: 'Whether the password was successfully reset' });
    t.string('message', { description: 'Optional error message' });
    t.string('password', { description: 'New user password' });
  },
});

export const Role = enumType({
  name: 'Role',
  description: 'User role',
  members: [
    { description: 'Administrator role (department staff etc.)', name: 'ADMIN', value: 'ADMIN' },
    { description: 'User role (professor, student etc.)', name: 'USER', value: 'USER' },
  ],
});

export const UpdateUserInput = inputObjectType({
  name: 'UpdateUserInput',
  definition(t) {
    t.nonNull.id('id', { description: 'ID of user to update' });
  },
});

export const UpdateUserMutationResult = objectType({
  name: 'UpdateUserMutationResult',
  definition(t) {
    t.field('user', { type: User });
    t.list.nonNull.field('errors', { type: Error });
  },
});

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id', { description: 'Unique User  ID' });
    t.nonNull.string('username', { description: 'Username' });
    t.nonNull.string('password', { description: 'Password' });
    t.nonNull.field('role', {
      type: Role,
      description: 'role - see enum Role',
    });
    t.list.nonNull.field('preferences', {
      type: CoursePreference,
      description: 'Teaching preferences',
    });
    t.nonNull.boolean('active', {
      description: 'Determine if the user is marked active',
    });
  },
});

export const UserMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createUser', {
      type: CreateUserMutationResult,
      description: 'Register a new user account',
      args: {
        name: stringArg({ description: 'Name of the user' }),
        username: nonNull(stringArg({ description: 'Username for user' })),
        password: nonNull(stringArg({ description: 'Password for user' })),
        role: nonNull(Role),
      },
      resolve: async (_, args, ctx) => {
        const { name, username, password, role } = args;
        const { prisma } = ctx;
        const newUser = await (prisma as PrismaClient).user.create({
          data: {
            name,
            username,
            password,
            role,
          },
        });
        if (!newUser) return { success: false, message: 'Could not create user' };
        else return { success: true, message: 'User created' };
      },
    });
    t.nonNull.field('login', {
      type: AuthPayload,
      description: 'Login into a user account using email and password',
      args: {
        username: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_root, args, ctx) => {
        const user = await ctx.prisma.user.findFirst({
          where: { username: args.username },
        });

        if (!user) {
          return {
            message: `Could not find user with username ${args.username}`,
            success: false,
            token: '',
          };
        }

        // TODO: When bcrypt is implemented for storing passwords
        // const passwordMatch = await compare(args.password, user.password);
        const passwordMatch = args.password === user.password;
        if (!passwordMatch) {
          return {
            message: `Incorrect password for user ${args.username}`,
            success: false,
            token: '',
          };
        }

        const token = generateToken(user.id);
        return {
          message: `Successfully logged in user ${args.username}`,
          success: true,
          token,
        };
      },
    });
    t.nonNull.field('logout', {
      type: AuthPayload,
      description: 'Logout the currently logged in user',
      resolve: () => ({ success: false, message: "I don't think we actually need this in the backend", token: '' }),
    });
    t.field('updateUser', {
      type: UpdateUserMutationResult,
      description: 'Updates a user given the user id.',
      args: {
        input: arg({ type: nonNull(UpdateUserInput) }),
      },
      resolve: () => ({}),
    });
    t.nonNull.field('changeUserPassword', {
      type: Response,
      description: 'Change the password of the currently logged in user',
      args: {
        input: arg({ type: nonNull(ChangeUserPasswordInput) }),
      },
      resolve: () => ({ success: false, message: 'Not implemented' }),
    });
    t.nonNull.field('resetPassword', {
      type: ResetPasswordMutationResult,
      description: 'Reset a users password.',
      args: {
        id: nonNull(idArg()),
      },
      resolve: () => ({ success: false, message: 'Not implemented' }),
    });
  },
});

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('me', {
      type: User,
      description: 'Get the current user',
      resolve: (_, __, ctx) => {
        const id = getUserId(ctx.token);
        return ctx.prisma.user.findFirst({ where: { id } });
      },
    });
    t.field('findUserById', {
      type: User,
      description: 'Find a user by their id',
      args: {
        id: nonNull(idArg()),
      },
    });
  },
});
