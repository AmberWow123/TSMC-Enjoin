const container = document.getElementById("message");
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

// how to get this?
var tsmcid = 123456

function onsubmit_create_order_form(formElement) {
    formElement.action = 'https://tsmc-enjoin.herokuapp.com/Account/CreateOrder/' + tsmcid
    console.log(formElement.action)

    const data = new URLSearchParams(new FormData(formElement));
    fetch(formElement.action, {
        method: 'post',
        body: data,
        mode: 'cors', // no-cors, cors, *same-origin
    })
        .then(async response => {
            try {
                const json = await response.clone().json()
                container.innerHTML = `<p>${json.message}</p>`
            } catch (error) {
                container.innerHTML = `<p>${await response.text()}</p>`
            }
        });
    // .catch(error => {})
    return false
}