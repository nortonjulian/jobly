const { UnauthorizedError } = require("../expressError");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");

describe("ensureCorrectUserOrAdmin", function () {
  test("works: admin", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "admin", isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("works: same user", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("unauth: mismatch", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "otheruser", isAdmin: false } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("unauth: if not admin", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    const next = function (err) {
      console.log("Error:", err);
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    console.log("res.locals.user:", res.locals.user);
    console.log("req.params.username:", req.params.username);
    ensureCorrectUserOrAdmin(req, res, next);
  });
});
