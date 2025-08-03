const btn = document.querySelector('.talk');
const content = document.querySelector('.content');

// 🔐 Lock by default
let isLocked = true;

function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);

    // 🔊 Softer voice settings
    speech.rate = 0.85;
    speech.volume = 0.9;
    speech.pitch = 1.2;
    window.speechSynthesis.speak(speech);
}

// Trigger voices to load
window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
};

function wishMe() {
    const hour = new Date().getHours();
    if (hour < 12) speak("Good Morning, Gopal.");
    else if (hour < 17) speak("Good Afternoon, Gopal.");
    else speak("Good Evening, Gopal.");
}

window.addEventListener("load", () => {
    speak("Initializing JARVIS...");
    wishMe();
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    content.textContent = "You said: " + transcript;
    takeCommand(transcript);
};

btn.addEventListener("click", () => {
    content.textContent = "Listening...";
    recognition.start();
});

function takeCommand(message) {
    // 🔐 Voice Lock
    if (isLocked) {
        if (message.includes("i am iron man") || message.includes("i am iron man")) {
            speak("Voice recognized. Welcome back, Mr. Gopal.");
            isLocked = false;
        } else {
            speak("Access denied. You are not authorized.");
        }
        return; // Stop if still locked
    }

    if (message.includes("hello") || message.includes("hey")) {
        speak("Hello Gopal, how can I help you?");
    } else if (message.includes("thank you jarvis")) {
        speak("You're welcome, sir.");
    } else if (message.includes("good job jarvis")) {
        speak("Always here to serve, sir.");
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google.");
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening YouTube.");
    } else if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook.");
    } else if (message.includes("weather")) {
        getWeather();
    } else if (message.includes("briefing")) {
        giveBriefing();
    } else if (message.includes("what is") || message.includes("who is") || message.includes("what are")) {
        window.open(`https://www.google.com/search?q=${message}`, "_blank");
        speak("Searching Google for " + message);
    } else if (message.includes("wikipedia")) {
        const query = message.replace("wikipedia", "").trim();
        window.open(`https://en.wikipedia.org/wiki/${query}`, "_blank");
        speak("Searching Wikipedia for " + query);
    } else if (message.includes("time")) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        speak("The current time is " + time);
    } else if (message.includes("date")) {
        const date = new Date().toDateString();
        speak("Today's date is " + date);
    } else if (message.includes("joke")) {
        tellJoke();
    } else if (message.includes("remember")) {
        rememberNote(message);
    }else if (message.includes("what did i ask you to remember")) {
        recallNote();
    }else if (message.includes("forget what i told you")) {
        forgetNote();
    }else {
        speak("Sorry, I didn't understand that. Searching Google...");
        window.open(`https://www.google.com/search?q=${message}`, "_blank");
    }
}

// JOKE FUNCTION
function tellJoke() {
    fetch("https://icanhazdadjoke.com/", {
        headers: { Accept: "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        speak(data.joke);
    })
    .catch(() => speak("Sorry, I couldn't find a joke right now."));
}

// WEATHER FUNCTION (Open-Meteo test API + geolocation)
function getWeather() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                .then(res => res.json())
                .then(data => {
                    const temp = data.current_weather.temperature;
                    speak(`Currently, it's ${temp} degrees Celsius at your location.`);
                })
                .catch(() => speak("Sorry, I couldn't fetch the weather right now."));
        }, () => {
            speak("I couldn't get your location.");
        });
    } else {
        speak("Geolocation is not supported by your browser.");
    }
}

// DAILY BRIEFING
function giveBriefing() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toDateString();

    speak(`Good day, Mr. Gopal. Here's your daily briefing.`);
    speak(`The time is ${time}. Today is ${date}.`);

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                .then((res) => res.json())
                .then((data) => {
                    const temp = data.current_weather.temperature;
                    speak(`The current temperature at your location is ${temp} degrees Celsius with clear skies.`);
                })
                .catch(() => speak("I couldn't get the weather at the moment."));
        }, () => {
            speak("I couldn't access your location.");
        });
    }

    fetch("https://gnews.io/api/v4/top-headlines?lang=en&country=in&token=31cf1a9f4fa3f2b51dc82379eb46ad6e")
        .then((res) => res.json())
        .then((data) => {
            speak("Here are the top 3 news headlines:");
            for (let i = 0; i < 3; i++) {
                speak(data.articles[i].title);
            }
        })
        .catch(() => speak("I couldn't fetch the news right now."));
}

function rememberNote(message) {
    const note = message.replace("remember", "").trim();
    if (note.length > 0) {
        localStorage.setItem("jarvis_memory", note);
        speak("Got it. I will remember that.");
    } else {
        speak("What should I remember?");
    }
}

function recallNote() {
    const note = localStorage.getItem("jarvis_memory");
    if (note) {
        speak("You asked me to remember: " + note);
    } else {
        speak("You haven't asked me to remember anything yet.");
    }
}

function forgetNote() {
    localStorage.removeItem("jarvis_memory");
    speak("Memory cleared. I won't remember it anymore.");
}

