import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { arg, enumType, extendType, idArg, inputObjectType, nonNull, objectType, stringArg } from 'nexus';
import generateHashPassword from '../utils/hash';
import { CoursePreference } from './Course/Preference';
import { Error as NexusError } from './Error';
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
    t.nonNull.string('username', { description: 'Username of user to change password for' });
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
    t.string('username', { description: 'New username of user' });
    t.string('name', { description: 'New name of user' });
    t.field('role', { type: Role, description: 'New role of user' });
    t.boolean('active', { description: 'New active status of user' });
  },
});

export const UpdateUserMutationResult = objectType({
  name: 'UpdateUserMutationResult',
  definition(t) {
    t.field('user', { type: User });
    t.list.nonNull.field('errors', { type: NexusError });
  },
});

export const CreateUserInput = inputObjectType({
  name: 'CreateUserInput',
  definition(t) {
    t.string('name');
    t.nonNull.string('username');
    t.nonNull.string('password');
    t.nonNull.field('role', { type: Role });
  },
});

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.string('username', { description: 'Username' });
    t.string('name', { description: 'Name of the user' });
    t.nonNull.string('password', { description: 'Password' });
    t.nonNull.field('role', {
      type: Role,
      description: 'role - see enum Role',
    });
    t.list.nonNull.field('preferences', {
      type: CoursePreference,
      description: 'Teaching preferences',
    });
    t.nonNull.boolean('active', { description: 'Determine if the user is marked active' });
  },
});

export const UserMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createUser', {
      type: CreateUserMutationResult,
      description: 'Register a new user account',
      args: {
        input: arg({ type: nonNull(CreateUserInput) }),
      },
      resolve: async (_, args, { prisma }) => {
        const { name, username, password, role } = args.input;
        const userExists = await prisma.user.findFirst({ where: { username } });
        if (userExists) {
          return {
            success: false,
            message: 'User already exists',
          };
        }

        const hashPwd = await generateHashPassword(password);

        const newUser = await prisma.user.create({
          data: {
            name,
            username,
            password: hashPwd,
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
      resolve: async (root, args, ctx) => {
        const { username, password } = args;
        const { prisma } = ctx;
        const user = await (prisma as PrismaClient).user.findFirst({
          where: {
            username: username.toLowerCase(),
            password,
          },
        });
        if (!user) {
          return {
            success: false,
            message: 'Invalid username or password',
            token: '',
          };
        }
        return {
          success: true,
          token: '',
        };
      },
    });
    t.nonNull.field('logout', {
      type: AuthPayload,
      description: 'Logout the currently logged in user',
      resolve: () => ({ success: false, message: 'Not implemented', token: '' }),
    });
    t.field('updateUser', {
      type: UpdateUserMutationResult,
      description: 'Updates a user given the user id.',
      args: {
        input: arg({ type: nonNull(UpdateUserInput) }),
      },
      resolve: async (_, args, { prisma }) => {
        const { username, name, role, active } = args.input;
        const user = await prisma.user.update({
          where: { username: username ?? undefined },
          data: {
            username: username ?? undefined,
            name,
            role: role ?? undefined,
            active: active ?? undefined,
          },
        });
        if (user) return { user };
        else return { errors: [{ message: 'Could not update user' }] };
      },
    });
    t.nonNull.field('changeUserPassword', {
      type: Response,
      description: 'Change the password of the currently logged in user',
      args: {
        input: arg({ type: nonNull(ChangeUserPasswordInput) }),
      },
      resolve: async (_, args, { prisma }) => {
        const { username, currentPassword, newPassword } = args.input;

        const user = await (prisma as PrismaClient).user.findUnique({
          where: { username },
        });

        if (!user) return { success: false, message: 'User not found' };

        const isValid = await compare(currentPassword, user.password);

        if (!isValid) throw new Error('Invalid password');

        const hashPwd = await generateHashPassword(newPassword);

        await (prisma as PrismaClient).user.update({
          where: {
            username,
          },
          data: {
            password: hashPwd,
          },
        });

        return { success: true, message: 'Password updated' };
      },
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
