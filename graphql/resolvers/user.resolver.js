import { Query } from 'mongoose';

const User = require('../../models/User');

export const userResolver = {
    Query: {
        me : async (_, __, { user }) => {
            if (!user) {
                return null;
            }   
            return await User.findById(user.id);
        }
    }
}