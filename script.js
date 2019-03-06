const { Editor } = require('./src/editor')

document.
    getElementById("contenedor").
    querySelectorAll(".lambda").
    forEach(container => {
        new Editor().bindTo(container)
    })

