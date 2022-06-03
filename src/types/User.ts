import { arg, enumType, extendType, idArg, inputObjectType, nonNull, objectType, stringArg } from 'nexus';
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
        username: nonNull(stringArg()),
      },
    });
    t.nonNull.field('login', {
      type: AuthPayload,
      description: 'Login into a user account using email and password',
      args: {
        username: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
    });
    t.nonNull.field('logout', {
      type: AuthPayload,
      description: 'Logout the currently logged in user',
    });
    t.field('updateUser', {
      type: UpdateUserMutationResult,
      description: 'Updates a user given the user id.',
      args: {
        input: arg({ type: nonNull(UpdateUserInput) }),
      },
    });
    t.nonNull.field('changeUserPassword', {
      type: Response,
      description: 'Change the password of the currently logged in user',
      args: {
        input: arg({ type: nonNull(ChangeUserPasswordInput) }),
      },
    });
    t.nonNull.field('resetPassword', {
      type: ResetPasswordMutationResult,
      description: 'Reset a users password.',
      args: {
        id: nonNull(idArg()),
      },
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
