// python -m SimpleHTTPServer

const fetchPokemon = () => {

	const arrayOfPromises = [];
	// creeer een nieuwe array die ervoor zorgt dat alle items in de array parralel geladen worden,
	// zo hoeft niet elk individueel item achter elkaar geladen worden maar gebeurd dit tegelijk.

	for (let i = 1; i <= 15; i++) {
			const url = 'https://pokeapi.co/api/v2/pokemon/' + i;
			arrayOfPromises.push(fetch(url)
			  .then((response) => response.json())
			  .catch(error => {
			  console.error("Failed to fetch pokemon: " + i)
			}));
			// voor elke request pushen we de promise op de list van promises.
	}

	Promise.all(arrayOfPromises)
		.then(results => {
			  // met Promise.all worden de items parralel geladen
			  const pokemons = results.map((data) => ({
					// map function itereert door een array (results) en creert een nieuwe array dat ervoor zorgt dat
					// de items worden veranderd.
				  name: data.name,
				  id: data.id,
				  image: data.sprites['front_default'],
				  height: data.height,
				  weight: data.weight
					// elk item wordt veranderd naar de door ons opgestelde format zoals hierboven 
					// (Hierdoor krijgen we alleen deze specifieke data voor elke pokemon uit de api).
			}));
			getPokemonData(pokemons)
		}).catch(error => {
			const pokedexContainer = document.getElementById("wrapper")
			const errorMessage = document.createElement("h3")
			errorMessage.innerHTML = "Failed to fetch all pokemon :("
			pokedexContainer.appendChild(errorMessage);
		});
};

const getPokemonData = (pokemons) => {

	const margin = {top: 70, bottom: 10, left: 150, right: 0};
    const width = 1000 - (margin.left - margin.right);
    const height = 650 - (margin.top - margin.bottom);

    // Maak een svg element aan
    const svg = d3.select('#wrapper')
        .append('svg')
        .data(pokemons.sort((a,b) => d3.descending(a.weight, b.weight))) 
        .attr('width', width + (margin.left + margin.right))
        .attr('height', height + (margin.top + margin.bottom));

    // Groupeer om margin toe te voegen
    const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

    // Definieer de x en y scales
    const xscale = d3.scaleLinear()
    .range([width - margin.left, margin.right])

    const yscale = d3.scaleBand()
    .domain(d3.range(pokemons.length))
	.range([margin.bottom, height - margin.top])
    .paddingInner(0.2);

    // Maak de axis en voeg chart labels toe
    const xaxis = d3.axisTop().scale(xscale);
    const g_xaxis = g.append('g').attr('class','axis')
    g.append('g')
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('font-size', '1em')
        .attr('dx', '-13em')
        .attr('dy', '-7em')
        .attr('text-anchor', 'end')
        .text('Pokemon');
        

    const yaxis = d3.axisLeft().scale(yscale);
    const g_yaxis = g.append('g').attr('class','axis')
    g.append('g')
      .append('text')
        .attr('font-size', '1em')
        .attr('dx', '5em')
        .attr('dy', '-3em')
        .attr('text-anchor', 'end')
        .text('Weight (kg)')
        

    update(pokemons)

    /////////////////////////

    function update(new_data) {
        
        // verander de kleur van de bars voor de pokemons die meer dan 100 wegen
        d3.select('#wrapper')
            .selectAll('rect')
            .data(pokemons)
            .join('rect')
            .attr('fill', 'orangered')
            .transition()
            .attr('width', function(pokemons){
                return pokemons.weight
            }) 

        // update de scales
        xscale.domain([(d3.max(new_data, (d) => d.weight)), 0]);
        yscale.domain(new_data.map((d) => d.name));

        //render de axis
        g_xaxis.transition().call(xaxis);
        g_yaxis.transition().call(yaxis);


    // render de chart met de nieuwe data

    // met join zorg je ervoor dat het juiste DOM element gekoppeld is aan dezelfde data
    const rect = g.selectAll('rect')
        .data(new_data, (d) => d.name)
        .join(
            
            // enter de nieuwe elementen
            (enter) => {
                const rect_enter = enter.append('rect').attr('x', 0);
                rect_enter.append('title');
                return rect_enter;
            },
            
            // update de bestaande elementen
            (update) => update,
            
            // verwijder elementen die niet meer aan data gekoppeld zijn
            (exit) => exit.remove()
        );

    // enter en update de oude en nieuwe elementen
    rect.transition()
        .attr('height', yscale.bandwidth())
        .attr('width', (d) => xscale(d.weight))
        .attr('y', (d) => yscale(d.name));
        

    rect.select('title').text((d) => d.name);
    }


    // koppel de checkbox
    d3.select('#filter-fattest-pokemons').on('change', function() {
        // deze functie gaat in werking als de checkbox wordt geselecteerd of gedeselecteerd
        const checked = d3.select(this).property('checked');
        if (checked === true) {
            // als de checkbox aan staat...

            // zorg dan ervoor dat de pokemons boven een gewicht van 200 worden gefilterd
            const filtered_data = pokemons.filter((d) => d.weight > 200);

            return update(filtered_data);  // update de chart met de gefilterde (nieuwe) data
        } 
        update(pokemons);
        // als hij weer wordt gedeselecteerd  // wordt de chart geupdate met alle data die we hebben
    });
 
	svg.node();

}

fetchPokemon();