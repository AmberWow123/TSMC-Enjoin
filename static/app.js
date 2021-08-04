const apiUrl = 'https://tsmc-enjoin.herokuapp.com'
// const apiUrl = 'http://localhost:5000'
const container = document.getElementById("app");
// const pokemons = 10;

const token = document.cookie.replace(
    /(?:(?:^|.*;\s*)Token\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
);
const user_objectId = document.cookie.replace(
    /(?:(?:^|.*;\s*)_id\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
);
const user_tsmcid = document.cookie.replace(
    /(?:(?:^|.*;\s*)id\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
);
// console.log('cookie:', document.cookie)
// console.log('token:', token)
// console.log('user_objectId:', user_objectId)
// console.log('user_tsmcid:', user_tsmcid)

const loggedIn = (token != '')
document.getElementById('user_id').innerText = user_tsmcid
document.getElementById('login').parentNode.hidden = loggedIn
const myorders = document.getElementById('myorders')
myorders.parentNode.hidden = !loggedIn
// myorders.href += '?id=123456'
const search_input = document.getElementById('search_bar')

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

function joinOrder(joinButton, orderId) {
    joinButton.innerHTML = 'joining...'
    joinButton.style.color = '#adadad'
    fetch(apiUrl + `/Order/JoinOrder/${user_objectId}/${orderId}`, {
        headers: {
            'x-access-token': token
        },
        mode: 'cors', // no-cors, cors, *same-origin
    })
        .then(res => res.json())
        .then(json => {
            var message = json.message
            if (message == 'you are already in this order')
                message = 'Already joined'
            else
                joinButton.style.color = '#fff'
            document.getElementById(orderId).innerText = message
        })
        .catch(err => {
            document.getElementById(orderId).innerText = 'error'
        })
}

function clickHashTag(tag) {
    const str = tag.text.slice(1) // #text -> text
    search_input.value = str
    searchByHashTag(str)
}

function getTime(date) {
    return `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`
}

function getDate(date) {
    return `${date.getMonth()}/${date.getDate()}`
}

function showOrders(orders) {
    var s = ''
    orders.forEach(order => {
        // <span hidden>#${order._id}</span>
        // <p style="margin: -10px;">-</p>
        // <p>From ${order.meet_time[0].slice(0,-8)}</p>
        // <p>To ${order.meet_time[1].slice(0,-8)}</p>
        var joined = false
        try {
            for (let i = 0; i < order.join_people_id.length; i++) {
                const e = order.join_people_id[i];
                if (e == user_tsmcid) {
                    joined=true
                    break
                }
            }
        } catch (error) { }
        if(joined){
            var joinButton = `<a class="round_bar_button joined_button">Joined</a>`
        }else{
            var joinButton = loggedIn ? `<a id="${order._id}" class="round_bar_button" onclick="joinOrder(this, '${order._id}')">Join</a>` : ''
        }


        var meet_time_start = new Date(order.meet_time[0])
        var meet_time_end = new Date(order.meet_time[1])
        var meet_time
        if (meet_time_start.toLocaleDateString() == meet_time_end.toLocaleDateString()) {
            meet_time = `
                <p class="lightgraytext">
                    <span class="short_date">${getDate(meet_time_start)}</span><br>
                    ${getTime(meet_time_start)} - ${getTime(meet_time_end)}
                </p>
            `;
        } else {
            meet_time = `
                <p class="lightgraytext">
                    From ${meet_time_start.toLocaleString()}
                    To ${meet_time_end.toLocaleString()}
                </p>
            `;
        }

        var hashtags = ''
        order.hashtag.forEach(hashtag => {
            // if(hashtags.length > 0)
            //     hashtags += 
            hashtags += `<a class="hashtag hover_opacity" onclick="clickHashTag(this)">#${hashtag}</a> `
        })

        s += `
            <div class="card">
                <h1 class="card--title">${order.title}</h1>
                <span class="card--comment">${order.comment}</span>
                ${meet_time}
                <span class="card--fab">${order.meet_factory}</span>
                <p>${hashtags}</p>
                ${joinButton}
            </div>
        `;
    });
    container.innerHTML = s
}



function searchByHashTag(str) {
    // console.log('searchBar_onKeyUp()')
    // console.log(e)
    str = str.trim()
    if (str == '') {
        showAllOrders()
        return
    }
    // const formElement = document.getElementById('search_form')
    // const data = new URLSearchParams(new FormData(formElement));
    const url = 'https://tsmc-enjoin.herokuapp.com/Order/SearchByHashtag'
    // const url = 'http://localhost:5000/Order/SearchByHashtag'
    fetch(url, {
        method: 'post',
        mode: 'cors', // no-cors, cors, *same-origin
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ search_key: str }),
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
