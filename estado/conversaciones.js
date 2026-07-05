const conversaciones = {};

function obtener(numero) {

    return conversaciones[numero] || "inicio";

}

function guardar(numero, estado) {

    conversaciones[numero] = estado;

}

module.exports = {

    obtener,
    guardar

};