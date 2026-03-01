// ------------------------
// VARIABLES GLOBALES
// ------------------------z
let chargers = [];
let editIndex = null;
let draggedIndex = null;
let imagenBase64 = "";


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
function cargarNombreMapa(){

    const nombreMapa = localStorage.getItem('nombreMapa');

    const input = document.getElementById('nombrePasoMapaInput');

    if(input && nombreMapa){
        input.value = nombreMapa;
    }
}
function inicializarEventosDOM(){

    const nombreMapaInput = document.getElementById('nombrePasoMapaInput');

    if(nombreMapaInput){
        nombreMapaInput.addEventListener('input', e => {
            localStorage.setItem('nombreMapa', e.target.value);
        });
    }


    // IMAGEN

document.getElementById('imagenPaso').addEventListener('change', function(e){

    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(ev){
        imagenBase64 = ev.target.result;

        const img = document.getElementById('previewImagen');
        img.src = imagenBase64;
        img.style.display = 'block';
    };

    reader.readAsDataURL(file);
});

}


// ------------------------
// INICIALIZACIÓN
// ------------------------
window.addEventListener('DOMContentLoaded', () => {

    if(localStorage.getItem('pasoBloqueado') === null){
        localStorage.setItem('pasoBloqueado', 'true');
    }

    cargarPaso();
    cargarChargers();
    cargarNombreMapa();


   setTimeout(() => {
    aplicarBloqueo();
}, 100);


    inicializarEventosDOM();
    crearMapaBanzos(paso.numBanzos, paso.numCargadoresPorBanzo);

});


// -----------------------
// NAVEGACIÓN ENTRE SECCIONES
// ------------------------
function showSection(section) {

    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(section).style.display = 'block';

    if(section === 'mapa'){
        renderMapChargerList();

        // 🔥 PINTAR MAPA SIEMPRE
        crearMapaBanzos(paso.numBanzos, paso.numCargadoresPorBanzo);
    }

    if(section === 'paso'){
        cargarPaso();

        setTimeout(() => {
            aplicarBloqueo();
        }, 50);
    }
}

