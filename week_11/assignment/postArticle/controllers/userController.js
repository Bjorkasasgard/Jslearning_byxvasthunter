const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
    const users = await userService.getAllUsers();
    res.render('index', { users: users, user: req.user });
}

const formUser = async (req, res) => {
    res.render('auth/register', { error: null, formData: null, title: 'Register' });
}

const submitUser = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.render('auth/register', { 
                error: 'Name, email, and password are required',
                formData: req.body,
                title: 'Register'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.render('auth/register', { 
                error: 'Password must be at least 6 characters long',
                formData: req.body,
                title: 'Register'
            });
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            return res.render('auth/register', { 
                error: 'Passwords do not match',
                formData: req.body,
                title: 'Register'
            });
        }

        const user = await userService.createUser(req.body);
        res.redirect('/login');
    } catch (error) {
        console.error('Error creating user:', error);
        res.render('auth/register', { 
            error: error.message || 'Failed to create user. Email may already be in use.',
            formData: req.body,
            title: 'Register'
        });
    }
}

const loginForm = (req, res) => {
    res.render('auth/login', { error: null, title: 'Login' });
}

const login = async (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
        return res.render('auth/login', { error: 'Email and password are required', title: 'Login' });
    }
    
    const result = await userService.login(email, password);
    
    console.log('Login result:', result.success ? 'success' : result.message);
    
    if (!result.success) {
        return res.render('auth/login', { error: result.message, title: 'Login' });
    }
    
    // Set session data
    req.session.userId = result.user.id;
    req.session.userEmail = result.user.email;
    req.session.userName = result.user.name;
    req.session.userRole = result.user.role;
    req.session.user = result.user; // Add this for isAuthenticated middleware
    
    console.log('Redirecting to /dashboard');
    
    // Redirect to dashboard
    res.redirect('/dashboard');
}

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        res.redirect('/login');
    });
}

module.exports = {
    getAllUsers,
    formUser,
    submitUser,
    loginForm,
    login,
    logout
}