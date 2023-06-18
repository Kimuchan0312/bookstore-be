const fs = require('fs');
const csv = require('csvtojson');

const createPokemonData = async () => {
try {
    let pokemonData = await csv().fromFile('/Users/kimuchan/Documents/Projects/pokemon/backend/pokemon.csv');
    let data = {};

    pokemonData = pokemonData.filter((pokemon) => {
      const imagePath = `/Users/kimuchan/Documents/Projects/pokemon/backend/public/images/${pokemon.Name}.png`;
      return fs.existsSync(imagePath);
    });
  
    pokemonData = pokemonData.map((pokemon, index) => {
      const id = index + 1;
        return {
          id: id,
          name: pokemon.Name,
          types: [pokemon.Type1, pokemon.Type2].filter( type => !!type),
          image: `/images/${pokemon.Name}.png`
        };
      });

    data.pokemon = pokemonData;
  
    console.log(pokemonData);

    fs.writeFileSync('pokemons.json', JSON.stringify(data));

    console.log('Data updated successfully.');

} catch (error) {
    console.error('Error:', error);
};
}

createPokemonData();


