const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

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

const findUserByEmail = (email) => {
  for (const userid in users) {
    const user = users[userid];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}


app.get("/login", (req, res) => {
  res.render("urls_login");
})

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  if (!email || !password) {
    return res.status(400).send("Invalid credentials");
  }

  let user = findUserByEmail(email);
  if (user) {
    return res.status(400).send("Invalid credentials");
  }

  user = {
    id,
    email,
    password
  }

  users[id] = user;

  res.cookie('user_id', id);
  res.redirect('/urls');
})

app.get("/register", (req, res) => {
  res.render("urls_reg");
})

app.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  if (!email || !password) {
    return res.status(403).send("Invalid credentials");
  }

  const user = findUserByEmail(email);

  if (!user) {
    return res.status(403).send("Invalid credentials");
  }
  else if (user.password.localeCompare(password) !== 0) {
    return res.status(403).send("Invalid credentials");
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];

  const templateVars = { user }
  res.render("urls_new", templateVars);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newLongURL;
  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
})

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { longURL: urlDatabase[req.params.shortURL], shortURL: req.params.shortURL, user: user };
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})


app.get("/", (req, res) => {
  res.send('Hello!');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
})

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let randomString = '';

  for (let j = 0; j < 6; j++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }

  return randomString;
}
