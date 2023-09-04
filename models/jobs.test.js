const Job = require("../models/jobs.js");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 50000,
    equity: "0.1",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({ ...newJob, id: expect.any(Number) });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
       FROM jobs
       WHERE id = $1`,
      [job.id]
    );
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "New Job",
        salary: 50000,
        equity: "0.1", // Change the expected value to a string with 2 decimal places
        company_handle: "c1",
      },
    ]);
  });

  test("bad request with non-existent companyHandle", async function () {
    try {
      await Job.create({ ...newJob, companyHandle: "nonexistent" });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toContain("Company does not exist");
    }
  });
});


/************************************** update */

describe("update", function () {
    test("works", async function () {
      // console.log(await Job.get({}))
      const newJob = {
        title: "Updated Job",
        salary: 75000,
        equity: 0.05,
        companyHandle: "c1", // Add companyHandle property to ensure job exists
      };

      const existingJob = await Job.getFirstJob()
      console.log("Hello", existingJob)

      let job = await Job.update(existingJob.id, newJob);
      expect(job).toEqual({
        id: existingJob.id,
        ...newJob,
      });

      const result = await db.query(
        `SELECT id, title, salary, equity, company_handle
         FROM jobs
         WHERE id = ${existingJob.id}`
      );
      expect(result.rows).toEqual([
        {
          id: existingJob.id,
          title: "Updated Job",
          salary: 75000,
          equity: "0.05",
          company_handle: "c1",
        },
      ]);
    });

    test("not found if job does not exist", async function () {
      try {
        await Job.update(100, {
          title: "Updated Job",
          salary: 75000,
          equity: "0.05",
        });
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
        expect(err.message).toContain("Job not found");
      }
    });

    test("bad request with no update data", async function () {
      try {
        await Job.update(1, {});
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
        expect(err.message).toContain("No data");
      }
    });
  });

  /************************************** get */

  describe("get", function () {
    test("works", async function () {
      console.log("Job:", job)
      let job = await Job.getFirstJob();
      console.log("Job:", job)
      // const randomJob = await Job.get(randomJob.id, job)
      expect(job).toEqual({
        id: 1,
        title: "Job1",
        salary: 60000,
        equity: "0.10",
        companyHandle: "c1",
      });
    });

    test("not found if job does not exist", async function () {
      try {
        await Job.get(100);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
        expect(err.message).toContain("Job not found");
      }
    });
  });

  /************************************** remove */

  describe("remove", function () {
    test("works", async function () {
      const randJob = await Job.getFirstJob()
      console.log("Randjob:", randJob)
      await Job.remove(randJob.id);
      const res = await db.query(`SELECT id FROM jobs WHERE id=${randJob.id}`);
      expect(res.rows.length).toEqual(0);
    });

    test("not found if job does not exist", async function () {
      try {
        await Job.remove(100);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
        expect(err.message).toContain("Job not found");
      }
    });
  });

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll({});
    expect(jobs.length).toBeGreaterThan(0);
  });

  test("works: filter by title", async function () {
    let jobs = await Job.findAll({ title: "Engineer Job" });
    expect(jobs.length).toBeGreaterThan(0);
  });

  test("works: filter by minSalary", async function () {
    let jobs = await Job.findAll({ minSalary: 60000 });
    expect(jobs.length).toBeGreaterThan(0);
  });

  test("works: filter by hasEquity", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs.length).toBeGreaterThan(0);
  });

  test("works: filter by multiple criteria", async function () {
    let jobs = await Job.findAll({
      title: "Engineer",
      minSalary: 70000,
      hasEquity: true,
    });
    expect(jobs.length).toBeGreaterThan(0);
  });

  test("returns empty array if no matches found", async function () {
    let jobs = await Job.findAll({ title: "NonExistentJob" });
    expect(jobs).toEqual([]);
  });
});

/************************************** getAllJobsForCompany */

describe("getAllJobsForCompany", function () {
  test("works", async function () {
    const companyHandle = "c1";
    let jobs = await Job.getAllJobsForCompany(companyHandle);
    console.log(jobs)
    expect(jobs.length).toBeGreaterThan(0);
  });

  test("returns empty array if no jobs found for the company", async function () {
    const companyHandle = "nonexistent";
    let jobs = await Job.getAllJobsForCompany(companyHandle);
    expect(jobs).toEqual([]);
  });
});