// ------------------------
// MODAL CARGADORES
// ------------------------
function openModal(index = null){
    document.getElementById('modal').style.display = 'block';
    if(index !== null){
    editIndex = index;
    const c = chargers[index];
    const anioActual = new Date().getFullYear();
    const edadActual = c.edadInicial + (anioActual - c.anioRegistro);

    document.getElementById('modalTitle').innerText = "Editar Cargador";
    document.getElementById('nombre').value = c.nombre;
    document.getElementById('edad').value = edadActual;
    document.getElementById('telefono').value = c.telefono;
    document.getElementById('estatura').value = c.estatura;
    document.getElementById('colorTunica').value = c.colorTunica;
    document.getElementById('ubicacion').value = c.ubicacion;
    } else {
        editIndex = null;
        document.getElementById('modalTitle').innerText = "AGREGAR CARGADOR";
        document.querySelectorAll('#modal input, #modal select').forEach(i => i.value = '');
    }
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

function saveCharger() {
    const anioActual = new Date().getFullYear();

    const c = {
        nombre: document.getElementById('nombre').value,
        edadInicial: parseInt(document.getElementById('edad').value), // edad al registrar
        anioRegistro: anioActual, // año en que se registró
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
    const anioActual = new Date().getFullYear();

    chargers.forEach((c,i) => {
        const edadActual = c.edadInicial + (anioActual - c.anioRegistro); // recalcula la edad
        const li = document.createElement('li');
        li.textContent = `${c.nombre} / ${edadActual} años / ${c.telefono} / ${c.estatura} m / ${c.colorTunica} / ${c.ubicacion}`;

        const editBtn = document.createElement('button'); 
        editBtn.textContent='Editar'; 
        editBtn.onclick = () => openModal(i);

        const delBtn = document.createElement('button'); 
        delBtn.textContent='Borrar'; 
        delBtn.onclick = () => deleteCharger(i);

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
function editarPaso(){
    localStorage.setItem('pasoBloqueado', 'false');
    aplicarBloqueo();
}


function guardarPaso(){

  const img = document.getElementById('previewImagen');

let imagenFinal = paso.imagen || "";

if (img && img.src && img.src.startsWith('data:image')) {
    imagenFinal = img.src;
}



    paso = {
        nombre: document.getElementById('nombrePaso').value,
        jefeHorquilla: document.getElementById("jefeHorquilla").value,
        fecha: document.getElementById('fechaPaso').value,
        medidas: document.getElementById('medidas').value,
        pesoTotal: parseFloat(document.getElementById('pesoTotal').value) || 0,
        numBanzos: parseInt(document.getElementById('numBanzos').value) || 0,
        numCargadoresPorBanzo: parseInt(document.getElementById('numCargadoresPorBanzo').value) || 0,
        imagen: imagenFinal
    };

    paso.numCargadores = paso.numBanzos * paso.numCargadoresPorBanzo;
    paso.pesoMedio = paso.numCargadores ? (paso.pesoTotal / paso.numCargadores).toFixed(2) : 0;

    localStorage.setItem('paso', JSON.stringify(paso));

    localStorage.setItem('pasoBloqueado', 'true');
    aplicarBloqueo();

    crearMapaBanzos(paso.numBanzos, paso.numCargadoresPorBanzo);

    // limpiar input file
    document.getElementById('imagenPaso').value = "";
  


}

function cargarPaso(){
    imagenBase64 = "";


    const data = JSON.parse(localStorage.getItem('paso'));

    if(!data) return;

    paso = data;

    document.getElementById('nombrePaso').value = paso.nombre || '';
    document.getElementById("jefeHorquilla").value = paso.jefeHorquilla || "";
    document.getElementById('fechaPaso').value = paso.fecha || '';
    document.getElementById('medidas').value = paso.medidas || '';
    document.getElementById('pesoTotal').value = paso.pesoTotal || '';
    document.getElementById('numBanzos').value = paso.numBanzos || '';
    document.getElementById('numCargadoresPorBanzo').value = paso.numCargadoresPorBanzo || '';
    document.getElementById('numCargadores').value = paso.numCargadores || '';
    document.getElementById('pesoMedio').value = paso.pesoMedio || '';

   const img = document.getElementById('previewImagen');

if (paso.imagen) {
    img.src = paso.imagen;
    img.style.display = 'block';
} else {
    img.src = '';
    img.style.display = 'none';
}



    // 🔥 GENERAR MAPA SIEMPRE AL CARGAR
    crearMapaBanzos(paso.numBanzos, paso.numCargadoresPorBanzo);

}


// ------------------------
// BLOQUEO / DESBLOQUEO
// ------------------------
function aplicarBloqueo(){

    const bloqueado = localStorage.getItem('pasoBloqueado') === 'true';

    const form = document.getElementById('pasoForm');
    if(!form) return;

    const elementos = form.querySelectorAll('input, select, textarea');

    elementos.forEach(el => {

        // 🔥 AHORA SÍ bloqueamos también el file
        if(el.type === 'file') {
            el.disabled = bloqueado;

            if(bloqueado){
                el.style.opacity = '0.6';
            } else {
                el.style.opacity = '1';
            }

        } else {
            el.disabled = bloqueado;
        }

    });

    console.log("Bloqueado:", bloqueado);
}




// ------------------------
// ACTUALIZAR DATOS DINÁMICAMENTE
// ------------------------
['pesoTotal','numBanzos','numCargadoresPorBanzo'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
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

    paso.numBanzos = numBanzos;
    paso.numCargadoresPorBanzo = numPorBanzo;
    paso.numCargadores = total;
    paso.pesoMedio = total > 0 ? (pesoTotal / total).toFixed(2) : 0;

    localStorage.setItem('paso', JSON.stringify(paso));

    crearMapaBanzos(numBanzos, numPorBanzo);
}

// ------------------------
// MAPA DINÁMICO
// ------------------------
function crearMapaBanzos(numBanzos, numPorBanzo){
    const mapArea = document.getElementById('mapArea');
    mapArea.innerHTML = '';

    function crearContenedor(tituloText){
        const div = document.createElement('div');
        div.className='banzos-container';
        const titulo = document.createElement('h3'); titulo.textContent = tituloText;
        div.appendChild(titulo);
        div.style.display='flex';
        div.style.flexDirection='row';
        div.style.overflowX='auto';  // scroll horizontal si hay muchos banzos
        div.style.gap='10px';
        div.style.marginBottom='20px';
        div.style.alignItems='flex-start';
        return div;
    }

    const delanterosDiv = crearContenedor('Delanteros');
    const traserosDiv = crearContenedor('Traseros');

    mapArea.appendChild(delanterosDiv);
    mapArea.appendChild(traserosDiv);

    const mitad = Math.ceil(numBanzos / 2);
    const restantes = numBanzos - mitad;

    function crearBanzos(div, cantidadBanzos, tipo){
        for(let i=0;i<cantidadBanzos;i++){
            const banzo = document.createElement('div');
            banzo.className='banzo';
            banzo.dataset.tipo=tipo;
            banzo.style.display='flex';
            banzo.style.flexDirection='column';
            banzo.style.alignItems='center';
            banzo.style.justifyContent='flex-start';
            banzo.style.border='1px dashed transparent';
            banzo.style.padding='5px';
            banzo.style.minWidth='140px';

            // Slots dentro del banzo
            for(let j=0;j<numPorBanzo;j++){
                const slot = document.createElement('div');
                slot.className='slot';
                slot.dataset.asignado='';
                slot.dataset.tipo=tipo;

                // ancho proporcional: ocupa todo el ancho del banzo
                const slotWidth = 120 - (numPorBanzo-3)*15; // ajusta según numPorBanzo
                slot.style.width = `${slotWidth}px`;
                slot.style.height='80px';
                slot.style.background='#eee';
                slot.style.border='1px solid #ccc';
                slot.style.borderRadius='5px';
                slot.style.display='flex';
                slot.style.justifyContent='center';
                slot.style.alignItems='center';
                slot.style.fontSize='16px';
                slot.style.fontWeight='bold';
                slot.style.margin='3px';
                slot.style.color='black';

                // Drag & Drop
                slot.ondragover = e => e.preventDefault();
                slot.ondrop = e => {
                    e.preventDefault();
                    const index = draggedIndex !== null ? draggedIndex : e.dataTransfer.getData('text');
                    const c = chargers[index];
                    const mapUbicacion = { 'delantera':'delantero', 'trasera':'trasero' };
                    if(mapUbicacion[c.ubicacion.toLowerCase()] !== tipo){
                        alert(`Este cargador es ${c.ubicacion} y no puede colocarse aquí.`);
                        return;
                    }
                    document.querySelectorAll('.slot').forEach(s=>{
                        if(s.dataset.asignado===c.nombre){
                            s.textContent='';
                            s.style.background='#eee';
                            s.dataset.asignado='';
                        }
                    });
                    slot.textContent=c.nombre;
                    ajustarTextoEnSlot(slot);
                    slot.style.background=c.colorTunica;
                    slot.style.color='black';
                    slot.dataset.asignado=c.nombre;
                    guardarSlots();
                };

                banzo.appendChild(slot);
            }

            div.appendChild(banzo);
        }
    }

    crearBanzos(delanterosDiv, mitad, 'delantero');
    crearBanzos(traserosDiv, restantes, 'trasero');

    cargarSlots();
    activarDragMovil();
}

// ------------------------
// GUARDAR / CARGAR SLOTS
// ------------------------
function guardarSlots() {
    const slotsData = [];
    document.querySelectorAll('.slot').forEach(slot=>{
        if(slot.dataset.asignado){
            const banzo = slot.parentElement;
            const contenedor = banzo.parentElement;
            const banzoIndex = Array.from(contenedor.children).indexOf(banzo)-1;
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

function cargarSlots(){
    const saved = localStorage.getItem('slots');
    if(!saved) return;
    const slotsData = JSON.parse(saved);
    slotsData.forEach(s=>{
        const contenedor = s.tipo==='delantero'
            ? document.querySelector('#mapArea .banzos-container:nth-of-type(1)')
            : document.querySelector('#mapArea .banzos-container:nth-of-type(2)');
        if(contenedor){
            const banzo = contenedor.children[s.banzoIndex+1];
            if(banzo){
                const slot = banzo.children[s.slotIndex];
                if(slot){
                    slot.dataset.asignado=s.nombre;
                    slot.textContent=s.nombre;
                    ajustarTextoEnSlot(slot);
                    const c = chargers.find(c=>c.nombre===s.nombre);
                    if(c){
                        slot.style.background=c.colorTunica;
                        slot.style.color='black';
                    }
                }
            }
        }
    });
}

// ------------------------
// LISTA CARGADORES PARA DRAG
// ------------------------
function renderMapChargerList(){
    const mapList = document.getElementById('mapChargerList');
    mapList.innerHTML='';
    const container = document.createElement('div');
    container.style.display='flex';
    container.style.justifyContent='space-between';

    const delanterosDiv=document.createElement('div'); delanterosDiv.style.width='48%'; delanterosDiv.innerHTML='<h4>Delanteros</h4>';
    const traserosDiv=document.createElement('div'); traserosDiv.style.width='48%'; traserosDiv.innerHTML='<h4>Traseros</h4>';

    const delanteros = chargers.filter(c=>c.ubicacion.toLowerCase()==='delantera');
    const traseros = chargers.filter(c=>c.ubicacion.toLowerCase()==='trasera');

    function crearLista(div, lista){
        const ul = document.createElement('ul'); ul.style.paddingLeft='20px';
        lista.forEach((c,i)=>{
            const li=document.createElement('li');
            li.textContent=`${i+1}. ${c.nombre}`;
            li.draggable=true;
            li.ondragstart = e=>{
                draggedIndex = chargers.indexOf(c);
                e.dataTransfer.setData('text', draggedIndex);
            };
            li.addEventListener('touchstart', ()=>{ draggedIndex = chargers.indexOf(c); });
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
// DRAG PARA MÓVIL (VERSIÓN FINAL)
// ------------------------

let lastHighlightedSlot = null;

function activarDragMovil(){

    const items = document.querySelectorAll('#mapChargerList li');

    items.forEach(li=>{

        // evitar duplicados de eventos
        li.ontouchstart = null;
        li.ontouchmove = null;
        li.ontouchend = null;

       li.addEventListener('touchstart', e=>{
        document.body.classList.add('dragging-active');


    e.preventDefault(); // 🔥 MUY IMPORTANTE

    const touch = e.touches[0];

    li.classList.add('dragging');

    const nombre = li.textContent.replace(/^\d+\.\s/, '');
    draggedIndex = chargers.findIndex(c => c.nombre === nombre);

    li.style.position = 'fixed';
    li.style.zIndex = '9999';
    li.style.left = touch.clientX + 'px';
    li.style.top = touch.clientY + 'px';
    li.style.pointerEvents = 'none';

});


       li.addEventListener('touchmove', e=>{
        document.body.classList.add('dragging-active');


    e.preventDefault(); // 🔥 CLAVE PARA QUE FUNCIONE EN MÓVIL

    const touch = e.touches[0];

    // mover elemento
    li.style.left = (touch.clientX - 40) + 'px';
    li.style.top = (touch.clientY - 20) + 'px';

    // 🔥 DETECCIÓN REAL DEL SLOT
    const element = document.elementFromPoint(
        touch.clientX,
        touch.clientY
    );

    // limpiar todos
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));

    if(element && element.classList.contains('slot')){
        element.classList.add('highlight');
        lastHighlightedSlot = element;
    } else {
        lastHighlightedSlot = null;
    }

});


        li.addEventListener('touchend', e=>{

            li.classList.remove('dragging');

            if(lastHighlightedSlot && draggedIndex !== null){

                const slot = lastHighlightedSlot;
                const c = chargers[draggedIndex];

                const tipoSlot = slot.dataset.tipo;
                const mapUbicacion = { 'delantera':'delantero', 'trasera':'trasero' };

                if(mapUbicacion[c.ubicacion.toLowerCase()] !== tipoSlot){
                    alert(`Este cargador es ${c.ubicacion} y no puede colocarse aquí.`);
                } else {

                    // quitar si ya estaba en otro slot
                    document.querySelectorAll('.slot').forEach(s=>{
                        if(s.dataset.asignado === c.nombre){
                            s.textContent = '';
                            s.style.background = '#eee';
                            s.dataset.asignado = '';
                        }
                    });

                    // asignar al nuevo slot
                    slot.textContent = c.nombre;
                    ajustarTextoEnSlot(slot);
                    slot.style.background = c.colorTunica;
                    slot.style.color = 'black';
                    slot.dataset.asignado = c.nombre;

                    guardarSlots();
                }
            }

            // limpiar highlights
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
            lastHighlightedSlot = null;

            // resetear estilo del li
            li.style.position = '';
            li.style.left = '';
            li.style.top = '';
            li.style.zIndex = '';
            li.style.pointerEvents = '';

            draggedIndex = null;

        });

    });

}


function ajustarTextoEnSlot(slot){
    let fontSize=14;
    slot.style.fontSize=fontSize+'px';
    while(slot.scrollWidth>slot.clientWidth || slot.scrollHeight>slot.clientHeight){
        fontSize--;
        slot.style.fontSize=fontSize+'px';
        if(fontSize<=8) break;
    }
}

function exportPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    // 🔰 TU ESCUDO EN BASE64 (PEGA AQUÍ EL TUYO COMPLETO)
    const escudoBase64 = "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AAAAAAAAAAAAAQAAAAAAACQCACAAAQACAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAACAACAAQAACAAAAAAAACAAAAAAAAAAAAAAACAAAAAAAAASAAAQASAAAAAAAAAAAAAQAAAAAAAAAAAAAACAAAAAAAACAAAAAAAAACAAAAAAAAACAAAAAAAAAAAAAAQAAAAAAAAAQAAAAAAAAAQAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQQAAAAAAAAAAAASQSAACAAAAAAAAAAAAAAAAAAAAAAAACCQSAAAAAAAAAAASSSACSAAAAAAAAAAAAAAAAAAAAAAAAAAACSQAAAAACAAQAAQSQQAAAAAAAAAAAAAAAAAAAAAAAAAQCQCQAAAAAQCAAACQAACQAAAAAAAAAAAAAAAQAAAQAAAQSAAQAAAAAASCCQCCSSQAAAAAAAAAAAAAAAAQAACQQAASASAAAAAAAAAACQSCSCSSQAAAAAAAAAAAAAACAAAACCQQAAQAAAAAAAACAAQAAAAACAQAAAAAAAAAAAAAAASQACAQAAAAQACAAQQAAAAAAQCQAASAAAAAAAAAAAAAQACAQCAAAAAACAQSAACQAAQSACCSACAAAAAAAAAAAAAAAACSSSSAQAAAAQCSAAQAAAASAACSAAQAACAAAAAAAAAAAQASCCAQAAAAACAAAAAQAAAACACQAAAQAAQAAAAAAAAAAAACAACCCQAAAAQAAAQAAAAAAAQCQQCCQAAAAAAAAAAAAAAACSQAACAAAACAAAAAAAAAAACACACCQAAAAAAAAAAAAAAAAQACACAAAAAQAAASAQAAAAACCCASAAAAAAAAAAAAAAAAAAQCAQAAAAACAAQCCAACAASACAAQAAAAAAAAAAAAAAAAAAAAAQAQASCASAAAAQQAAACQCAAQCAAAAAAAAAAAAAAAAAAAACAAQQQAQQAAAQAAQQCQAAAACQAAAAAAAAAAAAAAAAAAAAQSAAQCQCCQQCQQQAQSSAQAAASAAAAAAAAAAAAAAAAAAACAASQCSSCASACSAAAAAASCCQACAAAAAAAAAAAAAAAAAAAAACQAAQQACQAQCACQAACSCCCQCQAAAAAAAAAAAAAAASQACAAAASCACQAQAACSAACAASCQQAAAAAAAAAAAAAAACCQQQQACACSASCCCCAACACACQSQQAQSAQAAAAAAAAAAACACAQAAASSAQACSAQACQCAQAASAQACCSAAAAAAAAAAAAASCSSSQACCAQQAACQQACSQAQACCSSAAAQAAAAAAAAAAAAACAAQAAACACAQQCAASASSAQAASAAQCACAAAAAAAAAAAAAAAACQAAAQAQACSQACQASAAQAAAQAAQCAAAAAAAAAAAAAQCAASQQAAACQAQAACQACQAACAQCCQACAAAAAAAAAAAAASAAAAACAAAASACCAASAASAAAQAAQAAQQAAAAAAAAAAAAASAQAAAQAAACQAAQQCSQCQAAQQAACAACAQAAAAAAAAAAAAACACAQAAAASAACSASAASAAAACACAACQAAAAAAAAAAAAACAACCSAQAASQAQCAACACQAAAQCQCCAAAAAAAAAAAAAAAASAASACQAAASQCSAAASQCAACCSACCCQAAAAAAAAAAAAAACCQAAAAQSAAAAQAAAACCAAASAAQAQAAAAAAAAAAAAAAAACQACQACSCCASAQAAAAQCASCACAAAAAAAAAAAAAAAAAAAAACQAAAQAQQSCAAAACAACQAAQACSAAAQAAAAAAAAAAAAAQACCAAAAAAAQQAAAAAAACQACAASAAAAAAAAAAAAAAAAAACACQAAAAQQAAAAAAAAAACSQAAAAAAAAAAAAAAAAAAAAAAAAAAACCAQAAAAAAAAAAAQCQAAAAACAAAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAAAAQAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAA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";

    // 🔰 ESCUDO ARRIBA DERECHA
    const escudoSize = 18;

    doc.addImage(
        escudoBase64,
        'JPEG',
        pageWidth - margin - escudoSize,
        5,
        escudoSize,
        escudoSize
    );

    // 🏛️ NOMBRE COFRADÍA
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(12);

    doc.text(
        "COFRADIA DE JESÚS NAZARENO Y ÁNIMAS DE LA CAMPANILLA",
        pageWidth / 2,
        12,
        { align: "center" }
    );

    let y = 25;

   // 🔹 TÍTULO
doc.setFontSize(10);
doc.setFont("helvetica", "bold");

// X = margen izquierdo (ej. 10), Y = posición vertical actual
doc.text("DATOS DEL PASO", 10, y);

y += 10;

doc.setFontSize(10);
doc.setFont("helvetica", "normal");

const lineHeight = 7;

    // DATOS
    const pasoDatos = [
        `Nombre: ${paso.nombre}`,
        `Jefe de Horquilla: ${paso.jefeHorquilla}`,
        `Fecha Ejecución: ${paso.fecha}`,
        `Medidas: ${paso.medidas} m`,
        `Peso Total: ${paso.pesoTotal} kg`,
        `Número de Cargadores: ${paso.numCargadores}`,
        `Peso Medio por Cargador: ${paso.pesoMedio} kg`
    ];

    pasoDatos.forEach(texto => {
        doc.text(texto, margin, y);
        y += lineHeight;
    });

    y += 5;

    doc.setFont("helvetica", "bold");
    doc.text("LISTA DE CARGADORES:", margin, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");

    // CABECERA
    const headers = ["Nº", "Nombre", "Edad", "Teléfono", "Estatura", "Color", "Ubicación"];
    const colWidths = [10, 50, 25, 35, 25, 25, 25];

    let x = margin;

    headers.forEach((h, i) => {
        doc.text(h, x, y);
        x += colWidths[i];
    });

    y += lineHeight;

    // FILAS
    chargers.forEach((c, i) => {

        x = margin;

        const anioActual = new Date().getFullYear();
        const edadActual = c.edadInicial + (anioActual - c.anioRegistro);

        const row = [
            (i + 1).toString(),
            c.nombre,
            edadActual + " años",
            c.telefono,
            c.estatura + " m",
            c.colorTunica,
            c.ubicacion
        ];

        if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin + 5;
        }

        row.forEach((text, j) => {
            doc.text(text, x, y);
            x += colWidths[j];
        });

        y += lineHeight;
    });

    doc.save("Paso_Cargadores.pdf");
}

// ------------------------
// EXPORT JPG
// ------------------------
function exportMapJPG() {
    const mapArea = document.getElementById('mapArea');
    const nombrePaso = document.getElementById('nombrePasoMapaInput')?.value || 'Mapa del Paso';

    // clonar el mapa
    const tempContainer = mapArea.cloneNode(true);
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.overflow = 'visible';
    tempContainer.style.display = 'flex';
    tempContainer.style.flexDirection = 'column';
    tempContainer.style.width = 'auto';
    tempContainer.style.height = 'auto';
    document.body.appendChild(tempContainer);

    // forzar que los contenedores internos expandan su scroll
    tempContainer.querySelectorAll('.banzos-container').forEach(div => {
        div.style.overflow = 'visible';
        div.style.width = div.scrollWidth + 'px';
    });

    html2canvas(tempContainer, { scale: 2, useCORS: true, allowTaint: true }).then(canvasMapa => {
        const paddingTop = 60;
        const nuevoCanvas = document.createElement('canvas');
        const ctx = nuevoCanvas.getContext('2d');

        nuevoCanvas.width = canvasMapa.width;
        nuevoCanvas.height = canvasMapa.height + paddingTop;

        // fondo blanco
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, nuevoCanvas.width, nuevoCanvas.height);

        // nombre del paso arriba
        ctx.fillStyle = "#000000";
        ctx.font = "bold 28px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText(nombrePaso, nuevoCanvas.width / 2, 40);

        // dibujar mapa completo
        ctx.drawImage(canvasMapa, 0, paddingTop);

        // descargar
        const link = document.createElement('a');
        link.download = "mapa_paso.jpg";
        link.href = nuevoCanvas.toDataURL("image/jpeg", 0.95);
        link.click();

        // limpiar
        document.body.removeChild(tempContainer);
    });
}
// ------------------------
// EXPORTAR DATOS (BACKUP)
// ------------------------
function exportData() {

    const data = {
        chargers: JSON.parse(localStorage.getItem('chargers')) || [],
        paso: JSON.parse(localStorage.getItem('paso')) || {},
        slots: JSON.parse(localStorage.getItem('slots')) || [],
        nombreMapa: localStorage.getItem('nombreMapa') || "",
        pasoBloqueado: localStorage.getItem('pasoBloqueado') || "true"
    };

    const json = JSON.stringify(data, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "backup_paso.json";
    a.click();

    URL.revokeObjectURL(url);
}
// ------------------------
// IMPORTAR DATOS (RESTORE)
// ------------------------
function importData(event) {

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {

            const data = JSON.parse(e.target.result);

            localStorage.setItem('chargers', JSON.stringify(data.chargers || []));
            localStorage.setItem('paso', JSON.stringify(data.paso || {}));
            localStorage.setItem('slots', JSON.stringify(data.slots || []));
            localStorage.setItem('nombreMapa', data.nombreMapa || "");
            localStorage.setItem('pasoBloqueado', data.pasoBloqueado || "true");

            alert("Datos importados correctamente ✅");

            // Recargar la app completa
            location.reload();

        } catch (error) {
            console.error(error);
            alert("Error al importar el archivo ❌");
        }
    };

    reader.readAsText(file);
}
// 🔐 USUARIO Y CONTRASEÑA
const USER = "Cofradia";
const PASS = "Nazareno";

// 🔐 LOGIN
function login() {
    const user = document.getElementById("usuario").value;
    const pass = document.getElementById("password").value;

    if (user === USER && pass === PASS) {
        localStorage.setItem("logged", "true");

        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";
    } else {
        document.getElementById("errorLogin").innerText = "Usuario o contraseña incorrectos";
    }
}

// 🔐 AUTO LOGIN
window.onload = function() {
    if (localStorage.getItem("logged") === "true") {
        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";
    } else {
        document.getElementById("login").style.display = "block";
        document.getElementById("app").style.display = "none";
    }
}

// 🔐 LOGOUT (opcional)
function logout() {
    localStorage.removeItem("logged");
    location.reload();
}

