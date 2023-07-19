const { UnauthorizedError } = require("../expressError");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");

describe("ensureCorrectUserOrAdmin", function () {
  test("works: admin", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "admin", isAdmin: true } } };
    const next = jest.fn();

    ensureCorrectUserOrAdmin(req, res, next);

    // Ensure next middleware function is called
    expect(next).toHaveBeenCalled();
    // Ensure no error is thrown
    expect(next.mock.calls[0][0]).toBeFalsy();
  });

  test("works: same user", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    const next = jest.fn();

    ensureCorrectUserOrAdmin(req, res, next);

    // Ensure next middleware function is called
    expect(next).toHaveBeenCalled();
    // Ensure no error is thrown
    expect(next.mock.calls[0][0]).toBeFalsy();
  });

  test("unauth: mismatch", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "otheruser", isAdmin: false } } };
    const next = jest.fn();

    ensureCorrectUserOrAdmin(req, res, next);

    // Ensure next middleware function is not called
    expect(next).not.toHaveBeenCalled();
    // Ensure UnauthorizedError is thrown
    expect(next.mock.calls.length).toBe(1);
    expect(next.mock.calls[0][0] instanceof UnauthorizedError).toBeTruthy();
  });

  test("unauth: if not admin", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    const next = jest.fn();

    ensureCorrectUserOrAdmin(req, res, next);

    // Ensure next middleware function is not called
    expect(next).not.toHaveBeenCalled();
    // Ensure UnauthorizedError is thrown
    expect(next.mock.calls.length).toBe(1);
    expect(next.mock.calls[0][0] instanceof UnauthorizedError).toBeTruthy();
  });
});
