// Function to find user by email address
const getUserByEmail = function (email, database) {
  let user;
  for (const userid in database) {
    user = database[userid];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
}

module.exports = { getUserByEmail };



