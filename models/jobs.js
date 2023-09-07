"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  static async create(data) {
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [ data.title,
        data.salary,
        data.equity,
        data.companyHandle
      ]);
    const job = result.rows[0];

    return job;
  }

  static async findAll({ title, minSalary, hasEquity } = {}) {
    let baseQuery = `
      SELECT j.id,
             j.title,
             j.salary,
             j.equity,
             j.company_handle AS "companyHandle",
             c.name AS "companyName"
      FROM jobs j
          LEFT JOIN companies AS c ON c.handle = j.company_handle`;
    let whereExpressions = [];
    let queryValues = [];


    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
        whereExpressions.push(`equity > 0`);
    }

    if (title !== undefined) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
   }

    if (whereExpressions.length > 0) {
      baseQuery += " WHERE " + whereExpressions.join(" AND ");
    }

    // Convert salary and equity to numbers for each job
    baseQuery += " ORDER BY title";
    const jobsRes = await db.query(baseQuery, queryValues);
    return jobsRes.rows;
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

    const compRes = await db.query(
           `SELECT handle,
                   name,
                   description,
                   num_employees AS "numEmployees",
                   logo_url AS "logoUrl"
            FROM companies
            WHERE handle = $1`, [job.companyHandle]);

    delete job.companyHandle;
    job.company = compRes.rows[0];

    return job;
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});

    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                      SET ${setCols}
                      WHERE id = ${id}
                      RETURNING id,
                                title,
                                salary,
                                equity,
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    console.log("Hello", id, data)
    const job = result.rows[0];
    console.log("Job:", job)
    if (!job) throw new NotFoundError(`Job not found: ${id}`);

    return job;
  }

  static async getFirstJob() {
    const res = await db.query(
      `SELECT * FROM jobs LIMIT 1`
    )
    return res.rows[0]
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
