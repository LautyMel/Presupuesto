import { state, savePymeState } from './state.js';
import { renderCatalogModal, addCatalogItem } from './catalog.js';
import { updatePreview, generatePDF, sendWhatsApp } from './preview.js';

document.addEventListener('DOMContentLoaded', () => {
    initForm();
    setupEventListeners();
    updateDatalist();
    addItem();
    updatePreview();
});

function initForm() {
    document.getElementById('fecha').valueAsDate = new Date();    
    document.getElementById('cfg-cuit').value = state.pyme.cuit;
    document.getElementById('cfg-direccion').value = state.pyme.direccion;
    document.getElementById('cfg-telefono-pyme').value = state.pyme.telefono;
}

function updateDatalist() {
    const datalist = document.getElementById('catalog-datalist');
    datalist.innerHTML = '';
    state.catalog.forEach(item => {
        const option = document.createElement('option');
        option.value = item.desc;
        option.label = `${item.unidad || 'un'} - $${item.precio.toLocaleString('es-AR')}`;
        datalist.appendChild(option);
    });
}

function setupEventListeners() {
    ['cliente', 'cliente-cuit', 'telefono', 'cliente-direccion', 'cliente-email', 'fecha', 'validez'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
    });

    ['cfg-cuit', 'cfg-direccion', 'cfg-telefono-pyme'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            savePymeState({
                cuit: document.getElementById('cfg-cuit').value,
                direccion: document.getElementById('cfg-direccion').value,
                telefono: document.getElementById('cfg-telefono-pyme').value
            });
            updatePreview();
        });
    });

    document.getElementById('cfg-logo-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                savePymeState({ logo: event.target.result });
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('btn-add-item').addEventListener('click', () => addItem());
    document.getElementById('btn-pdf').addEventListener('click', generatePDF);
    document.getElementById('btn-wsp').addEventListener('click', sendWhatsApp);

    const modalCatalog = document.getElementById('modal-catalog');
    document.getElementById('btn-open-catalog').addEventListener('click', () => {
        renderCatalogModal(onCatalogUpdated);
        modalCatalog.showModal();
    });
    document.getElementById('btn-close-catalog').addEventListener('click', () => modalCatalog.close());
    
    document.getElementById('btn-cat-add').addEventListener('click', () => {
        const desc = document.getElementById('cat-new-desc').value.trim();
        const unidad = document.getElementById('cat-new-unid').value.trim() || 'un';
        const precio = Number(document.getElementById('cat-new-price').value);
        
        addCatalogItem(desc, unidad, precio, onCatalogUpdated);
        
        document.getElementById('cat-new-desc').value = '';
        document.getElementById('cat-new-unid').value = 'un';
        document.getElementById('cat-new-price').value = '';
    });
}

function onCatalogUpdated() {
    updateDatalist();
    renderFormItems();
    updatePreview();
}

function addItem(desc = '', unidad = 'un', precio = 0) {
    state.items.push({ desc, cant: 1, unidad, precio });
    renderFormItems();
    updatePreview();
}

function removeItem(index) {
    state.items.splice(index, 1);
    renderFormItems();
    updatePreview();
}

function renderFormItems() {
    const container = document.getElementById('items-container');
    container.innerHTML = '';

    state.items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2';
        
        row.innerHTML = `
            <div>
                <input type="text" list="catalog-datalist" class="w-full border border-slate-300 p-2 rounded-lg text-xs input-desc focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Descripción del servicio..." value="${item.desc}">
            </div>
            <div class="flex gap-2 items-center">
                <input type="number" class="w-16 border border-slate-300 p-1.5 rounded-lg text-xs text-center input-cant" placeholder="Cant" value="${item.cant}" min="1">
                <input type="text" class="w-16 border border-slate-300 p-1.5 rounded-lg text-xs text-center input-unid" placeholder="Unid" value="${item.unidad || 'un'}">
                <input type="number" class="flex-grow border border-slate-300 p-1.5 rounded-lg text-xs input-precio" placeholder="Precio ($)" value="${item.precio || ''}" min="0">
                <button class="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg text-xs transition btn-delete" title="Eliminar ítem">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        const inputDesc = row.querySelector('.input-desc');
        const inputCant = row.querySelector('.input-cant');
        const inputUnid = row.querySelector('.input-unid');
        const inputPrecio = row.querySelector('.input-precio');
        const btnDelete = row.querySelector('.btn-delete');

        inputDesc.addEventListener('input', (e) => {
            const val = e.target.value;
            state.items[index].desc = val;
            
            const match = state.catalog.find(c => c.desc.toLowerCase() === val.toLowerCase());
            if (match) {
                state.items[index].unidad = match.unidad || 'un';
                state.items[index].precio = match.precio;
                renderFormItems();
            }
            updatePreview();
        });

        inputCant.addEventListener('input', (e) => {
            state.items[index].cant = Number(e.target.value);
            updatePreview();
        });

        inputUnid.addEventListener('input', (e) => {
            state.items[index].unidad = e.target.value;
            updatePreview();
        });

        inputPrecio.addEventListener('input', (e) => {
            state.items[index].precio = Number(e.target.value);
            updatePreview();
        });

        btnDelete.addEventListener('click', () => removeItem(index));

        container.appendChild(row);
    });
}
