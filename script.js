import { Editor } from "./src/editor";

document
    .getElementById("contenedor")
    .querySelectorAll(".lambda")
    .forEach(container => {
        new Editor().bindTo(container)
    });
