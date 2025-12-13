const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');

const getAllUsers = async () => {
    const users = await prisma.user.findMany();
    return users;
}

const createUser = async (userData) => {
    // Validate password is provided
    if (!userData.password) {
        throw new Error('Password is required');
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user data object without confirmPassword
    const { confirmPassword, ...user } = userData;
    
    const newUser = await prisma.user.create({ 
        data: {
            ...user,
            password: hashedPassword
        }
    });
    return newUser;
}

const findUserByEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });
    return user;
}

const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

const login = async (email, password) => {
    console.log('Finding user by email:', email);
    // Find user by email
    const user = await findUserByEmail(email);
    
    console.log('User found:', user ? 'yes' : 'no');
    
    if (!user) {
        return { success: false, message: 'Invalid email or password' };
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
        return { success: false, message: 'Invalid email or password' };
    }
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
}

module.exports = {
    getAllUsers,
    createUser,
    findUserByEmail,
    verifyPassword,
    login
}