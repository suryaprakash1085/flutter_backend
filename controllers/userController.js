const { v4: uuidv4 } = require('uuid');
const knex = require('../knex');  // Adjust the path as needed
const jwt = require('jsonwebtoken');  // Import the jsonwebtoken package

// Secret key for signing the JWT token
const JWT_SECRET = 'your-secret-key';  // You should store this in environment variables in production

// Function to create a user


const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check for missing fields
  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the email already exists in the database
    const existingUser = await knex('usercollection').where('email', email).first();
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Generate a new UUID for the user_id
    const user_id = uuidv4();

    // Generate a JWT token (only using the username and email in the token)
    const token = jwt.sign({ username, email }, JWT_SECRET, { expiresIn: '1h' });

    // Insert the new user into the database, including the token in the 'token' column
    await knex('usercollection').insert({
      user_id,       // Use the generated UUID for user_id
      user_name: username,  // Ensure this matches your DB column name
      email,
      password,
      token,
      role  // Insert the role of the user
    });

    // Send the response with the token
    res.status(201).json({
      message: 'User inserted successfully',
      token  // Return the JWT token in the response
    });
  } catch (err) {
    console.error('Error during insert operation:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      // This error occurs when the email is already in the database due to the UNIQUE constraint
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await knex('usercollection').select('*');

    // If no users are found, return a 404
    if (users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    // Optionally remove passwords from user data before sending response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // Send the list of users
    res.status(200).json(usersWithoutPassword);
  } catch (err) {
    console.error('Error during get all users operation:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};


// Function to get a user by email or user_id
const getUser = async (req, res) => {
  const { user_id, email } = req.query;  // Accept user_id or email as query parameters

  if (!user_id && !email) {
    return res.status(400).json({ error: 'user_id or email is required' });
  }

  try {
    let user;

    if (user_id) {
      // Fetch user by user_id
      user = await knex('usercollection').where('user_id', user_id).first();
    } else if (email) {
      // Fetch user by email
      user = await knex('usercollection').where('email', email).first();
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data excluding password
    const { password, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);  // Send user data without password
  } catch (err) {
    console.error('Error during get operation:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};


// Function to update a user by user_id
const updateUser = async (req, res) => {
  const { user_id } = req.params;  // user_id is passed as a URL parameter
  const { username, email, password, role } = req.body;  // Fields to update

  if (!user_id || (!username && !email && !password && !role)) {
    return res.status(400).json({ error: 'user_id and at least one field (username, email, password, role) are required' });
  }

  try {
    // Check if the user exists before updating
    const existingUser = await knex('usercollection').where('user_id', user_id).first();
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare update fields (only update the fields that are provided)
    const updateData = {};
    if (username) updateData.user_name = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (role) updateData.role = role;

    // Update the user in the database
    await knex('usercollection').where('user_id', user_id).update(updateData);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error during update operation:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};


// Function to delete a user by user_id
const deleteUser = async (req, res) => {
  const { user_id } = req.params;  // user_id is passed as a URL parameter

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  try {
    // Check if the user exists before attempting to delete
    const existingUser = await knex('usercollection').where('user_id', user_id).first();
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user from the database
    await knex('usercollection').where('user_id', user_id).del();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error during delete operation:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
};


module.exports = { createUser,getUser,updateUser,deleteUser,getAllUsers };  // Export the controller function
