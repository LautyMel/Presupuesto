// Estado global con almacenamiento local
const state = {
    items: [],
    catalog: JSON.parse(localStorage.getItem('sacchi_catalog')) || [
        { desc: 'Instalación Split 3000 Frigorías', precio: 85000 },
        { desc: 'Mantenimiento Preventivo / Limpieza', precio: 35000 },
        { desc: 'Carga de Gas Refrigerante R410', precio: 45000 }
    ],
    pyme: JSON.parse(localStorage.getItem('sacchi_pyme_info')) || {
        cuit: '30-71234567-8',
        direccion: 'Av. Libertador 4500, CABA',
        telefono: '+54 9 11 5555-6666',
       
        logo: ''
    },
    numeroPresupuesto: Math.floor(1000 + Math.random() * 9000)
};

let DOM = {};

document.addEventListener('DOMContentLoaded', () => {
    // Inicialización del mapeo de elementos una vez cargado el DOM
    DOM = {
        cliente: document.getElementById('cliente'),
        telefono: document.getElementById('telefono'),
        fecha: document.getElementById('fecha'),
        validez: document.getElementById('validez'),
        itemsContainer: document.getElementById('items-container'),
        
        // Config Pyme
        cfgLogoFile: document.getElementById('cfg-logo-file'),
        cfgCuit: document.getElementById('cfg-cuit'),
        cfgDireccion: document.getElementById('cfg-direccion'),
        cfgTelefonoPyme: document.getElementById('cfg-telefono-pyme'),
        cfgCbu: document.getElementById('cfg-cbu'),
        
        // Preview
        prevLogo: document.getElementById('prev-logo'),
        prevPymeCuit: document.getElementById('prev-pyme-cuit'),
        prevPymeDir: document.getElementById('prev-pyme-dir'),
        prevCbuText: document.getElementById('prev-cbu-text'),
        prevCliente: document.getElementById('prev-cliente'),
        prevTelefono: document.getElementById('prev-telefono'),
        prevFecha: document.getElementById('prev-fecha'),
        prevNumero: document.getElementById('prev-numero'),
        prevValidez: document.getElementById('prev-validez'),
        prevItems: document.getElementById('prev-items'),
        prevTotal: document.getElementById('prev-total'),
        
        // Botones
        btnAddItem: document.getElementById('btn-add-item'),
        btnPDF: document.getElementById('btn-pdf'),
        btnWsp: document.getElementById('btn-wsp'),
        
        // Modal Catálogo
        modalCatalog: document.getElementById('modal-catalog'),
        btnOpenCatalog: document.getElementById('btn-open-catalog'),
        btnCloseCatalog: document.getElementById('btn-close-catalog'),
        btnCatAdd: document.getElementById('btn-cat-add'),
        catNewDesc: document.getElementById('cat-new-desc'),
        catNewPrice: document.getElementById('cat-new-price'),
        catalogList: document.getElementById('catalog-list')
    };

    DOM.fecha.valueAsDate = new Date();
    DOM.prevNumero.innerText = state.numeroPresupuesto;

    loadPymeConfigInputs();
    setupEventListeners();
    addItem();
    updatePreview();
});

function loadPymeConfigInputs() {
    DOM.cfgCuit.value = state.pyme.cuit;
    DOM.cfgDireccion.value = state.pyme.direccion;
    DOM.cfgTelefonoPyme.value = state.pyme.telefono;
    DOM.cfgCbu.value = state.pyme.cbu;
}

