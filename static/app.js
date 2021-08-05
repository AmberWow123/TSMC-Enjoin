const apiUrl = ''
const container = document.getElementById("app");

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
const toggle_bar = document.getElementById('toggle_bar')

function onclickToggleBarButton(button, routeName) {
    toggle_bar.childNodes.forEach(e => {
        try {
            e.classList.remove('accent_color')
        } catch { }
    })
    button.classList.add('accent_color')
    fetchOrders(routeName)
}

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

// fetch template
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

function onClickJoinButton(joinButton, orderId) {
    if (joinButton.classList.contains('joined')) { // quit order
        joinButton.disabled = true
        joinButton.innerHTML = 'unjoining...'
        // joinButton.style.color = '#adadad'
        fetch(apiUrl + `/Order/QuitOrder/${user_objectId}/${orderId}`, {
            headers: {
                'x-access-token': token
            },
            mode: 'cors', // no-cors, cors, *same-origin
            method: 'POST'
        })
            .then(res => res.json())
            .then(json => {
                var message = json.message
                switch (message) {
                    case 'you are already in this order':
                        message = 'Not joined'
                        break;
                    case 'Remove Success!':
                        message = 'Join'
                        joinButton.classList.remove('joined')
                    //     joinButton.onclick = undefined
                    // default:
                    //     joinButton.style.color = '#fff'
                }
                joinButton.innerText = message
                joinButton.disabled = false
            })
            .catch(err => {
                joinButton.classList.add('err')
                joinButton.innerText = 'Our fault'
                joinButton.disabled = false
            })
    } else { // join order
        joinButton.disabled = true
        joinButton.innerHTML = 'joining...'
        // joinButton.style.color = '#adadad'
        fetch(apiUrl + `/Order/JoinOrder/${user_objectId}/${orderId}`, {
            headers: {
                'x-access-token': token
            },
            mode: 'cors', // no-cors, cors, *same-origin
        })
            .then(res => res.json())
            .then(json => {
                var buttonText = json.message
                switch (buttonText) {
                    case 'you are already in this order':
                        buttonText = 'Already joined'
                        break;
                    case 'success':
                        // successfully joined
                        buttonText = 'Joined'
                        joinButton.title = "Click to cancel"
                        joinButton.classList.add('joined')
                    //     joinButton.onclick = undefined
                    // default:
                    //     joinButton.style.color = '#fff'
                }
                joinButton.innerText = buttonText
                joinButton.disabled = false
            })
            .catch(err => {
                joinButton.classList.add('err')
                joinButton.innerText = 'Our fault'
                joinButton.disabled = false
            })
    }
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
        var joinButton = ''
        if (loggedIn) {
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
                joinButton = `<button class="round_bar_button joined" onclick="onClickJoinButton(this, '${order._id}')" title="click to cancel">Joined</button>`
            } else {
                joinButton = `<button class="round_bar_button" onclick="onClickJoinButton(this, '${order._id}')">Join</button>`
            }
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
                    ${meet_time_start.toLocaleString().slice(0, -3)} - ${meet_time_end.toLocaleString().slice(0, -3)}
                </p>
            `;
        }

        var hashtags = ''
        order.hashtag.forEach(hashtag => {
            hashtags += `<a class="hashtag hover_opacity" onclick="clickHashTag(this)">#${hashtag}</a> `
        })

        var meet_factory = order.meet_factory
        try {
            if (!isNaN(meet_factory[0]))
                meet_factory = 'FAB' + meet_factory
        } catch (error) { }

        s += `
            <div class="card ${loggedIn ? 'loggedIn' : ''}">
                <div class="invisible_scroll title_scroll">
                    <div>
                        <span class="card--group ${order.epidemic_prevention_group}">${order.epidemic_prevention_group}</span>
                        <h1 class="card--title">${order.drink} ${order.title}</h1>
                        <p class="card--comment">${order.comment}</p>
                        <p class="card--creator_id mar_bottom0" title="Creator">${order.creator_id}</p>
                    </div>
                </div>
                <div class="absoluteBottom">
                    ${meet_time}
                    <div class="invisible_scroll hashtag_panel">
                        <div>
                            <span class="card--fab">${order.store}, ${meet_factory}</span>
                            <p class="mar_bottom0">${hashtags}</p>
                        </div>
                    </div>
                    ${joinButton}
                </div>
            </div>
        `;
    });
    container.innerHTML = s
    container.style.opacity = 1
}


var searchStr = ''
function searchByHashTag(str) {
    // console.log('searchBar_onKeyUp()')
    // console.log(e)
    str = str.trim()
    if (str === searchStr)
        return
    searchStr = str

    if (str == '') {
        fetchOrders()
        return
    }

    container.style.opacity = 0
    fetch(apiUrl + '/Order/SearchByHashtag', {
        method: 'POST',
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

function fetchOrders(route = 'ListAllInProgressGroupOrder') {
    container.style.opacity = 0
    fetch(apiUrl + '/Order/' + route, {
        mode: 'cors',
    })
        .then(response => response.json())
        .then(data => showOrders(data));
}

fetchOrders()
