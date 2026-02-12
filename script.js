// ------------------------
// VARIABLES GLOBALES
// ------------------------
let chargers = [];
let editIndex = null;
let draggedIndex = null;


let paso = {
    nombre: '',
    fecha: '',
    medidas: '',
    pesoTotal: 0,
    numBanzos: 0,
    numCargadoresPorBanzo: 0,
    numCargadores: 0,
    pesoMedio: 0,
    imagen: ''
};

// ------------------------
// CAMBIO DE SECCIONES
// ------------------------
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(section).style.display = 'block';
    if(section === 'mapa') renderMapChargerList();
    if(section === 'paso') cargarDatosPaso();
}

// ------------------------
// MODAL CARGADORES
// ------------------------
function openModal(index = null){
    document.getElementById('modal').style.display = 'block';
    if(index !== null){
        editIndex = index;
        const c = chargers[index];
        document.getElementById('modalTitle').innerText = "Editar Cargador";
        document.getElementById('nombre').value = c.nombre;
        document.getElementById('edad').value = c.edad;
        document.getElementById('telefono').value = c.telefono;
        document.getElementById('estatura').value = c.estatura;
        document.getElementById('colorTunica').value = c.colorTunica;
        document.getElementById('ubicacion').value = c.ubicacion;
    } else {
        editIndex = null;
        document.getElementById('modalTitle').innerText = "Agregar Cargador";
        document.querySelectorAll('#modal input, #modal select').forEach(i => i.value = '');
    }
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

function saveCharger() {
    const c = {
        nombre: document.getElementById('nombre').value,
        edad: document.getElementById('edad').value,
        telefono: document.getElementById('telefono').value,
        estatura: document.getElementById('estatura').value,
        colorTunica: document.getElementById('colorTunica').value,
        ubicacion: document.getElementById('ubicacion').value
    };
    if(editIndex !== null) chargers[editIndex] = c;
    else chargers.push(c);

    closeModal();
    updateChargerList();
}

function deleteCharger(index){
    chargers.splice(index, 1);
    updateChargerList();
}

function updateChargerList(){
    const list = document.getElementById('chargerList');
    list.innerHTML = '';
    chargers.forEach((c,i) => {
        const li = document.createElement('li');
        li.textContent = `${c.nombre} - ${c.edad} años - ${c.telefono} - ${c.estatura}m - ${c.colorTunica} - ${c.ubicacion}`;
        const editBtn = document.createElement('button'); editBtn.textContent='Editar'; editBtn.onclick = () => openModal(i);
        const delBtn = document.createElement('button'); delBtn.textContent='Borrar'; delBtn.onclick = () => deleteCharger(i);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
        list.appendChild(li);
    });

    localStorage.setItem('chargers', JSON.stringify(chargers));
    renderMapChargerList();
}

function cargarChargers(){
    const saved = localStorage.getItem('chargers');
    if(saved){
        chargers = JSON.parse(saved);
        updateChargerList();
    }
}

// ------------------------
// DATOS DEL PASO
// ------------------------
function habilitarEdicion() {
    document.querySelectorAll('#pasoForm input, #pasoForm select, #pasoForm textarea').forEach(i => i.disabled = false);
    // Guardar estado desbloqueado
    localStorage.setItem('pasoBloqueado', 'false');
}
// ------------------------
// INPUT MANUAL DEL NOMBRE DEL PASO EN EL MAPA
// ------------------------
const nombreMapaInput = document.getElementById('nombrePasoMapaInput');

// Rellenar el input al cargar los datos del paso
function actualizarNombrePasoMapa() {
    if(nombreMapaInput) nombreMapaInput.value = paso.nombre || '';
}

// Detectar cambios manuales en el input
if(nombreMapaInput){
    nombreMapaInput.addEventListener('input', e => {
        paso.nombre = e.target.value;                   // Actualiza el objeto paso
        localStorage.setItem('paso', JSON.stringify(paso)); // Guarda en localStorage
    });
}


function guardarPaso() {
    paso.nombre = document.getElementById('nombrePaso').value;
    paso.fecha = document.getElementById('fechaPaso').value;
    paso.medidas = document.getElementById('medidas').value;
    paso.pesoTotal = parseFloat(document.getElementById('pesoTotal').value) || 0;
    paso.numBanzos = parseInt(document.getElementById('numBanzos').value) || 0;
    paso.numCargadoresPorBanzo = parseInt(document.getElementById('numCargadoresPorBanzo').value) || 0;
    paso.numCargadores = paso.numBanzos * paso.numCargadoresPorBanzo;
    paso.pesoMedio = paso.numCargadores > 0 ? (paso.pesoTotal / paso.numCargadores).toFixed(2) : 0;

    document.getElementById('numCargadores').value = paso.numCargadores;
    document.getElementById('pesoMedio').value = paso.pesoMedio;

    localStorage.setItem('paso', JSON.stringify(paso));

    // Bloquear inputs después de guardar
    document.querySelectorAll('#pasoForm input, #pasoForm select, #pasoForm textarea').forEach(i => i.disabled = true);

    // Guardar estado bloqueado
    localStorage.setItem('pasoBloqueado', 'true');

    // Crear mapa automáticamente
    crearMapaBanzos(paso.numBanzos, paso.numCargadoresPorBanzo);
}


function cargarDatosPaso() {
    const saved = localStorage.getItem('paso');
    if(saved) paso = JSON.parse(saved);

    document.getElementById('nombrePaso').value = paso.nombre;
    document.getElementById('fechaPaso').value = paso.fecha;
    document.getElementById('medidas').value = paso.medidas;
    document.getElementById('pesoTotal').value = paso.pesoTotal || '';
    document.getElementById('numBanzos').value = paso.numBanzos || '';
    document.getElementById('numCargadoresPorBanzo').value = paso.numCargadoresPorBanzo || '';
    document.getElementById('numCargadores').value = paso.numCargadores || '';
    document.getElementById('pesoMedio').value = paso.pesoMedio || '';

    if(paso.imagen){
        const img = document.getElementById('previewImagen');
        img.src = paso.imagen;
        img.style.display='block';
    }

    // Bloquear o habilitar inputs según el estado guardado
    const bloqueado = localStorage.getItem('pasoBloqueado') !== 'false'; // si no existe, bloqueado por defecto
    document.querySelectorAll('#pasoForm input, #pasoForm select, #pasoForm textarea')
        .forEach(i => i.disabled = bloqueado);
        actualizarNombrePasoMapa();

}


// Imagen paso
document.getElementById('imagenPaso').addEventListener('change', function(){
    const file = this.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = e=>{
            paso.imagen = e.target.result;
            const img = document.getElementById('previewImagen');
            img.src = paso.imagen;
            img.style.display='block';
        };
        reader.readAsDataURL(file);
    }
});

