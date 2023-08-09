const { sqlForPartialUpdate } = require('./sql');

const dataToUpdate = {
    firstName: "Aliya",
    age: 32,
};

const jsToSql = {
    firstName: "first_name",
};

describe("sqlForPartialUpdate", () => {
    test("Correctly generates SQL for partial update", () => {
        const expectedResult = {
            setCols: '"first_name"=$1, "age"=$2',
            values: ["Aliya", 32]
        };

        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(result).toEqual(expectedResult);
    })

    test("Throws BadRequestError for empty dataToUpdate", () => {
        const emptyDataToUpdate = {};
        expect(() => {
            sqlForPartialUpdate(emptyDataToUpdate, jsToSql);
        }).toThrow("No data");
     })

     test("Correctly generates SQL when jsToSql is not provided", () => {
        const expectedResult = {
            setCols: '"firstName"=$1, "age"=$2',
            values: ["Aliya", 32],
        };

        const result = sqlForPartialUpdate(dataToUpdate);
        expect(result).toEqual(expectedResult);
     })
})
