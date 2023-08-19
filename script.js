// DISABLE CONTEXT MENU AND COPYING to not interfere with little fun things
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
}, false)

// Global variables, only the ones needed
const submitBtn = document.querySelector('#submit-btn')
const userInput = document.querySelector('#name-input')

// Event Listeners
window.addEventListener('load', begin)
submitBtn.addEventListener('click', startMain)
userInput.addEventListener('keypress', e => {
    if(e.key === "Enter") {
        e.preventDefault()
        startMain()
        const mainSection = document.getElementById('main-section')
        window.scrollTo(0, mainSection.offsetTop)
    }
})

// functions, used function declarations on this level to give browser a heads up, not run into lexical issues 
function begin() {
    const header = document.querySelector('header')
    const body = document.querySelector('body')
    const h1Intro = document.querySelector('#intro h1')
    const h2Intro = document.querySelector('#intro h2')
    const formIntro = document.querySelector('#intro #form')

// this will(should) start document at top of page on reload/refresh
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    } else {
        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
        }
    }
// I did this vanilla, but GSAP might be smoother
    userInput.value = '';
    body.style.overflowY = 'hidden'
    setTimeout(() => { 
        header.style.opacity = '1'
       }, 1000)
    setTimeout(() => { 
        h1Intro.style.opacity = '1'
    }, 2500)
    setTimeout(() => {  
        h2Intro.style.opacity = '1'
    }, 4500)
    setTimeout(() => {   
        formIntro.style.opacity = '0';
        formIntro.style.transform = 'translateY(0vh)';
     }, 6500)
    setTimeout(() => {   
        formIntro.style.opacity = '1';
     }, 6800)
    setTimeout(() => {   
        body.style.overflowY = 'auto'
     }, 7000)

     makeEyesMove()
}

// For Baz to follow your every move, with definitive feline judgement
function makeEyesMove() {
    const body = document.querySelector('body')
    const eyes = document.querySelectorAll('.eye')

    body.addEventListener('mousemove', (e) => {
    eyes.forEach(eye => {
        let x = (eye.getBoundingClientRect().left) + (eye.clientWidth / 2);
        let y = (eye.getBoundingClientRect().top) + (eye.clientHeight / 2);
        let radian = Math.atan2(e.pageX - x, e.pageY - y);
        let rotation = (radian * (180 / Math.PI) * -1) + 20;
        eye.style.transform = `rotate(${rotation}deg)`;
        })
    })
}

// start the async functions, add and fade in the rest of the page
function startMain() {
    const main = document.querySelector('#main-section') 
    const h3Main1 = main.querySelector('h3:first-child')
    const h3Main2 = main.querySelector('h3:nth-child(2)')
    const tableP = main.querySelector('p')
    const table = main.querySelector('#table')

    main.style.height = '100%'
    main.style.display = 'grid'
    main.style.opacity = '1'
    setTimeout(() => {
        h3Main1.style.opacity = '1'
    }, 1000)
    setTimeout(() => {
        h3Main2.style.opacity = '0.8'
    }, 2000)
    setTimeout(() => {
        tableP.style.opacity = '0.95'
    }, 3500)
    setTimeout(() => {
        table.style.opacity = '0'
        table.style.transform = 'translateY(0vh)';
    }, 4500)
    setTimeout(() => {
        table.style.opacity = '0.8'
    }, 4700)
    startAsyncFuncs()
}

// creating the table dynamically from api data
function createTable(data) {
    console.log('table', data)

    const tbody = document.querySelector('tbody')
    let row = tbody.insertRow()
    let isVpnSpan = document.createElement('span')

    row.insertCell(0).innerText = userInput.value || 'Anonymous'
    let ipTd = row.insertCell(1).innerHTML = `${data.ip_address}<br>` || '&#9729'
    if(data.security.is_vpn) {
        ipTd.appendChild(isVpnSpan)
        isVpnSpan.innerHTML = '<br>You are disguising your whereabouts...'
    }
    row.insertCell(2).innerText = `${data.city}, ${data.region_iso_code}, ${data.country_code}` || '&#9729'
    row.insertCell(3).innerText = `Latitude ${data.latitude}/
    Longitude ${data.longitude}` || '&#9729'
    row.insertCell(4).innerHTML = `<small>current time:</small>
    ${data.timezone.current_time}<br>
    ${data.timezone.name}` || '&#9729'
    let tempTd = row.insertCell(5)
    getWeather(data.latitude, data.longitude)
    .then(data => tempTd.innerHTML = `${data.current_weather.temperature}°F` || '&#9729') 
    .catch(error => {
        tempTd.innerHTML = '&#128533;<br><small>(temp unseen)</small>'
        console.log(`weather api error: ${error}`)
    })
}

// this async function gets called by the other async function once the latitude and longitude are found
// this is an open-source weather api, no key necessary
async function getWeather(lat, lon) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&current_weather=true&temperature_unit=fahrenheit`
    const response = await fetch(weatherUrl)
    console.log(response)
    if(!response.ok) {
        throw new Error(message);
    }
    console.log(response.ok);
    const data = await response.json();
    return data;
}

// this api detects location and ip information
// a key is required, it's a free trial so this will only work until about Oct 16, 2023 
// I did look up how to hide it, but it's a bit more work than I can get into right now, though it is something I'd like to learn sometime soon
async function getRequestAbstract(url) {
    const response = await fetch(url);
    if(!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    // console.log(response.ok);
    const data = await response.json();
    return data;
}

// this calls the asyncs, says what to do with the data, sets up the table
function startAsyncFuncs() {
    const geolocationUrl = "https://ipgeolocation.abstractapi.com/v1/?api_key=fb04f9be9a324f06b309142efbf67246"
    getRequestAbstract(geolocationUrl)
    .then(data => {
       createTable(data)
    })
    .catch(error => {
        const mainP = document.querySelector('#main-section p')
        mainP.innerText = `I'm sorry ${userInput.value || 'human'}, the magic is clouded today...`;
        console.log('geolocation api error: ', error.message)
        const tbody = document.querySelector('tbody')
        let row = tbody.insertRow()
        let td = row.insertCell()
        td.setAttribute('colspan', '6')
        td.innerHTML = '&#9729 &#128533; &#9729<br><small>(human remains unseen)</small>'
    })
}