function setupEventListeners() {
    ['cliente', 'telefono', 'fecha', 'validez'].forEach(id => DOM[id].addEventListener('input', updatePreview));

    [DOM.cfgCuit, DOM.cfgDireccion, DOM.cfgTelefonoPyme, DOM.cfgCbu].forEach(input => {
        input.addEventListener('input', savePymeInfo);
    });

    DOM.cfgLogoFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                state.pyme.logo = event.target.result;
                savePymeInfo();
            };
            reader.readAsDataURL(file);
        }
    });

    DOM.btnAddItem.addEventListener('click', () => addItem());
    DOM.btnPDF.addEventListener('click', generatePDF);
    DOM.btnWsp.addEventListener('click', sendWhatsApp);

    DOM.btnOpenCatalog.addEventListener('click', () => {
        renderCatalogModal();
        DOM.modalCatalog.showModal();
    });
    DOM.btnCloseCatalog.addEventListener('click', () => DOM.modalCatalog.close());
    DOM.btnCatAdd.addEventListener('click', addCatalogItem);
}

function savePymeInfo() {
    state.pyme.cuit = DOM.cfgCuit.value;
    state.pyme.direccion = DOM.cfgDireccion.value;
    state.pyme.telefono = DOM.cfgTelefonoPyme.value;
    state.pyme.cbu = DOM.cfgCbu.value;
    
    localStorage.setItem('sacchi_pyme_info', JSON.stringify(state.pyme));
    updatePreview();
}

function addItem(desc = '', precio = 0) {
    state.items.push({ desc, cant: 1, precio });
    renderFormItems();
    updatePreview();
}

function removeItem(index) {
    state.items.splice(index, 1);
    renderFormItems();
    updatePreview();
}

function updateItem(index, field, value) {
    state.items[index][field] = value;
    updatePreview();
}

function renderFormItems() {
    DOM.itemsContainer.innerHTML = '';
    state.items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'flex flex-col gap-1 bg-gray-50 p-2 rounded border';
        
        let selectOptions = `<option value="">-- Seleccionar del catálogo --</option>`;
        state.catalog.forEach((catItem, catIndex) => {
            selectOptions += `<option value="${catIndex}">${catItem.desc} ($${catItem.precio.toLocaleString('es-AR')})</option>`;
        });

        row.innerHTML = `
            <div class="flex gap-2 items-center">
                <select class="w-full border p-1 rounded text-xs text-gray-600 cat-select">
                    ${selectOptions}
                </select>
            </div>
            <div class="flex gap-2 items-center">
                <input type="text" class="flex-grow border p-2 rounded text-sm input-desc" placeholder="Descripción" value="${item.desc}">
                <input type="number" class="w-16 border p-2 rounded text-sm input-cant" placeholder="Cant" value="${item.cant}" min="1">
                <input type="number" class="w-24 border p-2 rounded text-sm input-precio" placeholder="Precio ($)" value="${item.precio || ''}" min="0">
                <button class="text-red-500 hover:text-red-700 p-2 btn-delete"><i class="fas fa-trash"></i></button>
            </div>
        `;

        const select = row.querySelector('.cat-select');
        const inputDesc = row.querySelector('.input-desc');
        const inputCant = row.querySelector('.input-cant');
        const inputPrecio = row.querySelector('.input-precio');
        const btnDelete = row.querySelector('.btn-delete');

        select.addEventListener('change', (e) => {
            const catIndex = e.target.value;
            if (catIndex !== '') {
                const catItem = state.catalog[catIndex];
                updateItem(index, 'desc', catItem.desc);
                updateItem(index, 'precio', catItem.precio);
                renderFormItems();
            }
        });

        inputDesc.addEventListener('input', (e) => updateItem(index, 'desc', e.target.value));
        inputCant.addEventListener('input', (e) => updateItem(index, 'cant', Number(e.target.value)));
        inputPrecio.addEventListener('input', (e) => updateItem(index, 'precio', Number(e.target.value)));
        btnDelete.addEventListener('click', () => removeItem(index));

        DOM.itemsContainer.appendChild(row);
    });
}

