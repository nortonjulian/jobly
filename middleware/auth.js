"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const { SECRET_KEY } = require("../config");

/** Middleware: Authenticate user. */
function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const tokenFromParams = req.query._token;
    const token = tokenFromBody || tokenFromParams;

    if (token) {
      const payload = jwt.verify(token, SECRET_KEY);
      res.locals.user = payload.user; // Correct the assignment here
    }
  } catch (err) {
    // ignore if invalid token
  }
  return next();
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Requires user is admin. */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Requires user is admin or same user. */

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    const requestedUsername = req.params.username

    console.log("User:", user);
    console.log("Requested Username:", requestedUsername);

    // Check if user is an admin or the same user as requested
    if (!(user && (user.isAdmin || user.username === requestedUsername))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
};
