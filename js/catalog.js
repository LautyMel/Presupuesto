import { state, saveCatalogState } from './state.js';

let editingIndex = null;

export function renderCatalogModal(onCatalogChange) {
    const catalogList = document.getElementById('catalog-list');
    catalogList.innerHTML = '';
    
    state.catalog.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'py-2 px-1';

        if (editingIndex === index) {
            li.innerHTML = `
                <div class="flex gap-2 items-center">
                    <input type="text" value="${item.desc}" class="border p-1 text-xs rounded flex-grow edit-desc">
                    <input type="text" value="${item.unidad || 'un'}" class="border p-1 text-xs rounded w-16 edit-unid">
                    <input type="number" value="${item.precio}" class="border p-1 text-xs rounded w-20 edit-precio">
                    <button class="bg-green-600 text-white px-2 py-1 rounded text-xs btn-save-edit"><i class="fas fa-check"></i></button>
                    <button class="bg-gray-400 text-white px-2 py-1 rounded text-xs btn-cancel-edit"><i class="fas fa-times"></i></button>
                </div>
            `;

            li.querySelector('.btn-save-edit').addEventListener('click', () => {
                const desc = li.querySelector('.edit-desc').value.trim();
                const unidad = li.querySelector('.edit-unid').value.trim() || 'un';
                const precio = Number(li.querySelector('.edit-precio').value);

                if (desc && precio >= 0) {
                    state.catalog[index] = { desc, unidad, precio };
                    saveCatalogState(state.catalog);
                    editingIndex = null;
                    renderCatalogModal(onCatalogChange);
                    if (onCatalogChange) onCatalogChange();
                }
            });

            li.querySelector('.btn-cancel-edit').addEventListener('click', () => {
                editingIndex = null;
                renderCatalogModal(onCatalogChange);
            });
        } else {
            li.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <span class="font-semibold block">${item.desc}</span>
                        <span class="text-xs text-gray-500">Unidad: ${item.unidad || 'un'} | $${item.precio.toLocaleString('es-AR')}</span>
                    </div>
                    <div class="flex gap-2">
                        <button class="text-blue-600 hover:text-blue-800 text-sm p-1 btn-edit-cat"><i class="fas fa-edit"></i></button>
                        <button class="text-red-500 hover:text-red-700 text-sm p-1 btn-delete-cat"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;

            li.querySelector('.btn-edit-cat').addEventListener('click', () => {
                editingIndex = index;
                renderCatalogModal(onCatalogChange);
            });

            li.querySelector('.btn-delete-cat').addEventListener('click', () => {
                deleteCatalogItem(index, onCatalogChange);
            });
        }

        catalogList.appendChild(li);
    });
}

export function addCatalogItem(desc, unidad, precio, onCatalogChange) {
    if (desc && precio >= 0) {
        state.catalog.push({ desc, unidad: unidad || 'un', precio });
        saveCatalogState(state.catalog);
        renderCatalogModal(onCatalogChange);
        if (onCatalogChange) onCatalogChange();
    }
}

function deleteCatalogItem(index, onCatalogChange) {
    state.catalog.splice(index, 1);
    saveCatalogState(state.catalog);
    renderCatalogModal(onCatalogChange);
    if (onCatalogChange) onCatalogChange();
}