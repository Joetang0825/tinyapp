const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

// set up URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

// set up some sample users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

// Function to find user by email address
const findUserByEmail = (email) => {
  for (const userid in users) {
    const user = users[userid];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

// Show login page
app.get("/login", (req, res) => {
  res.render("urls_login");
})

// Login using email address and password
app.post("/login", (req, res) => {

  // Remove whitespace at the front and end of email and password 
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  // email is empty or password is empty
  if (!email || !password) {
    return res.status(403).send("Invalid credentials");
  }

  // find user by email address by calling findUserByEmail function
  const user = findUserByEmail(email);

  // User does not exist, return status code 403
  if (!user) {
    return res.status(403).send("Invalid credentials");
  }
  // User does exist but password does not match, return status code 403
  else if (user.password.localeCompare(password) !== 0) {
    return res.status(403).send("Invalid credentials");
  }

  // User exists and set the cookie using user ID
  res.cookie('user_id', user.id);

  // Go back to the urls page
  res.redirect('/urls');
})

// Show register page
app.get("/register", (req, res) => {
  res.render("urls_reg");
})

// Register using email address and password
app.post("/register", (req, res) => {

  // Generate a random ID for the user
  const id = generateRandomString();
  // Remove whitespace at the front and end of email and password 
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  // email is empty or password is empty
  if (!email || !password) {
    return res.status(400).send("Invalid credentials");
  }

  // find user by email address by calling findUserByEmail function
  let user = findUserByEmail(email);

  // Email address already exists, return status code 400
  if (user) {
    return res.status(400).send("Invalid credentials");
  }

  // Create a new user and store it
  user = {
    id,
    email,
    password
  }
  users[id] = user;

  // Set cookie user_id with newly generated ID
  res.cookie('user_id', id);

  // Go back to the urls page
  res.redirect('/urls');
})


// User logged out, clear cookie user_id
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  // Go back to the urls page
  res.redirect('/urls');
})

// Create new url
app.get("/urls/new", (req, res) => {
  // Retrieve user by using user_id cookie
  const user = users[req.cookies["user_id"]];

  const templateVars = { user }
  // Show create new url page
  res.render("urls_new", templateVars);
})

// Delete URL from our URL database and then redirect to urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

// Update existing URL with new one and then redirect to urls page
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newLongURL;
  res.redirect('/urls');
})

// Create URL record
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
})

// Show list of URLs from our URL database
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
})

// Show page to Edit URL
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { longURL: urlDatabase[req.params.shortURL], shortURL: req.params.shortURL, user: user };
  res.render("urls_show", templateVars);
})

// By providing short URL, redirect to long URL page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

// Default page of Tiny App
app.get("/", (req, res) => {
  res.send('Hello!');
});

// Show a page with all URLs
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

// Display Hello World when URL is set to /hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Testing Scope 
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
})

// Testing Scope
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
})

// Listen for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Function to generate a random alphanumeric user id
function generateRandomString() {
  // String to store all numbers and characters
  let characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let randomString = '';

  // Randomly pick 6 elements from characters
  for (let j = 0; j < 6; j++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }

  return randomString;
}
