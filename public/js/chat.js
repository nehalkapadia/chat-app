const socket = io();

const $messageForm = document.querySelector("#message-form");
const $shareLocationButton = document.querySelector("#share_location");
const $messageInput = document.querySelector("chat_message");
const $sendMessageButton = document.querySelector("#sendMessage");
const $messages = document.querySelector("#messages");

// templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;

socket.on("welcomeMessage", (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("LTS"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("shareLocationMessage", (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format("LTS"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // disable button
  $sendMessageButton.setAttribute("disabled", "disabled");

  socket.emit("sendChat", e.target.elements.chat_message.value, (error) => {
    // enable button
    $sendMessageButton.removeAttribute("disabled");

    e.target.elements.chat_message.value = "";
    e.target.elements.chat_message.focus();

    if (error) {
      return console.log("Message status: ", error);
    }

    console.log("Message delivered!");
  });
});

$shareLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not support by your browser!");
  }
  $shareLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "shareLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (ack) => {
        $shareLocationButton.removeAttribute("disabled");
        console.log(ack);
      }
    );
  });
});
