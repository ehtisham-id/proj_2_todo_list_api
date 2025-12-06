import { Query } from 'mongoose';

import User from '../../models/User.js';

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