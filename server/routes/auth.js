const express = require('express');
const router = express.Router();

const argon2 = require('argon2');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');

//Route get api/auth
//check if user logged in
// public accessToken

router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// route POST api/auth/register
// register User
// public
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  //simple validation
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: 'Missing user and/or password' });

  try {
    // check for existing user
    const user = await User.findOne({ username });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: 'Username already taken' });

    // all good
    const hashedPassword = await argon2.hash(password);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // return token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      success: true,
      message: 'User created successfully',
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'internal server error' });
  }
});

// Login Route
// ROUTE /api/auth/login
// Login User
// public

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  //simple validation
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: 'Missing username or password' });

  try {
    // Check for existing user
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect username or password' });

    // Username found
    const passwordValid = await argon2.verify(user.password, password);

    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect username or password' });

    // All good
    // return token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      success: true,
      message: 'User logged in successfully',
      accessToken,
    });
    res.json();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
module.exports = router;
