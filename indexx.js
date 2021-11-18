// python -m SimpleHTTPServer

const fetchPokemon = () => {

	const arrayOfPromises = [];
	// creeer een nieuwe array die ervoor zorgt dat alle items in de array parralel geladen worden,
	// zo hoeft niet elk individueel item achter elkaar geladen worden maar gebeurd dit tegelijk.

	for (let i = 1; i <= 8; i++) {
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

	// Geef de afmetingen van de svg aan
	const width = 1000;
	const height = 500;
	const margin = { top: 50, bottom: 50, left: 50, right: 50 };

	// Voeg de svg toe aan de id in de html
	const svg = d3.select("#wrapper")
			.append("svg")
			.attr("height", height - margin.top - margin.bottom)
			.attr("width", width - margin.left - margin.right)
			.attr("viewBox", [0, 0, width, height]);

	// Maak een scale aan voor de x-as
	const x = d3.scaleBand()
		.domain(d3.range(pokemons.length))
		.range([margin.left, width - margin.right])
		.padding(0.1);

	// // Maak een scale aan voor de y-as
	const y = d3.scaleLinear()
		.domain([0, 1000])
		.range([height - margin.bottom, margin.top]);

	// Dit gebruik je om de bars te maken, ze zijn gesorteerd van hoog naar laag.
	// Met de attributes bepaal je de grootte en breedte van elke bars
	svg
		.append("g")
		.selectAll("rect")
		.data(pokemons.sort((a,b) => d3.descending(a.weight, b.weight))) 
		.join("rect")
				.attr("x", (d, i) => x(i))
				.attr("y", (d) => y(d.weight))
				.attr("height", d => y(0) - y(d.weight))
				.attr("width", x.bandwidth())

	// Positioneer de x-as aan de onderkant van de chart
	const xAxis = (g) => {
		g.attr('transform', `translate(0, ${height - margin.bottom})`)
		.call(d3.axisBottom(x).tickFormat(i => pokemons[i].name))
		.attr("font-size", "1em")
	  	.append("text")
		  .attr("font-weight",function(d,i) {return i*100+100;})
		  .attr("dy", "3em")
		  .attr("dx", "60em")
		  .attr("stroke", "black")
		  .text("Pokémon");
	}

	// Positioneer de y-as aan de linkerkant van de chart
	const yAxis = (g) => {
		g.attr('transform', `translate(${margin.left}, 0)`)
		.call(d3.axisLeft(y).ticks(null, pokemons.format))
		.attr("font-size", "1em")
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("font-weight",function(d,i) {return i*100+100;})
			.attr("dy", "-5em")
			.attr("stroke", "black")
			.text("Weight (KG)");
	}
	
	// Hierdoor worden de bars getekend
	svg.append("g").call(yAxis);     
	svg.append("g").call(xAxis);      
	svg.node();



	// const g = svg.append('g')
	// 	.attr("transform", `translate(${margin.left},${margin.top})`);

	// const xscale = d3.scaleLinear().range([0, width]);
	// const yscale = d3.scaleBand().rangeRound([0, height]).paddingInner(0.1);

	// const xaxis = d3.axisTop().scale(xscale);
	// const g_xaxis = g.append('g').attr('class','x axis');
	// const yaxis = d3.axisLeft().scale(yscale);
	// const g_yaxis = g.append('g').attr('class','y axis');

	// function update(new_data) {
	// 	xscale.domain([0, d3.max(new_data, (d) => d.height)]);
	// 	yscale.domain(new_data.map((d) => d.pokemons));

	// 	g_xaxis.transition().call(xaxis);
	// 	g_yaxis.transition().call(yaxis);
	
	
	// 	const rect = g.selectAll('rect').pokemons(new_data, (d) => d.pokemons).join(
	// 		(enter) => {
	// 			const rect_enter = enter.append('rect').attr('x', 0);
	// 			rect_enter.append('title');
	// 			return rect_enter;
	// 		},

	// 		(update) => update,

	// 		(exit) => exit.remove
	// 	);

	// 	rect.transition()
	// 		.attr('height', yscale.bandwidth())
	// 		.attr('width', (d) => xscale(d.pokemons))
	// 		.attr('y', (d) => yscale(d.weight));
			
	// 	rect.select('title').text((d) => d.pokemons)

	// };

	// d3.select("#filter-us-only").on('change', function() {
		
	// 	const checked = d3.select(this).property('checked');
	// 	if (checked === true) {

	// 		const filtered_data = pokemons.filter((d) => d.pokemons === "venasaur");

	// 		update(filtered_data);
	// 	} else {
	// 		update(pokemons);
	// 	}
	// });

}

fetchPokemon();

