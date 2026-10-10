// CATÁLOGO Y ESTADO: no se utiliza backend, base de datos ni localStorage.
let experiencias = [];
let reservas = [];
let categoriaActual = "todas";
let ordenActual = "normal";

// ELEMENTOS DEL HTML (DOM).
const catalogo = document.querySelector("#catalogo");
const contador = document.querySelector("#contador");
const botonesCategoria = document.querySelectorAll("[data-categoria]");
const buscador = document.querySelector("#buscador");
const precioMaximo = document.querySelector("#precioMaximo");
const ordenarPrecio = document.querySelector("#ordenarPrecio");
const listaReservas = document.querySelector("#listaReservas");
const total = document.querySelector("#total");
const totalPersonas = document.querySelector("#totalPersonas");
const vaciarReservacion = document.querySelector("#vaciarReservacion");
const mensaje = document.querySelector("#mensaje");
const confirmarVaciar = document.querySelector("#confirmarVaciar");
const cancelarVaciar = document.querySelector("#cancelarVaciar");
const aceptarVaciar = document.querySelector("#aceptarVaciar");

const pesos = cantidad => `$${cantidad.toLocaleString("es-MX")} MXN`;
let temporizadorMensaje;

function mostrarMensaje(texto, tipo = "info") {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    mensaje.hidden = false;
    clearTimeout(temporizadorMensaje);
    temporizadorMensaje = setTimeout(() => { mensaje.hidden = true; }, 6000);
}

// 1. CARGAR EXPERIENCIAS DESDE EL JSON CON FETCH.
async function cargarExperiencias() {
    try {
        contador.textContent = "Cargando experiencias...";
        const respuesta = await fetch("./data/experiencias.json");
        if (!respuesta.ok) throw new Error("No fue posible leer experiencias.json");

        const datos = await respuesta.json();
        if (!Array.isArray(datos)) throw new Error("El archivo JSON debe contener un arreglo");

        experiencias = datos;
        aplicarFiltros();
        actualizarResumen();
    } catch (error) {
        console.error("Error al cargar experiencias:", error);
        contador.textContent = "No se pudieron cargar las experiencias";
        catalogo.innerHTML = '<p class="sin-resultados">Error al cargar el catálogo. Abre el proyecto con Live Server y revisa la carpeta data.</p>';
        mostrarMensaje("No se pudieron cargar las experiencias. Revisa experiencias.json y usa Live Server.", "error");
    }
}

// 2. BUSCAR, FILTRAR Y ORDENAR, RESPETANDO TODOS LOS CONTROLES.
function aplicarFiltros() {
    const texto = buscador.value.trim().toLowerCase();
    const precioEscrito = precioMaximo.value.trim();
    const limitePrecio = precioEscrito === "" ? null : Number(precioEscrito);

    // Se usa una copia para no cambiar el orden original del catálogo.
    let resultados = [...experiencias].filter(experiencia => {
        const coincideCategoria = categoriaActual === "todas" || experiencia.categoria === categoriaActual;
        const coincideNombre = experiencia.nombre.toLowerCase().includes(texto);
        const coincidePrecio = limitePrecio === null ||
            (Number.isFinite(limitePrecio) && limitePrecio >= 0 && experiencia.precio <= limitePrecio);
        return coincideCategoria && coincideNombre && coincidePrecio;
    });

    if (ordenActual === "ascendente") {
        resultados.sort((a, b) => a.precio - b.precio);
    } else if (ordenActual === "descendente") {
        resultados.sort((a, b) => b.precio - a.precio);
    }

    mostrarExperiencias(resultados);
}