function updatePreview() {
    DOM.prevPymeCuit.innerText = `CUIT: ${state.pyme.cuit || '--'}`;
    DOM.prevPymeDir.innerText = `${state.pyme.direccion || '--'} | Tel: ${state.pyme.telefono || '--'}`;
    DOM.prevCbuText.innerText = state.pyme.cbu || 'No especificado';

    if (state.pyme.logo) {
        DOM.prevLogo.src = state.pyme.logo;
        DOM.prevLogo.classList.remove('hidden');
    } else {
        DOM.prevLogo.classList.add('hidden');
    }

    DOM.prevCliente.innerText = DOM.cliente.value || 'Nombre del Cliente';
    DOM.prevTelefono.innerText = DOM.telefono.value || 'Teléfono';
    DOM.prevValidez.innerText = DOM.validez.value || '15';

    if (DOM.fecha.value) {
        const [y, m, d] = DOM.fecha.value.split('-');
        DOM.prevFecha.innerText = `${d}/${m}/${y}`;
    }

    DOM.prevItems.innerHTML = '';
    let total = 0;

    if (state.items.length === 0) {
        DOM.prevItems.innerHTML = '<tr><td colspan="4" class="p-3 text-center text-gray-400">No hay ítems agregados</td></tr>';
    }

    state.items.forEach(item => {
        const subtotal = item.cant * item.precio;
        total += subtotal;
        if (item.desc !== '' || item.precio > 0) {
            DOM.prevItems.innerHTML += `
                <tr class="border-b border-gray-100">
                    <td class="p-3">${item.desc || '<em>Sin descripción</em>'}</td>
                    <td class="p-3 text-center">${item.cant}</td>
                    <td class="p-3 text-right">$${item.precio.toLocaleString('es-AR')}</td>
                    <td class="p-3 text-right font-semibold">$${subtotal.toLocaleString('es-AR')}</td>
                </tr>
            `;
        }
    });

    DOM.prevTotal.innerText = '$' + total.toLocaleString('es-AR', { minimumFractionDigits: 2 });
}

function renderCatalogModal() {
    DOM.catalogList.innerHTML = '';
    state.catalog.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center py-2 px-1';
        li.innerHTML = `
            <div>
                <span class="font-semibold block">${item.desc}</span>
                <span class="text-xs text-gray-500">$${item.precio.toLocaleString('es-AR')}</span>
            </div>
            <button class="text-red-500 hover:text-red-700 text-sm p-1" onclick="deleteCatalogItem(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        DOM.catalogList.appendChild(li);
    });
}

function addCatalogItem() {
    const desc = DOM.catNewDesc.value.trim();
    const precio = Number(DOM.catNewPrice.value);

    if (desc && precio >= 0) {
        state.catalog.push({ desc, precio });
        localStorage.setItem('sacchi_catalog', JSON.stringify(state.catalog));
        DOM.catNewDesc.value = '';
        DOM.catNewPrice.value = '';
        renderCatalogModal();
        renderFormItems();
    }
}

function deleteCatalogItem(index) {
    state.catalog.splice(index, 1);
    localStorage.setItem('sacchi_catalog', JSON.stringify(state.catalog));
    renderCatalogModal();
    renderFormItems();
}

function generatePDF() {
    const element = document.getElementById('invoice');
    const cliente = DOM.cliente.value || 'Cliente';
    const opt = {
        margin: 0,
        filename: `Presupuesto para ${cliente.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

function sendWhatsApp() {
    const telefono = DOM.telefono.value.replace(/[^0-9]/g, '');
    if (!telefono) {
        alert('Por favor ingresa un número de WhatsApp válido.');
        return;
    }

    let total = 0;
    let itemsTexto = '';

    state.items.forEach(item => {
        if (item.desc) {
            const sub = item.cant * item.precio;
            total += sub;
            itemsTexto += `\n- ${item.cant}x ${item.desc}: $${sub.toLocaleString('es-AR')}`;
        }
    });

    const totalFormat = '$' + total.toLocaleString('es-AR', { minimumFractionDigits: 2 });
    const mensaje = `Hola ${DOM.cliente.value || 'Cliente'},\nTe envío el resumen de tu presupuesto de *Sacchi Instalaciones*:${itemsTexto}\n\n*TOTAL: ${totalFormat}*\n\nSi estás de acuerdo, confirmame y coordinamos. ¡Saludos!`;

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
}
