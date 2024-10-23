import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../../../models/user.model';

export const loginService = async ({ email, password }: { email: string, password: string }) => {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

export const registerService = async ({ email, password, username }: { email: string, password: string, username: string }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, username });
    return newUser.save();
};
