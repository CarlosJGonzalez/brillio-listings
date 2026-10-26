// Login logic: checks the username and password against data/users.json
// and issues a random session token that is kept in memory.
const crypto = require("crypto");
const users = require("../data/users.json");

// token -> user (cleared when the server restarts)
const sessions = new Map();

function login(username, password) {
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return null;
  const token = crypto.randomBytes(24).toString("hex");
  const { password: _omit, ...safeUser } = user; // never send the password back
  sessions.set(token, safeUser);
  return { token, user: safeUser };
}

function getUser(token) {
  return sessions.get(token) || null;
}

function logout(token) {
  sessions.delete(token);
}

module.exports = { login, getUser, logout };