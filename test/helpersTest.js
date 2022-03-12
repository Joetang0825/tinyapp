const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

// Sample user database for testing purpose
const testUsers = {
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
};

// Return a valid user for email address found in the testUsers database
describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
});

// Return undefined for email address not found in the testUsers databse
describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user4@example.com", testUsers)
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});