// Actualización dinámica de cálculos y mapa
['pesoTotal','numBanzos','numCargadoresPorBanzo'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return; // por seguridad
    el.addEventListener('input', actualizarDatosPaso);
    el.addEventListener('change', actualizarDatosPaso);
});


function actualizarDatosPaso(){
    const pesoTotal = parseFloat(document.getElementById('pesoTotal').value) || 0;
    const numBanzos = parseInt(document.getElementById('numBanzos').value) || 0;
    const numPorBanzo = parseInt(document.getElementById('numCargadoresPorBanzo').value) || 0;

    const total = numBanzos * numPorBanzo;
    document.getElementById('numCargadores').value = total;
    document.getElementById('pesoMedio').value = total > 0 ? (pesoTotal / total).toFixed(2) : 0;

    crearMapaBanzos(numBanzos, numPorBanzo);
    
}

// ------------------------
// MAPA DINÁMICO FINAL
// ------------------------
function crearMapaBanzos(numBanzos, numPorBanzo){
    const mapArea = document.getElementById('mapArea');
    mapArea.innerHTML = '';

    // Contenedores generales con título arriba
    const delanterosDiv = document.createElement('div');
    delanterosDiv.className = 'banzos-container';
    const tituloDelanteros = document.createElement('h3');
    tituloDelanteros.textContent = 'Delanteros';
    delanterosDiv.appendChild(tituloDelanteros);
    delanterosDiv.style.display = 'flex';
    delanterosDiv.style.flexDirection = 'row';
    delanterosDiv.style.marginBottom = '20px';
    delanterosDiv.style.alignItems = 'flex-start';

    const traserosDiv = document.createElement('div');
    traserosDiv.className = 'banzos-container';
    const tituloTraseros = document.createElement('h3');
    tituloTraseros.textContent = 'Traseros';
    traserosDiv.appendChild(tituloTraseros);
    traserosDiv.style.display = 'flex';
    traserosDiv.style.flexDirection = 'row';
    traserosDiv.style.marginBottom = '20px';
    traserosDiv.style.alignItems = 'flex-start';

    mapArea.appendChild(delanterosDiv);
    mapArea.appendChild(traserosDiv);

    // Dividir banzos en delanteros y traseros
    const mitad = Math.ceil(numBanzos / 2);
    const restantes = numBanzos - mitad;

    function crearBanzos(div, cantidadBanzos, tipo){
        for(let i = 0; i < cantidadBanzos; i++){
            const banzo = document.createElement('div');
            banzo.className = 'banzo';
            banzo.dataset.tipo = tipo;
            banzo.style.display = 'flex';
            banzo.style.flexDirection = 'column'; // filas de slots
            banzo.style.alignItems = 'center';
            banzo.style.justifyContent = 'center';
            banzo.style.border = '1px dashed transparent';
            banzo.style.padding = '5px';
            banzo.style.marginRight = '10px'; // espacio entre columnas

            for(let j = 0; j < numPorBanzo; j++){
                const slot = document.createElement('div');
                slot.className = 'slot';
                slot.dataset.asignado = '';
                slot.dataset.tipo = tipo;
                slot.style.width = '120px';
                slot.style.height = '80px';
                slot.style.background = '#eee';
                slot.style.border = '1px solid #ccc';
                slot.style.borderRadius = '5px';
                slot.style.display = 'flex';
                slot.style.justifyContent = 'center';
                slot.style.alignItems = 'center';
                slot.style.fontSize = '16px';
                slot.style.fontWeight = 'bold';
                slot.style.margin = '3px';

                // Drag & Drop
                slot.ondragover = e => e.preventDefault();
                slot.ondrop = e => {
                    slot.addEventListener('touchend', () => {
    if(draggedIndex === null) return;

    const c = chargers[draggedIndex];
    const mapUbicacion = { 'delantera':'delantero', 'trasera':'trasero' };

    if(mapUbicacion[c.ubicacion.toLowerCase()] !== tipo){
        alert(`Este cargador es ${c.ubicacion} y no puede colocarse aquí.`);
        return;
    }

    document.querySelectorAll('.slot').forEach(s => {
        if(s.dataset.asignado === c.nombre){
            s.textContent = '';
            s.style.background = '#eee';
            s.dataset.asignado = '';
        }
    });

    slot.textContent = c.nombre;
    slot.style.background = c.colorTunica;
    slot.style.color = 'white';
    slot.dataset.asignado = c.nombre;

    guardarSlots();
    draggedIndex = null;
});

                    e.preventDefault();
                   const index = draggedIndex !== null ? draggedIndex : e.dataTransfer.getData('text');

                    const c = chargers[index];
                    const mapUbicacion = { 'delantera':'delantero', 'trasera':'trasero' };

                    // Verificar ubicación correcta
                    if(mapUbicacion[c.ubicacion.toLowerCase()] !== tipo){
                        alert(`Este cargador es ${c.ubicacion} y no puede colocarse aquí.`);
                        return;
                    }

                    // Liberar cargador anterior
                    document.querySelectorAll('.slot').forEach(s => {
                        if(s.dataset.asignado === c.nombre){
                            s.textContent = '';
                            s.style.background = '#eee';
                            s.dataset.asignado = '';
                        }
                    });

                    // Asignar cargador al slot
                    slot.textContent = c.nombre;
                    slot.style.background = c.colorTunica;
                    slot.style.color = 'white';
                    slot.dataset.asignado = c.nombre;

                    guardarSlots();
                };

                banzo.appendChild(slot);
            }

            div.appendChild(banzo);
        }
    }

    // Crear delanteros y traseros
    crearBanzos(delanterosDiv, mitad, 'delantero');
    crearBanzos(traserosDiv, restantes, 'trasero');

    // Restaurar slots guardados
    cargarSlots();
}

