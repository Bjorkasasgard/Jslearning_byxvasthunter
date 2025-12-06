const userService = require('../services/userServices');

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.render('index', { users: users });
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).render('error', { message: 'Server error while fetching users' });
    }
}

const formUser = async (req, res) => {
    res.render('form');
}

const submitUser = async (req, res) => {
    try {
        await userService.createUser(req.body);
        res.redirect('/');
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).render('error', { message: 'Server error while creating user' });
    }
}

const editUser = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).render('error', { message: 'User not found' });
        }
        res.render('edit', { user: user });
    } catch (err) {
        console.error('Error fetching user for edit:', err);
        res.status(500).render('error', { message: 'Server error' });
    }
}

const updateUser = async (req, res) => {
    try {
        await userService.updateUser(req.params.id, req.body);
        res.redirect('/');
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).render('error', { message: 'Server error while updating user' });
    }
}

const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
    } catch (err) {
        console.error('Error deleting user:', err);
        // Continue to redirect so UI doesn't crash; could show a flash message instead
    }
    res.redirect('/');
}

module.exports = {
    getAllUsers,
    formUser,
    submitUser,
    editUser,
    updateUser,
    deleteUser
}