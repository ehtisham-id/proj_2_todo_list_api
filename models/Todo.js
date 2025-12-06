const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    completed: {
        type: Boolean,
        default: false,
    },
    dueDate: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

todoSchema.virtual("isOverdue").get(function () {
    if (!this.dueDate || this.completed) return false;
    return this.dueDate < Date.now();
})

const Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;