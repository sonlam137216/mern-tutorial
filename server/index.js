const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')

require('dotenv').config()

const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mern-learnit2.gn9l7.mongodb.net/mern-learnit2?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log('MongoDb connected');
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

connectDB();

const app = express();

app.use(express.json())
app.use(cors())

app.use('/api/auth', authRouter)

app.use('/api/posts', postRouter)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
