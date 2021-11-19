var express = require('express');
var cors = require('cors');
const csv = require('csv-parser')
const fs = require('fs')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: 'src/files/formularios.csv',
  header: [
    {id: 'nombreContacto', title: 'Nombre contacto'},
  ],
  append: true,
});


var app = express();

var corsOptions = {
  origin: 'http://localhost:4000',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/hola-mundo', function(req, res) {
  res.send("¡Hola mundo!")
});

app.get('/experiencia-laboral', function(req, res) {
  const results = [];
  fs.createReadStream('src/files/experiencia-laboral.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            //console.log(results);
            var response = {
              "experiencia-laboral": results
            }
            res.send(response);
        });
});

app.post('/enviar-formulario', function(req, res) {
  //console.log(req.body);
  if (!req.body.nombreContacto){
    res.status(400).send('Falta el nombre de contacto');
  } else {
    const newRecords = [];
    newRecords.push(req.body)
    csvWriter.writeRecords(newRecords)
    .then(()=> {
      res.cookie('PW_2021-CV_Contacto', req.body.nombreContacto, { maxAge: 900000, httpOnly: true });
      res.send("Formulado enviado correctamente.")
    }
    );
  }
});

app.use(function(req, res, next) {
  res.status(404).send('404 - No fue encontrado');
});

app.listen(process.env.PORT || 4000, (a) => {
  console.log("Servidor disponible en http://localhost:4000")
});

module.exports = app;
