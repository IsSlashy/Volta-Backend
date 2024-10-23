export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const validateUsername = (username: string): boolean => {
    return username.length >= 3 && username.length <= 16;
};