// 3. CREAR TARJETAS CON JAVASCRIPT, A PARTIR DE LOS OBJETOS DEL JSON.
function mostrarExperiencias(lista) {
    contador.textContent = `${lista.length} experiencia${lista.length === 1 ? "" : "s"} encontrada${lista.length === 1 ? "" : "s"}`;

    if (lista.length === 0) {
        catalogo.innerHTML = '<p class="sin-resultados">No se encontraron experiencias con esos filtros.</p>';
        return;
    }

    catalogo.innerHTML = lista.map(experiencia => {
        const reservaActual = reservas.find(reserva => reserva.experienciaId === experiencia.id);
        const cantidadReservada = reservaActual ? reservaActual.cantidad : 0;
        const lugaresRestantes = experiencia.cupo - cantidadReservada;
        return `
            <article class="tarjeta">
                <div class="imagen" aria-hidden="true">${experiencia.icono}</div>
                <div class="informacion">
                    <span class="etiqueta">${experiencia.categoria}</span>
                    <h3>${experiencia.nombre}</h3>
                    <p class="precio">${pesos(experiencia.precio)}</p>
                    <p class="cupo">Cupo disponible: <strong>${lugaresRestantes}</strong></p>
                    <label for="cantidad-${experiencia.id}">Personas:</label>
                    <input type="number" id="cantidad-${experiencia.id}" class="cantidad-input"
                        min="1" max="${lugaresRestantes}" step="1" value="1" ${lugaresRestantes === 0 ? "disabled" : ""}>
                    <button type="button" class="btn-reservar" data-reservar="${experiencia.id}"
                        ${lugaresRestantes === 0 ? "disabled" : ""}>
                        ${lugaresRestantes === 0 ? "Sin cupo" : "Agregar a mi reservación"}
                    </button>
                </div>
            </article>`;
    }).join("");
}

// 4. AGREGAR RESERVAS Y VALIDAR NÚMERO DE PERSONAS Y CUPO.
function agregarReserva(id) {
    const experiencia = experiencias.find(elemento => elemento.id === id);
    const entrada = document.querySelector(`#cantidad-${id}`);
    if (!experiencia || !entrada) return;

    const cantidad = Number(entrada.value);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
        mostrarMensaje("Escribe una cantidad válida de personas (número entero mayor a cero).", "error");
        return;
    }

    const existente = reservas.find(reserva => reserva.experienciaId === id);
    const cantidadActual = existente ? existente.cantidad : 0;
    if (cantidadActual + cantidad > experiencia.cupo) {
        mostrarMensaje(`No puedes superar el cupo de ${experiencia.cupo} personas para ${experiencia.nombre}.`, "error");
        return;
    }

    if (existente) {
        existente.cantidad += cantidad;
    } else {
        reservas.push({
            experienciaId: experiencia.id,
            nombre: experiencia.nombre,
            precio: experiencia.precio,
            cantidad
        });
    }

    actualizarResumen();
    aplicarFiltros();
    mostrarMensaje(`Se agregaron ${cantidad} persona(s) a ${experiencia.nombre}.`, "exito");
}

// 5. MODIFICAR CANTIDADES DESDE LA SECCIÓN "MI RESERVACIÓN".
function cambiarCantidad(id, cambio) {
    const reserva = reservas.find(elemento => elemento.experienciaId === id);
    const experiencia = experiencias.find(elemento => elemento.id === id);
    if (!reserva || !experiencia) return;

    const nuevaCantidad = reserva.cantidad + cambio;
    if (nuevaCantidad < 1) {
        mostrarMensaje("La cantidad mínima es 1. Utiliza Eliminar para quitar la experiencia.", "error");
        return;
    }
    if (nuevaCantidad > experiencia.cupo) {
        mostrarMensaje(`La experiencia ${experiencia.nombre} tiene un cupo de ${experiencia.cupo} personas.`, "error");
        return;
    }

    reserva.cantidad = nuevaCantidad;
    actualizarResumen();
    aplicarFiltros();
}

function eliminarReserva(id) {
    reservas = reservas.filter(reserva => reserva.experienciaId !== id);
    actualizarResumen();
    aplicarFiltros();
    mostrarMensaje("Experiencia eliminada de la reservación.", "info");
}

