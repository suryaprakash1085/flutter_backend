const express = require('express');
const router = express.Router();
const { createUser, getUser, updateUser, deleteUser,getAllUsers } = require('../controllers/userController');

// POST route to create a user
router.post('/users', createUser);

// all user get
router.get('/users', getAllUsers);

//single user get
router.get('/users/:user_id', getAllUsers);

// PUT route to update user details by user_id
router.put('/users/:user_id', updateUser);

// DELETE route to delete user by user_id
router.delete('/users/:user_id', deleteUser);

module.exports = router;
