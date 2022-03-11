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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};

// set up some sample users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "111"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "222"
  }
}


// Function to find user by email address
const findUserByEmail = (email) => {
  let user;
  for (const userid in users) {
    user = users[userid];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

const urlsForUser = function (id) {
  let urls = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url]["userID"]) {
      urls[url] = urlDatabase[url]["longURL"];
    }
  }
  return urls;
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

  if (!user) {
    res.redirect("/login");
    return;
  }

  const templateVars = { user }
  // Show create new url page
  res.render("urls_new", templateVars);
})

// Delete URL from our URL database and then redirect to urls page
app.post("/urls/:shortURL/delete", (req, res) => {

  // If the user is not logged in, the app should return HTML with a relevant error message
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(400).send("Invalid credentials");
  }

  // If a URL with the given id does not exist, the app should return HTML with a relevant error message
  if (typeof (urlDatabase[req.params.shortURL]) === "undefined") {
    return res.status(400).send("URL not found");
  }

  // If the user is logged in but does not own the URL with the given id, the app should return HTML with a relevant error message
  const urls = urlsForUser(req.cookies["user_id"]);
  const lURL = urls[req.params.shortURL];
  if (typeof (lURL) === "undefined") {
    return res.status(400).send("You do not own the URL");
  }

  // User is logged in and the user is the owner of the URL, perform delete 
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');

})

// Update existing URL with new one and then redirect to urls page
app.post("/urls/:id", (req, res) => {

  // If the user is not logged in, the app should return HTML with a relevant error message
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(400).send("Invalid credentials");
  }

  // If a URL with the given id does not exist, the app should return HTML with a relevant error message
  if (typeof (urlDatabase[req.params.id]) === "undefined") {
    return res.status(400).send("URL not found");
  }

  // If the user is logged in but does not own the URL with the given id, the app should return HTML with a relevant error message
  const urls = urlsForUser(req.cookies["user_id"]);
  const lURL = urls[req.params.id];
  if (typeof (lURL) === "undefined") {
    return res.status(400).send("You do not own the URL");
  }

  // User is logged in and the user is the owner of the URL, update the URL
  urlDatabase[req.params.id]["longURL"] = req.body.newLongURL;
  res.redirect('/urls');
})

// Create URL record
app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];

  if (!user) {
    return res.status(400).send("Invalid credentials");
  }

  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {}
  urlDatabase[shortURL]["longURL"] = req.body.longURL;
  urlDatabase[shortURL]["userID"] = user.id;

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
  const urls = urlsForUser(req.cookies["user_id"]);
  const lURL = urls[req.params.shortURL]
  const user = users[req.cookies["user_id"]];
  const templateVars = { longURL: lURL, shortURL: req.params.shortURL, user: user };

  res.render("urls_show", templateVars);
})

// By providing short URL, redirect to long URL page
app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  const user = users[req.cookies["user_id"]];

  if (!user) {
    res.redirect(longURL + '?e=' + encodeURIComponent('User Id does not exist'));
  }
  else {
    res.redirect(longURL);
  }

})

// Default page of Tiny App
app.get("/", (req, res) => {
  res.send('Hello!');
});

// Show a page with all URLs
// Should not be exposed and comment out in production
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