// Guardar estado de los slots
function guardarSlots() {
    const slotsData = [];
    document.querySelectorAll('.slot').forEach(slot => {
        if(slot.dataset.asignado){
            const banzo = slot.parentElement;
            const contenedor = banzo.parentElement; // banzos-container
            const banzoIndex = Array.from(contenedor.children).indexOf(banzo) - 1; // restar 1 porque child[0] es h3
            const slotIndex = Array.from(banzo.children).indexOf(slot);

            slotsData.push({
                nombre: slot.dataset.asignado,
                tipo: slot.dataset.tipo,
                banzoIndex,
                slotIndex
            });
        }
    });
    localStorage.setItem('slots', JSON.stringify(slotsData));
    draggedIndex = null;

}

// Cargar slots guardados
function cargarSlots() {
    const saved = localStorage.getItem('slots');
    if(!saved) return;
    const slotsData = JSON.parse(saved);

    slotsData.forEach(s => {
        // obtener contenedor por tipo
        const contenedor = s.tipo === 'delantero'
            ? document.querySelector('#mapArea .banzos-container:nth-of-type(1)')
            : document.querySelector('#mapArea .banzos-container:nth-of-type(2)');

        if(contenedor){
            const banzo = contenedor.children[s.banzoIndex + 1]; // +1 porque child[0] es h3
            if(banzo){
                const slot = banzo.children[s.slotIndex];
                if(slot){
                    slot.dataset.asignado = s.nombre;
                    slot.textContent = s.nombre;
                    const c = chargers.find(c => c.nombre === s.nombre);
                    if(c){
                        slot.style.background = c.colorTunica;
                        slot.style.color = 'white';
                    }
                }
            }
        }
    });
}



