const ajv = require("./schemas")
const person_json_ok = {  "firstName": "John",  "lastName": "Doe",  "age": 21}
const person_json_error = {  "firstName": "John",  "lastName": 2,  "age": -10}
validatePerson(person_json_ok);
validatePerson(person_json_error);
function validatePerson(json) {
    const validate = ajv.getSchema("person");
    if (validate(json)) {
        console.log("JSON OK");
    } else {
        console.log("JSON NOT OK");
        console.log(validate.errors);
    }
}
