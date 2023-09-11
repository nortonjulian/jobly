"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/jobs");
const { createToken } = require("../helpers/tokens");

let u1Token; // Declare u1Token variable

const testJobIds = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM jobs");

  await Company.create({
    handle: "c1",
    name: "C1",
    numEmployees: 1,
    description: "Desc1",
    logoUrl: "http://c1.img",
  });
  await Company.create({
    handle: "c2",
    name: "C2",
    numEmployees: 2,
    description: "Desc2",
    logoUrl: "http://c2.img",
  });
  await Company.create({
    handle: "c3",
    name: "C3",
    numEmployees: 3,
    description: "Desc3",
    logoUrl: "http://c3.img",
  });


  const job1 = await Job.create({
    title: "Job 1",
    salary: 50000,
    equity: "0.1",
    companyHandle: "c1",
  });
  const job2 = await Job.create({
    title: "Job 2",
    salary: 60000,
    equity: "0.2",
    companyHandle: "c2",
  });
  const job3 = await Job.create({
    title: "Job 3",
    salary: 70000,
    equity: "0.3",
    companyHandle: "c3",
  });

  testJobIds.push(job1.id, job2.id, job3.id);

  await User.register({
    username: "admin",
    firstName: "Admin",
    lastName: "User",
    email: "admin@user.com",
    password: "adminpassword",
    isAdmin: true,
  });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });


  const adminUser = await User.get("admin");
  u1Token = createToken({ username: adminUser.username, isAdmin: true });
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const adminToken = createToken({ username: "admin", isAdmin: true });
module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  adminToken,
  testJobIds,
  u1Token,
};
