import Todo from '../models/Todo.js';

export const todoService = {
    getAll: async (userId) => {
        const todos = await Todo.find({ user: userId }).sort({ createdAt: -1 });

        return todos.map((t) => {
            // Include virtuals when converting to object
            const todoObj = t.toObject({ virtuals: true });

            console.log('Todo object:', todoObj); // Debug log

            return {
                id: todoObj._id.toString(),
                title: todoObj.title,
                description: todoObj.description,
                completed: todoObj.completed,
                dueDate: todoObj.dueDate ? new Date(todoObj.dueDate).toISOString() : null,
                isOverdue: todoObj.isOverdue !== undefined ? todoObj.isOverdue : false, // Handle virtual field
                createdAt: todoObj.createdAt.toISOString(),
                updatedAt: todoObj.updatedAt.toISOString()
            };
        });
    },

    getOne: async (id, userId) => {
        const todo = await Todo.findOne({ _id: id, user: userId });
        if (!todo) throw new Error("Todo not found");

        // Include virtuals when converting to object
        const todoObj = todo.toObject({ virtuals: true });

        return {
            id: todoObj._id.toString(),
            title: todoObj.title,
            description: todoObj.description,
            completed: todoObj.completed,
            dueDate: todoObj.dueDate ? new Date(todoObj.dueDate).toISOString() : null,
            isOverdue: todoObj.isOverdue !== undefined ? todoObj.isOverdue : false, // Handle virtual field
            createdAt: todoObj.createdAt.toISOString(),
            updatedAt: todoObj.updatedAt.toISOString()
        };
    },

    create: async (userId, input) => {
        const todo = new Todo({ user: userId, ...input });
        await todo.save();

        // Include virtuals when converting to object
        const todoObj = todo.toObject({ virtuals: true });

        return {
            id: todoObj._id.toString(),
            title: todoObj.title,
            description: todoObj.description,
            completed: todoObj.completed,
            dueDate: todoObj.dueDate ? new Date(todoObj.dueDate).toISOString() : null,
            isOverdue: todoObj.isOverdue !== undefined ? todoObj.isOverdue : false, // Handle virtual field
            createdAt: todoObj.createdAt.toISOString(),
            updatedAt: todoObj.updatedAt.toISOString()
        };
    },

    update: async (id, userId, input) => {
        const todo = await Todo.findOne({ _id: id, user: userId });
        if (!todo) throw new Error("Todo not found");

        Object.assign(todo, input);
        await todo.save();

        // Include virtuals when converting to object
        const todoObj = todo.toObject({ virtuals: true });

        return {
            id: todoObj._id.toString(),
            title: todoObj.title,
            description: todoObj.description,
            completed: todoObj.completed,
            dueDate: todoObj.dueDate ? new Date(todoObj.dueDate).toISOString() : null,
            isOverdue: todoObj.isOverdue !== undefined ? todoObj.isOverdue : false, // Handle virtual field
            createdAt: todoObj.createdAt.toISOString(),
            updatedAt: todoObj.updatedAt.toISOString()
        };
    },

    remove: async (id, userId) => {
        const todo = await Todo.findOne({ _id: id, user: userId });
        if (!todo) throw new Error("Todo not found");
        await todo.deleteOne();
    },
};