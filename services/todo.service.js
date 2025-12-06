import Todo from '../models/Todo.js';

export const todoService = {
    getAll: async (userId) => {
        const todos = await Todo.find({ user: userId }).sort({ createdAt: -1 });

        return todos.map((t) => ({ ...t.toObject(), isOverdue: t.dueDate && !t.completed && t.dueDate < new Date() }));
    },

    getOne: async (id, userId) => {
        const todo = await Todo.findOne({ _id: id, user: userId });
        if (!todo) throw new Error("Todo not found");
        return { ...todo.toObject(), isOverdue: todo.dueDate && !todo.completed && todo.dueDate < new Date() };
    },

    create: async (userId, input) => {
        const todo = new Todo({ user: userId, ...input });
        await todo.save();
        return { ...todo.toObject(), isOverdue: false };
    },

    update: async (id, userId, input) => {
        const todo = await Todo.findOne({ _id: id, user: userId });
        if (!todo) throw new Error("Todo not found");

        Object.assign(todo, input);
        await todo.save();

        return { ...todo.toObject(), isOverdue: todo.dueDate && !todo.completed && todo.dueDate < new Date() };
    },

    remove: async (id, userId) => {
        const todo = await Todo.findOne({ _id: id, user: userId });
        if (!todo) throw new Error("Todo not found");
        await todo.deleteOne();
    },

}