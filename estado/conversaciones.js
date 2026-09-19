const conversaciones = {};
const datos = {};

function obtener(numero) {

    return conversaciones[numero] || "inicio";

}

function guardar(numero, estado) {

    conversaciones[numero] = estado;

}

function guardarDato(numero, campo, valor) {

    if (!datos[numero]) {
        datos[numero] = {};
    }

    datos[numero][campo] = valor;

}

function obtenerDato(numero, campo) {

    return datos[numero]?.[campo];

}

module.exports = {

    obtener,
    guardar,
    guardarDato,
    obtenerDato

};
