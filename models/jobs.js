"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  static async create({ title, salary, equity, companyHandle }) {
    // Convert equity to a number with two decimal places
    equity = parseFloat(equity).toFixed(2);

    const companyCheck = await db.query(
      `SELECT handle
       FROM companies
       WHERE handle = $1`,
      [companyHandle]
    );

    if (!companyCheck.rows[0])
      throw new BadRequestError(`Company does not exist: ${companyHandle}`);

    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                      SET ${setCols}
                      WHERE id = ${idVarIdx}
                      RETURNING id,
                                title,
                                salary,
                                equity,
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`Job not found: ${id}`);

    // Convert salary and equity to numbers
    job.salary = parseFloat(job.salary);
    job.equity = parseFloat(job.equity);

    return job;
  }

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
      FROM jobs
      WHERE id = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`Job not found: ${id}`);

    // Convert salary and equity to numbers
    job.salary = parseFloat(job.salary);
    job.equity = parseFloat(job.equity);

    return job;
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE
       FROM jobs
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`Job not found: ${id}`);

    // Convert salary and equity to numbers
    job.salary = parseFloat(job.salary);
    job.equity = parseFloat(job.equity);
  }

  static async findAll({ title, minSalary, hasEquity }) {
    let baseQuery = `
      SELECT id,
             title,
             salary,
             equity,
             company_handle AS "companyHandle"
      FROM jobs`;
    let whereExpressions = [];
    let queryValues = [];

    if (title) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
      whereExpressions.push(`equity > 0`);
    }

    if (whereExpressions.length > 0) {
      baseQuery += " WHERE " + whereExpressions.join(" AND ");
    }

    const jobsRes = await db.query(baseQuery, queryValues);

    // Convert salary and equity to numbers for each job
    for (let job of jobsRes.rows) {
      job.salary = parseFloat(job.salary);
      job.equity = parseFloat(job.equity);
    }

    return jobsRes.rows;
  }

  static async getAllJobsForCompany(companyHandle) {
    const jobsRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity
      FROM jobs
      WHERE company_handle = $1`,
      [companyHandle]
    );

    // Convert salary and equity to numbers for each job
    for (let job of jobsRes.rows) {
      job.salary = parseFloat(job.salary);
      job.equity = parseFloat(job.equity);
    }

    return jobsRes.rows;
  }
}

module.exports = Job;
