const socekt = io()

// Element
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLoactionButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages") //location template

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the last new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Heit of messages container 
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageMargin)
}

socekt.on("message", (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("HH:mm")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socekt.on("locationMessage", (urlmessage) => {
    console.log(urlmessage)
    const html = Mustache.render(locationMessageTemplate, {
        username:urlmessage.username,
        url: urlmessage.url,
        createdAt: moment(urlmessage.createdAt).format("HH:mm")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socekt.on("roomData", ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute("disabled", "disabled")
    //disable
    const message = e.target.elements.message.value

    socekt.emit("sendMessage", message, (error) => {
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value = ""
        $messageFormInput.focus()
        //enable
        if (error) {
            return console.log(error)
        }

        console.log("Message delivered")
    })
})

$sendLoactionButton.addEventListener("click", () => {
    if (!navigator.geolocation){
        return alert("Geolocation is not supported by your browser")
    }

    $sendLoactionButton.setAttribute("disabled","disabled")

    navigator.geolocation.getCurrentPosition((position) => {
        socekt.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (message) => {
            $sendLoactionButton.removeAttribute("disabled")
            console.log("Location shared!")
        })
    })

})

socekt.emit("join",{username,room}, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})
