const container = document.getElementById("app");
const pokemons = 10;

// My blog: https://www.ibrahima-ndaw.com/

const showPokemon = (pokemon) => {
    let output = `
        <div class="card">
            <span class="card--id">#${pokemon.id}</span>
            <img class="card--image" src=${pokemon.image} alt=${pokemon.name} />
            <h1 class="card--name">${pokemon.name}</h1>
            <span class="card--details">${pokemon.type}</span>
        </div>
    `;
    container.innerHTML += output;
};

const getPokemon = async (id) => {
    const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const pokemon = await data.json();
    const pokemonType = pokemon.types
        .map((poke) => poke.type.name)
        .join(", ");

    const transformedPokemon = {
        id: pokemon.id,
        name: pokemon.name,
        image: `${pokemon.sprites.front_default}`,
        type: pokemonType
    };

    showPokemon(transformedPokemon);
};

const fetchData = () => {
    for (let i = 1; i <= pokemons; i++) {
        getPokemon(i);
    }
};

// fetchData();

// function postJSON(url, data) {
//     // Default options are marked with *
//     return fetch(url, {
//         body: JSON.stringify(data), // must match 'Content-Type' header
//         cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//         credentials: 'same-origin', // include, same-origin, *omit
//         headers: {
//             'user-agent': 'Mozilla/4.0 MDN Example',
//             'content-type': 'application/json'
//         },
//         method: 'POST', // *GET, POST, PUT, DELETE, etc.
//         mode: 'no-cors', // no-cors, cors, *same-origin
//         redirect: 'follow', // manual, *follow, error
//         referrer: 'no-referrer', // *client, no-referrer
//     })
//         .then(response => response.json()) // 輸出成 json
// }

function showOrders(orders) {
    var s = ''
    orders.forEach(order => {
        s += `
            <div class="card">
                <span hidden>#${order._id}</span>
                <h1 class="card--name">${order.title}</h1>
                <span class="card--details">${order.comment}</span>
                <p><span class="card--details">${order.meet_factory}</span></p>
                <p class="price">${order.hashtag}</p>
            </div>
        `;
    });
    container.innerHTML = s
}

function searchByHashTag(search_input) {
    // console.log('searchBar_onKeyUp()')
    // console.log(e)
    if (search_input.value.trim() == '') {
        showAllOrders()
        return
    }
    const formElement = document.getElementById('search_form')
    const data = new URLSearchParams(new FormData(formElement));
    const url = 'https://tsmc-enjoin.herokuapp.com/Order/SearchByHashtag'
    // const url = 'http://localhost:5000/Order/SearchByHashtag'
    fetch(url, {
        method: 'post',
        body: data,
        mode: 'cors', // no-cors, cors, *same-origin
    })
        .then(response => response.json())
        .then(data => showOrders(data));
    // .catch(error => {})
}

function showAllOrders() {
    const url = 'https://tsmc-enjoin.herokuapp.com/Order/ListAllGroupOrder'
    fetch(url, {
        mode: 'cors',
    })
        .then(response => response.json())
        .then(data => showOrders(data));
}

showAllOrders()