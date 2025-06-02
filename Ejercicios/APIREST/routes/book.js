const express = require('express');
const { ObjectId } = require('mongodb');
const dbo = require('../db/conn');
const router = express.Router();

const COLLECTION = 'books';
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS) || 10; //Esto hace que los resultados máximos sean 10 si no se especifica en el .env

// Obtener todos los libros
// Ruta GET para obtener libros (con paginación y proyección de campos)
router.get('/', async (req, res) => {
  
  // Valor máximo de resultados por página
  let limit = MAX_RESULTS;

  // Si se especifica un límite en la query, se usa el mínimo entre el recibido y el máximo permitido
  if (req.query.limit) {
    limit = Math.min(parseInt(req.query.limit), MAX_RESULTS);
  }

  // Parámetro de paginación para continuar desde el último ID recibido
  let next = req.query.next;

  // Consulta MongoDB inicial vacía
  let query = {};

  // Si viene `next`, buscamos documentos con _id menor (paginación hacia atrás)
  if (next) {
    query = { _id: { $lt: new ObjectId(next) } };
  }

  // Conexión con la base de datos
  const dbConnect = dbo.getDb();

  try {
    // Ejecutamos la consulta:
    let results = await dbConnect
      .collection(COLLECTION) // accedemos a la colección (por ejemplo, 'books')
      .find(query)            // aplicamos filtro si viene `next`
      .project({              // proyección: solo devolvemos estos campos
        "_id": 1,
        "title": 1,
        "author": 1
      })
      .sort({ _id: -1 })      // orden descendente por _id (los más recientes primero)
      .limit(limit)           // límite de resultados
      .toArray();             // convertimos a array para poder trabajar con los datos

      //Otras opciones de posibles para mongoDB son:
        // .find(query, { projection: { _id: 1, title: 1, author: 1 } })
        // .find(query).project({ _id: 1, title: 1, author: 1 })

    // Añadimos un link HATEOAS para cada libro
    results = results.map(book => ({
      ...book,
      link: `http://localhost:${process.env.PORT || 3000}${process.env.BASE_URI}/book/${book._id}`
    }));

    // Si el número de resultados es igual al límite, devolvemos el ID del último libro para paginar
    next = results.length === limit ? results[results.length - 1]._id : null;

    // Respondemos con los libros y el `next` para paginar
    res.json({ results, next }).status(200);

  } catch (err) {
    // Si algo falla, enviamos error 400
    res.status(400).send('Error searching for books');
  }
});

// Obtener un libro por ID
router.get('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = { _id: new ObjectId(req.params.id) };

  try {
    let result = await dbConnect
      .collection(COLLECTION)
      .findOne(query, {
        projection: {
          "_id": 1,
          "title": 1,
          "author": 1
        }
      });

    if (!result) {
      return res.status(404).send('Book not found');
    }

    // Añadimos el link HATEOAS al libro encontrado
    result.link = `http://localhost:${process.env.PORT || 3000}${process.env.BASE_URI}/book/${result._id}`;

    res.json(result).status(200);
  } catch (err) {
    res.status(400).send('Error searching for book');
  }
});

// Añadir un libro
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  
  try {
    let result = await dbConnect
      .collection(COLLECTION)
      .insertOne(req.body);

    // Añadimos el link HATEOAS al libro recién creado
    const newBook = {
      ...req.body,
      _id: result.insertedId,
      link: `http://localhost:${process.env.PORT || 3000}${process.env.BASE_URI}/book/${result.insertedId}`
    };

    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).send('Error adding book');
  }
});

// Eliminar un libro por ID
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send('Invalid book ID');
  }

  const dbConnect = dbo.getDb();
  let query = { _id: new ObjectId(id) };

  try {
    let result = await dbConnect
      .collection(COLLECTION)
      .deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).send('Book not found');
    }

    res.status(200).send('Book deleted successfully');
  } catch (err) {
    res.status(400).send('Error deleting book');
  }
});

// PATCH para actualizar un libro por ID
router.patch('/:id', async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send('Invalid book ID');
  }

  const dbConnect = dbo.getDb();
  let query = { _id: new ObjectId(id) };
  let update = { $set: req.body };

  try {
    let result = await dbConnect
      .collection(COLLECTION)
      .updateOne(query, update);

    if (result.matchedCount === 0) {
      return res.status(404).send('Book not found');
    }

    res.status(200).send('Book updated successfully');
  } catch (err) {
    res.status(400).send('Error updating book');
  }
});

//PUT para reemplazar un libro por ID
router.put('/:id', async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send('Invalid book ID');
  }

  const dbConnect = dbo.getDb();
  let query = { _id: new ObjectId(id) };
  let update = { $set: req.body };

  try {
    let result = await dbConnect
      .collection(COLLECTION)
      .replaceOne(query, update);

    if (result.matchedCount === 0) {
      return res.status(404).send('Book not found');
    }

    res.status(200).send('Book replaced successfully');
  } catch (err) {
    res.status(400).send('Error replacing book');
  }
});

module.exports = router; // Exportamos el enrutador para usarlo en otros módulos