// 6. RENDERIZAR LA RESERVACIÓN Y CALCULAR PERSONAS Y TOTALES CON REDUCE.
function actualizarResumen() {
    if (reservas.length === 0) {
        listaReservas.innerHTML = '<p class="vacio">No hay experiencias seleccionadas.</p>';
    } else {
        listaReservas.innerHTML = reservas.map(reserva => {
            const experiencia = experiencias.find(elemento => elemento.id === reserva.experienciaId);
            const tope = experiencia ? experiencia.cupo : reserva.cantidad;
            return `
                <article class="item-reserva">
                    <div class="datos-reserva">
                        <h3>${reserva.nombre}</h3>
                        <p>${pesos(reserva.precio)} por persona</p>
                    </div>
                    <div class="acciones-reserva">
                        <div class="selector-cantidad" aria-label="Cantidad de personas para ${reserva.nombre}">
                            <button type="button" data-cambio="-1" data-id="${reserva.experienciaId}"
                                aria-label="Disminuir personas de ${reserva.nombre}" ${reserva.cantidad <= 1 ? "disabled" : ""}>−</button>
                            <strong>${reserva.cantidad}</strong>
                            <button type="button" data-cambio="1" data-id="${reserva.experienciaId}"
                                aria-label="Aumentar personas de ${reserva.nombre}" ${reserva.cantidad >= tope ? "disabled" : ""}>+</button>
                        </div>
                        <strong class="subtotal">${pesos(reserva.precio * reserva.cantidad)}</strong>
                        <button type="button" class="btn-eliminar" data-eliminar="${reserva.experienciaId}">Eliminar</button>
                    </div>
                </article>`;
        }).join("");
    }

    const personas = reservas.reduce((suma, reserva) => suma + reserva.cantidad, 0);
    const importe = reservas.reduce((suma, reserva) => suma + (reserva.precio * reserva.cantidad), 0);
    totalPersonas.textContent = personas;
    total.textContent = pesos(importe);
    vaciarReservacion.disabled = reservas.length === 0;
}

// EVENTOS (la delegación permite usar botones creados dinámicamente con innerHTML).
botonesCategoria.forEach(boton => {
    boton.addEventListener("click", () => {
        botonesCategoria.forEach(elemento => {
            const seleccionado = elemento === boton;
            elemento.classList.toggle("activo", seleccionado);
            elemento.setAttribute("aria-pressed", String(seleccionado));
        });
        categoriaActual = boton.dataset.categoria;
        aplicarFiltros();
    });
});

buscador.addEventListener("input", aplicarFiltros);
precioMaximo.addEventListener("input", aplicarFiltros);

// El valor seleccionado corresponde exactamente al orden que se muestra.
ordenarPrecio.addEventListener("change", () => {
    ordenActual = ordenarPrecio.value;
    aplicarFiltros();
});

catalogo.addEventListener("click", evento => {
    const boton = evento.target.closest("[data-reservar]");
    if (boton) agregarReserva(Number(boton.dataset.reservar));
});

listaReservas.addEventListener("click", evento => {
    const botonEliminar = evento.target.closest("[data-eliminar]");
    if (botonEliminar) {
        eliminarReserva(Number(botonEliminar.dataset.eliminar));
        return;
    }
    const botonCambio = evento.target.closest("[data-cambio]");
    if (botonCambio) cambiarCantidad(Number(botonCambio.dataset.id), Number(botonCambio.dataset.cambio));
});

vaciarReservacion.addEventListener("click", () => {
    if (reservas.length > 0) confirmarVaciar.showModal();
});

cancelarVaciar.addEventListener("click", () => confirmarVaciar.close());
aceptarVaciar.addEventListener("click", () => {
    reservas = [];
    confirmarVaciar.close();
    actualizarResumen();
    aplicarFiltros();
    mostrarMensaje("Tu reservación está vacía.", "exito");
});

// Iniciar la app al abrir el HTML con un servidor local.
cargarExperiencias();
