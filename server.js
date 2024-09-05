const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

const cookieOptions = {
  maxAge: 900000, // 15 minutes
  httpOnly: false,
  secure: false,
  sameSite: 'strict',
  path: '/',
};

const pool = new Pool({
  user: 'lisawang',
  password: 'Password',
  host: 'localhost',
  port: 5432,
  database: 'chatdb'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());


// Route Handlers

app.get('/', (req, res) => {
  try {
    if (req.cookies.username) {
      console.log("cookies found");
      res.redirect('/posts');
    } else {
      console.log("no cookies found");
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/posts', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'posts.html'));
});

app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registration.html'));
});

app.post('/login', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows.length > 0) {
      res.cookie('username', username, cookieOptions); // username should be a string, not an array
      console.log('Cookie has been set!');
      res.redirect('/posts');
      console.log('logged in');
    } else {
      res.send('<script>alert("Invalid username or password!")</script>')
      console.log('invalid username or password');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/register', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      res.send('<script>alert("Username already Exists! Please choose another username!")</script>')
    } else {
      await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
      res.send('<script>alert("Registration Success! Please go back to the login page!")</script>')
      // res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('username', cookieOptions);
  res.redirect('/');
});

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('fetchMessages', async () => {
    try {
      const result = await pool.query('SELECT * FROM posts ORDER BY timestamp ASC'); // Consistency in table names
      console.log(result.rows);
      socket.emit('existingMessages', result.rows);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  });

  socket.on('newMessage', async (msg) => {
    const username = msg.username;
    const content = msg.content;
    try {
      const result = await pool.query(
        'INSERT INTO posts (username, message, timestamp) VALUES ($1, $2, now()) RETURNING *',
        [username, content]
      );
      io.emit('broadcastMessage', result.rows[0]);
    } catch (err) {
      console.error('Error inserting message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});