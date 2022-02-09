const express = require('express');
const router = express.Router();
const { SPARQLQueryDispatcher } = require('./SPARQLQueryDispatcher');

const endpointUrl = 'https://query.wikidata.org/sparql';
const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);


router.get('/', (req, res) => {
    res.send("API Comic Akinator")
});

router.get('/characters', (req, res) => {
  const sparqlQuery = require('./queries').comicCharacters;
  queryDispatcher.query(sparqlQuery).then(data => res.send(data));
});

router.get('/:publisher/characters', (req, res) => {
  console.log(`req.params.publisher = ${req.params.publisher}`)
  const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
  const sparqlQuery = require('./queries').comicCompanyCharacters(req.params.publisher);
  queryDispatcher.query(sparqlQuery).then(data => res.send(data));
});

router.get('/professions', (req, res) => {
  const sparqlQuery = require('./queries').professions;
  queryDispatcher.query(sparqlQuery).then(data => res.send(data));
});

router.get('/professions/:profession', (req, res) => {
  const sparqlQuery = require('./queries').profession(req.params.profession);
  queryDispatcher.query(sparqlQuery).then(data => res.send(data));
});

router.post('/whoiam', async (req, res) => {
  const identifierQuery = require('./queries').profession(req.body.occupation);
  let idRes = await queryDispatcher.query(identifierQuery); 

  if (idRes.results.bindings.length == 0)
    res.send({});
  else {
    const idOccupation = idRes.results.bindings[0].characterType.value.split('/')[4];
    const sparqlQuery = require('./queries').whoiam(req.body.publisher, idOccupation);
    queryDispatcher.query(sparqlQuery).then(data => res.send(data));
  }
});

module.exports = router;