// ------------------------
// LISTA PARA ARRASTRAR
// ------------------------
function renderMapChargerList(){
    const mapList = document.getElementById('mapChargerList');
    mapList.innerHTML = '';

    // Crear contenedor flex para separar delanteros y traseros
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'space-between';

    // Contenedores internos
    const delanterosDiv = document.createElement('div');
    delanterosDiv.style.width = '48%';
    delanterosDiv.innerHTML = '<h4>Delanteros</h4>';
    const traserosDiv = document.createElement('div');
    traserosDiv.style.width = '48%';
    traserosDiv.innerHTML = '<h4>Traseros</h4>';

    // Filtrar cargadores
    const delanteros = chargers.filter(c => c.ubicacion.toLowerCase() === 'delantera');
    const traseros = chargers.filter(c => c.ubicacion.toLowerCase() === 'trasera');

    // Función para crear lista enumerada manualmente
    function crearLista(div, lista){
        const ul = document.createElement('ul');
        ul.style.paddingLeft = '20px'; // espacio para numeración
        lista.forEach((c,i) => {
            const li = document.createElement('li');
            li.textContent = `${i + 1}. ${c.nombre}`; // numeración manual
            li.draggable = true;

li.ondragstart = e => {
    draggedIndex = chargers.indexOf(c);
    e.dataTransfer.setData('text', draggedIndex);
};

// Soporte móvil
li.addEventListener('touchstart', () => {
    draggedIndex = chargers.indexOf(c);
});

            ul.appendChild(li);
        });
        div.appendChild(ul);
    }

    crearLista(delanterosDiv, delanteros);
    crearLista(traserosDiv, traseros);

    container.appendChild(delanterosDiv);
    container.appendChild(traserosDiv);
    mapList.appendChild(container);
}

// ------------------------
// EXPORT PDF
// ------------------------
function exportPDF(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("DATOS DEL PASO",10,10);
    doc.text("Nombre: "+paso.nombre,10,20);
    doc.text("Fecha Ejecución: "+paso.fecha,10,30);
    doc.text("Medidas: "+paso.medidas+"m",10,40);
    doc.text("Peso Total: "+paso.pesoTotal+" kg",10,50);
    doc.text("Número de Cargadores: "+paso.numCargadores,10,60);
    doc.text("Peso Medio por Cargador: "+paso.pesoMedio+" kg",10,70);
    doc.text("LISTA DE CARGADORES:",10,80);
    chargers.forEach((c,i)=>{
        doc.text(`${i+1}. ${c.nombre}, ${c.edad} años, ${c.telefono}, ${c.estatura}m, ${c.colorTunica}, ${c.ubicacion}`,10,90+i*10);
    });
    doc.save("Paso_Cargadores.pdf");
}

// ------------------------
// EXPORT JPG
// ------------------------
function exportMapJPG() {

    const mapArea = document.getElementById('mapArea');
    const nombrePaso = document.getElementById('nombrePasoMapaInput')?.value || 'Mapa del Paso';

    html2canvas(mapArea).then(canvasMapa => {

        const paddingTop = 60; // espacio para el título
        const nuevoCanvas = document.createElement('canvas');
        const ctx = nuevoCanvas.getContext('2d');

        nuevoCanvas.width = canvasMapa.width;
        nuevoCanvas.height = canvasMapa.height + paddingTop;

        // Fondo blanco
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, nuevoCanvas.width, nuevoCanvas.height);

        // Título
        ctx.fillStyle = "#000000";
        ctx.font = "bold 28px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText(nombrePaso, nuevoCanvas.width / 2, 40);

        // Dibujar mapa debajo
        ctx.drawImage(canvasMapa, 0, paddingTop);

        // Descargar JPG
        const link = document.createElement('a');
        link.download = "mapa_paso.jpg";
        link.href = nuevoCanvas.toDataURL("image/jpeg", 0.95);
        link.click();
    });
}


// ------------------------
// INICIALIZACIÓN
// ------------------------
window.onload = ()=>{
    cargarDatosPaso();
    cargarChargers();
    if(paso.numBanzos && paso.numCargadoresPorBanzo){
        crearMapaBanzos(paso.numBanzos, paso.numCargadoresPorBanzo);
         cargarSlots(); // restaurar slots
    }
};
