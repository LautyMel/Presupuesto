export const state = {
    items: [],
    catalog: JSON.parse(localStorage.getItem('sacchi_catalog')) || [
        { desc: 'Instalación Split 3000 Frigorías', unidad: 'un', precio: 85000 },
        { desc: 'Mantenimiento Preventivo / Limpieza', unidad: 'un', precio: 35000 },
        { desc: 'Carga de Gas Refrigerante R410', unidad: 'un', precio: 45000 },
        { desc: 'Cañería adicional de cobre', unidad: 'm', precio: 12000 }
    ],
    pyme: JSON.parse(localStorage.getItem('sacchi_pyme_info')) || {
        cuit: '30-71234567-8',
        direccion: 'Av. Libertador 4500, CABA',
        telefono: '+54 9 11 5555-6666',
        logo: ''
    },
    numeroPresupuesto: Math.floor(1000 + Math.random() * 9000)
};

export function savePymeState(data) {
    state.pyme = { ...state.pyme, ...data };
    localStorage.setItem('sacchi_pyme_info', JSON.stringify(state.pyme));
}

export function saveCatalogState(catalogArray) {
    state.catalog = catalogArray;
    localStorage.setItem('sacchi_catalog', JSON.stringify(state.catalog));
}