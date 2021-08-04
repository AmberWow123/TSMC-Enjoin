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

const myorders = document.getElementById('myorders')
const search_input = document.getElementById('search_bar')
const logoutButton = document.getElementById('logout')

document.getElementById('user_id').innerText = user_tsmcid

const loggedIn = (token != '')
function animateHidden(e, hidden) {
    e.style.height = hidden ? 0 : e.scrollHeight + 'px'
}
animateHidden(document.getElementById('login').parentNode, loggedIn)
animateHidden(myorders.parentNode, !loggedIn)
animateHidden(logoutButton.parentNode, !loggedIn)

function removeCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
function logout() {
    removeCookie('Token');
    removeCookie('_id');
    removeCookie('id');
    window.location.replace('/')
}
logoutButton.onclick = logout

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
            switch (message) {
                case 'you are already in this order':
                    message = 'Already joined'
                    break;
                case 'success':
                    message = 'Joined'
                    joinButton.style.background = '#59cc01'
                    joinButton.onclick = undefined
                default:
                    joinButton.style.color = '#fff'
            }
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
    return `${date.getMonth() + 1}/${date.getDate()}`
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
                    joined = true
                    break
                }
            }
        } catch (error) { }
        if (joined) {
            var joinButton = `<a class="round_bar_button joined_button">Joined</a>`
        } else {
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

        var meet_factory = order.meet_factory
        try {
            if (!isNaN(meet_factory[0]))
                meet_factory = 'FAB' + meet_factory
        } catch (error) { }

        s += `
            <div class="card" style="padding-bottom: ${loggedIn ? '272px' : '194px'};">
                <h1 class="card--title">${order.title}</h1>
                <span class="card--comment">${order.comment}</span>
                <div class="absoluteBottom">
                    ${meet_time}
                    <span class="card--fab">${meet_factory}</span>
                    <p>${hashtags}</p>
                    ${joinButton}
                </div>
            </div>
        `;
    });
    container.innerHTML = s
    container.style.opacity = 1
}


var searchStr=''
function searchByHashTag(str) {
    // console.log('searchBar_onKeyUp()')
    // console.log(e)
    str = str.trim()
    if (str === searchStr)
        return
    searchStr=str

    // container.style.opacity = 0
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
