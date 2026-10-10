# Explora Riviera Maya — actividad sumativa de frontend

Proyecto académico de Aplicaciones Web, Unidad 2. Está construido con HTML, CSS y JavaScript puro. Las reservaciones se mantienen solo mientras la página está abierta: no existe backend, base de datos ni almacenamiento local.

## Archivos

- `index.html`: estructura de la página.
- `styles.css`: diseño y adaptación a computadora, tableta y celular.
- `app.js`: carga del JSON, filtros, DOM, eventos, reservaciones, validaciones y cálculos.
- `data/experiencias.json`: las 10 experiencias, precios académicos, cupos y categorías.

## Cómo abrirlo

1. Abre esta carpeta completa con Visual Studio Code.
2. En `index.html`, utiliza **Open with Live Server**.
4. No abras el HTML solo con doble clic, porque `fetch()` necesita un servidor local.
5. Abre `F12 > Console` para revisar errores. Usa la vista adaptable para probar el celular.

Alternativa si tienes Python instalado: `python -m http.server 5500` y abre `http://localhost:5500`.

## Pruebas sugeridas

1. Deben verse 10 experiencias al cargar.
2. Busca `Cenote` y verifica que solo aparezca Cenote Azul.
3. Selecciona `Actividades acuáticas`: deben aparecer **Snorkel en arrecife** y **Paseo en catamarán**. Comprueba que también funciona la búsqueda y el precio máximo.
4. Filtra `Naturaleza` y escribe precio máximo `400`: debe aparecer Cenote Azul ($350) y Observación de aves ($300).
5. Cambia el orden con el botón: original, menor precio y mayor precio. Los filtros deben mantenerse.
6. Agrega 2 personas a Cenote Azul: subtotal y total $700; personas 2.
7. Suma 1 desde Mi reservación: total $1,050; personas 3.
8. Intenta reservar 16 personas en Cenote Azul: debe mostrarse un mensaje de error y mantenerse el total.
9. Elimina una reserva y verifica el nuevo total.
10. Haz clic en Vaciar reservación, primero Cancelar y después confirma: debe quedar total $0.
11. Prueba la visualización en 1100 px, 700 px y 400 px de ancho (3, 2 y 1 columnas).

## Publicación en GitHub

En VS Code abre **Control de código fuente**: inicializa el repositorio (si todavía no existe), prepara archivos con `+`, escribe un mensaje y haz **Commit**. Si es nuevo usa **Publish to GitHub**. Si ya existe Git remoto, utiliza **Push/Sync Changes**. Confirma en GitHub que también esté la carpeta `data` con `experiencias.json`.

## Entrega en Teams

Prepara un documento con capturas en escritorio y celular, enlace del repositorio, explicación de 3 funciones y 3 manipulaciones del DOM y lista de pruebas con resultados. Adjunta el documento en la tarea correspondiente.
