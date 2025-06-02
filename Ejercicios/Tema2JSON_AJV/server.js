const express = require("express");
const fs = require("fs");
const Ajv2020 = require("ajv/dist/2020");  // 👈 Este es el cambio clave

const app = express();
const ajv = new Ajv2020(); // 👈 Usamos el validador compatible con Draft 2020-12
app.use(express.json());

const paintingSchema = JSON.parse(fs.readFileSync("./schemas/painting.schema.json"));
const squadSchema = JSON.parse(fs.readFileSync("./schemas/squad.schema.json"));

const validatePainting = ajv.compile(paintingSchema);
const validateSquad = ajv.compile(squadSchema);

app.post("/validate/painting", (req, res) => {
  const valid = validatePainting(req.body);
  if (valid) {
    res.status(200).send({ message: "JSON Painting válido ✅" });
  } else {
    res.status(400).send({ errors: validatePainting.errors });
  }
});

app.post("/validate/squad", (req, res) => {
  const valid = validateSquad(req.body);
  if (valid) {
    res.status(200).send({ message: "JSON Squad válido ✅" });
  } else {
    res.status(400).send({ errors: validateSquad.errors });
  }
});

app.listen(3000, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});
