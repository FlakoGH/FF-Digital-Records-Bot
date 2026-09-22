const {
    obtenerColeccionConversaciones
} = require("../servicios/mongodb");

const conversaciones = {};
const datos = {};


/**
 * Carga todas las conversaciones guardadas en MongoDB
 * dentro de la memoria del proceso.
 */
async function cargarConversaciones() {

    const coleccion = obtenerColeccionConversaciones();

    const documentos = await coleccion.find({}).toArray();

    for (const documento of documentos) {

        const numero = documento._id;

        conversaciones[numero] =
            documento.estado || "inicio";

        datos[numero] =
            documento.datos || {};
    }

    console.log(
        `🍃 Conversaciones cargadas desde MongoDB: ${documentos.length}`
    );
}


/**
 * Obtiene el estado actual de una conversación.
 */
function obtener(numero) {

    return conversaciones[numero] || "inicio";

}


/**
 * Guarda el estado en memoria
 * y lo persiste en MongoDB.
 */
function guardar(numero, estado) {

    conversaciones[numero] = estado;

    const coleccion =
        obtenerColeccionConversaciones();

    coleccion.updateOne(
        { _id: numero },
        {
            $set: {
                estado: estado,
                updatedAt: new Date()
            }
        },
        { upsert: true }
    ).catch((error) => {

        console.error(
            "❌ Error guardando estado en MongoDB:"
        );

        console.error(error.message);

    });

}


/**
 * Guarda un dato de la conversación
 * y lo persiste en MongoDB.
 */
function guardarDato(numero, campo, valor) {

    if (!datos[numero]) {
        datos[numero] = {};
    }

    datos[numero][campo] = valor;

    const coleccion =
        obtenerColeccionConversaciones();

    coleccion.updateOne(
        { _id: numero },
        {
            $set: {
                [`datos.${campo}`]: valor,
                updatedAt: new Date()
            }
        },
        { upsert: true }
    ).catch((error) => {

        console.error(
            "❌ Error guardando dato en MongoDB:"
        );

        console.error(error.message);

    });

}


/**
 * Obtiene un dato guardado de la conversación.
 */
function obtenerDato(numero, campo) {

    return datos[numero]?.[campo];

}


module.exports = {

    cargarConversaciones,
    obtener,
    guardar,
    guardarDato,
    obtenerDato

};
