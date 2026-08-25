import { state } from './state.js';

export function updatePreview() {
    const clienteVal = document.getElementById('cliente').value || 'Nombre del Cliente';
    const cuitVal = document.getElementById('cliente-cuit').value || '--';
    const telefonoVal = document.getElementById('telefono').value || '--';
    const dirVal = document.getElementById('cliente-direccion').value || '--';
    const emailVal = document.getElementById('cliente-email').value || '--';
    
    const fechaVal = document.getElementById('fecha').value;
    const validezVal = document.getElementById('validez').value || '15';

    document.getElementById('prev-pyme-cuit').innerText = `CUIT: ${state.pyme.cuit || '--'}`;
    document.getElementById('prev-pyme-dir').innerText = `${state.pyme.direccion || '--'} | Tel: ${state.pyme.telefono || '--'}`;

    const logoImg = document.getElementById('prev-logo');
    if (state.pyme.logo) {
        logoImg.src = state.pyme.logo;
        logoImg.classList.remove('hidden');
    } else {
        logoImg.classList.add('hidden');
    }

    // Datos del cliente
    document.getElementById('prev-cliente').innerText = clienteVal;
    document.getElementById('prev-cliente-cuit').innerHTML = `<span class="font-medium text-slate-400">CUIT/DNI:</span> ${cuitVal}`;
    document.getElementById('prev-telefono').innerHTML = `<span class="font-medium text-slate-400">Tel:</span> ${telefonoVal}`;
    document.getElementById('prev-cliente-dir').innerHTML = `<span class="font-medium text-slate-400">Dirección:</span> ${dirVal}`;
    document.getElementById('prev-cliente-email').innerHTML = `<span class="font-medium text-slate-400">Email:</span> ${emailVal}`;

    document.getElementById('prev-validez').innerText = validezVal;

    if (fechaVal) {
        const [y, m, d] = fechaVal.split('-');
        document.getElementById('prev-fecha').innerText = `${d}/${m}/${y}`;
    }

    const tbody = document.getElementById('prev-items');
    tbody.innerHTML = '';
    let total = 0;

    if (state.items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400">No hay ítems agregados al presupuesto</td></tr>';
    }

    state.items.forEach(item => {
        const subtotal = item.cant * item.precio;
        total += subtotal;
        if (item.desc !== '' || item.precio > 0) {
            tbody.innerHTML += `
                <tr>
                    <td class="font-medium text-slate-800">${item.desc || '<em>Sin descripción</em>'}</td>
                    <td class="text-center font-semibold">${item.cant}</td>
                    <td class="text-center text-slate-400">${item.unidad || 'un'}</td>
                    <td class="text-right">$${item.precio.toLocaleString('es-AR')}</td>
                    <td class="text-right font-bold text-slate-900">$${subtotal.toLocaleString('es-AR')}</td>
                </tr>
            `;
        }
    });

    document.getElementById('prev-total').innerText = '$' + total.toLocaleString('es-AR', { minimumFractionDigits: 2 });
}

export function generatePDF() {
    const element = document.getElementById('invoice');
    const cliente = document.getElementById('cliente').value || 'Cliente';

    // 1. Guardar la posición del scroll y mover la pantalla al inicio para captura exacta
    const currentScroll = window.scrollY;
    window.scrollTo(0, 0);

    const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `Presupuesto para ${cliente.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0,
            scrollX: 0,
            logging: false
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // 2. Generar el PDF y restaurar la vista del usuario
    window.html2pdf().set(opt).from(element).save().then(() => {
        window.scrollTo(0, currentScroll);
    });
}

export function sendWhatsApp() {
    const telefono = document.getElementById('telefono').value.replace(/[^0-9]/g, '');
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
            itemsTexto += `\n- ${item.cant} ${item.unidad || 'un'} x ${item.desc}: $${sub.toLocaleString('es-AR')}`;
        }
    });

    const totalFormat = '$' + total.toLocaleString('es-AR', { minimumFractionDigits: 2 });
    const clienteVal = document.getElementById('cliente').value || 'Cliente';
    const mensaje = `Hola ${clienteVal},\nTe envío el presupuesto de *Sacchi Instalaciones*:${itemsTexto}\n\n*TOTAL: ${totalFormat}*\n\n¡Saludos!`;

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
}
