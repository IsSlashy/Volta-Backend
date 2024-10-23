import { UserModel } from '../models/user.model';

export const getUserProfile = async (userId: string) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
};

export const updateUserProfile = async (userId: string, userDetails: any) => {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, userDetails, { new: true });
    if (!updatedUser) throw new Error('Unable to update user');
    return updatedUser;
};
