const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const Post = require('../models/Post');

// get post Route
// private route
router.get('/', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).populate('user', [
      'username',
    ]);
    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// post Route
// private route
router.post('/', verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;

  //simple validation
  if (!title)
    return res
      .status(400)
      .json({ success: false, message: 'Title is required' });

  try {
    const newPost = new Post({
      title,
      description,
      url: url.startsWith('https://') ? url : `https://${url}`,
      status: status || 'TO LEARN',
      user: req.userId,
    });

    await newPost.save();

    res.json({ success: true, message: 'happy learning!', newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Interal server error' });
  }
});

// update Route
// update post
router.put('/:id', verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;

  //simple validation
  if (!title)
    return res
      .status(400)
      .json({ success: false, message: 'Title is required' });

  try {
    let updatedPost = {
      title,
      description: description || '',
      url: (url.startsWith('https://') ? url : `https://${url}`) || '',
      status: status || 'TO LEARN',
    };

    const postUpdateCondition = { _id: req.params.id, user: req.userId };

    updatedPost = await Post.findOneAndUpdate(
      postUpdateCondition,
      updatedPost,
      { new: true }
    );

    // user not authorised to update post
    if (!updatedPost)
      return res.status(401).json({
        success: false,
        message: 'Post not found or user not authorised',
      });

    res.json({ success: true, message: 'Excellent progress', updatedPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Interal server error' });
  }
});

// delete Route
// private route
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const postDeletedCondition = { _id: req.params.id, user: req.userId };

    const deletedPost = await Post.findByIdAndDelete(postDeletedCondition);

    // user not authorised to update post
    if (!deletedPost)
      return res.status(401).json({
        success: false,
        message: 'Post not found or user not authorised',
      });

    res.json({
      success: true,
      message: 'deleted post successfully',
      post: deletedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Interal server error' });
  }
});

module.exports = router;
