// ------------------------
// VARIABLES GLOBALES
// ------------------------
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
        document.getElementById('modalTitle').innerText = "Agregar Cargador";
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
        li.textContent = `${c.nombre} - ${edadActual} años - ${c.telefono} - ${c.estatura}m - ${c.colorTunica} - ${c.ubicacion}`;

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
// DRAG PARA MÓVIL
// ------------------------
let lastHighlightedSlot = null;

function activarDragMovil(){

    document.querySelectorAll('#mapChargerList li').forEach(li=>{

        li.addEventListener('touchstart', e=>{

            li.classList.add('dragging');

            // 🔥 GUARDAR INDEX DEL CARGADOR
            const nombre = li.textContent.replace(/^\d+\.\s/, '');
            draggedIndex = chargers.findIndex(c => c.nombre === nombre);

        });

        li.addEventListener('touchmove', e=>{

            const touch = e.touches[0];

            li.style.position='absolute';
            li.style.zIndex=1000;
            li.style.left=(touch.clientX-40)+'px';
            li.style.top=(touch.clientY-20)+'px';

            // 🔥 IMPORTANTE
            li.style.pointerEvents = 'none';

            const element = document.elementFromPoint(touch.clientX, touch.clientY);

            // quitar resaltado
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

            // volver a activar eventos
            li.style.pointerEvents = 'auto';

            if(lastHighlightedSlot && draggedIndex !== null){

                const slot = lastHighlightedSlot;
                const c = chargers[draggedIndex];

                const tipoSlot = slot.dataset.tipo;
                const mapUbicacion = { 'delantera':'delantero', 'trasera':'trasero' };

                if(mapUbicacion[c.ubicacion.toLowerCase()]!==tipoSlot){
                    alert(`Este cargador es ${c.ubicacion} y no puede colocarse aquí.`);
                } else {

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
                }
            }

            // quitar resaltado
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('highlight'));
            lastHighlightedSlot = null;

            li.style.position='';
            li.style.left='';
            li.style.top='';
            li.style.zIndex='';

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

    // Crear contenedor temporal
    const tempContainer = mapArea.cloneNode(true);
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px'; // Fuera de pantalla
    tempContainer.style.width = mapArea.scrollWidth + 'px';
    tempContainer.style.height = mapArea.scrollHeight + 'px';
    tempContainer.style.overflow = 'visible'; // Asegura que todo sea visible
    document.body.appendChild(tempContainer);

    html2canvas(tempContainer).then(canvasMapa => {
        const paddingTop = 60;
        const nuevoCanvas = document.createElement('canvas');
        const ctx = nuevoCanvas.getContext('2d');

        nuevoCanvas.width = canvasMapa.width;
        nuevoCanvas.height = canvasMapa.height + paddingTop;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, nuevoCanvas.width, nuevoCanvas.height);

        ctx.fillStyle = "#000000";
        ctx.font = "bold 28px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText(nombrePaso, nuevoCanvas.width / 2, 40);

        ctx.drawImage(canvasMapa, 0, paddingTop);

        const link = document.createElement('a');
        link.download = "mapa_paso.jpg";
        link.href = nuevoCanvas.toDataURL("image/jpeg", 0.95);
        link.click();

        // Limpiar contenedor temporal
        document.body.removeChild(tempContainer);
    });
}



