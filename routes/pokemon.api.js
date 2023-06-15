const crypto = require("crypto");
const fs = require("fs");
const express = require("express");
const router = express.Router();

const pokemonTypes = [
  "Grass",
  "Fire",
  "Water",
  "Electric",
  "Bug",
  "Normal",
  "Poison",
];
let pokemonsById = {};
let pokemonsByName = {};

/**
 * params: /
 * description: get all pokemons
 * query:
 * method: get
 */

router.get("/", (req, res, next) => {
  //input validation
  const allowedFilter = ["search", "type", "page", "limit"];
  try {
    let { page, limit, search, type } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    search = (search || "").toLowerCase();
    type = (type || "").toLowerCase();

    //processing logic
    //Number of items skip for selection
    let offset = limit * (page - 1);

    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync(
      "/Users/kimuchan/Documents/Projects/pokemon/backend/pokemons.json",
      "utf-8"
    );
    db = JSON.parse(db);
    const { pokemon } = db;
    // Filter data by name and types
    let filteredPokemons = pokemon;

    if (search) {
      filteredPokemons = filteredPokemons.filter((pokemon) => {
        return pokemon.name.toLowerCase().includes(search);
      });
    }

    if (type) {
      filteredPokemons = filteredPokemons.filter((pokemon) => {
        return (
          pokemon.type1.toLowerCase() === type ||
          pokemon.type2.toLowerCase() === type
        );
      });
    }

    //then select number of result by offset
    result = filteredPokemons.slice(offset, offset + limit);
    //send response
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let db = fs.readFileSync(
    "/Users/kimuchan/Documents/Projects/pokemon/backend/pokemons.json",
    "utf-8"
  );
  db = JSON.parse(db);
  const { pokemon } = db;

  // Find the Pokémon with the specified ID
  const pokemonById = pokemon.find((p) => p.id === id);

  if (!pokemonById) {
    return res.status(404).json({ error: "Pokémon not found" });
  }

  // Find the previous and next Pokémon based on the current ID
  const previousPokemon = pokemon.find((p) => p.id === id - 1) || pokemon[pokemon.length - 1];
  const nextPokemon = pokemon.find((p) => p.id === id + 1) || pokemon[0];

  // Return the Pokémon data along with previous and next Pokémon
  res.status(200).json({
    current: pokemonById,
    previous: previousPokemon,
    next: nextPokemon,
  });
});

router.post("/addPokemon", (req, res, next) => {
  const { name, pokemonId, types, imageUrl } = req.body;
  let db = fs.readFileSync(
    "/Users/kimuchan/Documents/Projects/pokemon/backend/pokemons.json",
    "utf-8"
  );
  db = JSON.parse(db);
  const { pokemon } = db;
  //post input validation
  try {
    if (!name || !pokemonId || !types || !imageUrl) {
      res.status(400).json({ error: "Missing required data" });
      return;
    }

    if (types.length > 2) {
      res.status(400).json({ error: "Pokémon can only have one or two types" });
      return;
    }
    types.forEach((type) => {
      if (!pokemonTypes.include(type)) {
        res.status(400).json({ error: "Pokémon's type is invalid" });
        return;
      }
    });
    const existingPokemonById = pokemonsById[id];
    const existingPokemonByName = pokemonsByName[name.toLowerCase()];

    if (existingPokemonById || existingPokemonByName) {
      res.status(400).json({ error: "The Pokémon already exists" });
      return;
    }
    //post processing
    const lastIndex = pokemon.length;
    const newPokemonId = lastIndex +1;
    const newPokemon = {
      name,
      types,
      imageUrl,
      id: newPokemonId,
    };
    // Add new pokemon to the pokemon array
    pokemon.push(newPokemon);

    // Update the database object
    db.pokemon = pokemon;

    // Convert the database object to JSON string
    const updatedDb = JSON.stringify(db);

    // Write and save the updated database to pokemons.json
    fs.writeFileSync(
      "/Users/kimuchan/Documents/Projects/pokemon/backend/pokemons.json",
      updatedDb
    );
    //post send response
   
    res.status(201).json({ message: "Pokémon created successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
