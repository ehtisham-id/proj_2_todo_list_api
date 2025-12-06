const { todoService } = require("../../services/todo.service");

export const todoResolver = {
  Query: {
    todos: async (_, __, { user }) => todoService.getAll(user.id),
    todo: async (_, { id }, { user }) => todoService.getOne(id, user.id),
  },
  Mutation: {
    createTodo: async (_, { input }, { user }) => todoService.create(user.id, input),
    updateTodo: async (_, { id, input }, { user }) => todoService.update(id, user.id, input),
    deleteTodo: async (_, { id }, { user }) => {
      await todoService.remove(id, user.id);
      return { message: "Todo deleted" };
    },
  },
};
