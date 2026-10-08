const sellerButtons = [...document.querySelectorAll('.seller-option')];
const actionButtons = [...document.querySelectorAll('.action-button')];
const submitButton = document.querySelector('#submit-button');
const locationStatus = document.querySelector('#location-status');
const coordinates = document.querySelector('#coordinates');
const resultMessage = document.querySelector('#result-message');
const photoInput = document.querySelector('#photo-input');
let selectedSeller = null;
let selectedAction = null;
let position = null;
let photoData = null;

const now = new Date();
document.querySelector('#today').textContent = new Intl.DateTimeFormat('es-PE', { dateStyle: 'full' }).format(now);

function updateSubmitState() {
  submitButton.disabled = !(selectedSeller && selectedAction && position);
}

sellerButtons.forEach((button) => button.addEventListener('click', () => {
  sellerButtons.forEach((item) => item.classList.remove('selected'));
  button.classList.add('selected');
  selectedSeller = button.dataset.seller;
  resultMessage.textContent = '';
  updateSubmitState();
}));

actionButtons.forEach((button) => button.addEventListener('click', () => {
  actionButtons.forEach((item) => item.classList.remove('selected'));
  button.classList.add('selected');
  selectedAction = button.dataset.action;
  resultMessage.textContent = '';
  updateSubmitState();
}));

document.querySelector('#locate-button').addEventListener('click', () => {
  if (!('geolocation' in navigator)) {
    locationStatus.textContent = 'Este navegador no ofrece geolocalización.';
    return;
  }
  locationStatus.textContent = 'Solicitando permiso de ubicación…';
  navigator.geolocation.getCurrentPosition((result) => {
    position = { latitude: result.coords.latitude, longitude: result.coords.longitude, accuracy: result.coords.accuracy };
    locationStatus.textContent = `Ubicación obtenida · precisión aproximada ${Math.round(position.accuracy)} m`;
    coordinates.textContent = `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`;
    updateSubmitState();
  }, (error) => {
    const messages = { 1: 'Permiso denegado. Habilita la ubicación en tu navegador.', 2: 'No se pudo determinar la ubicación. Intenta nuevamente.', 3: 'La solicitud tardó demasiado. Intenta nuevamente.' };
    locationStatus.textContent = messages[error.code] || 'No se pudo obtener la ubicación.';
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
});

photoInput.addEventListener('change', () => {
  const file = photoInput.files?.[0];
  const preview = document.querySelector('#photo-preview');
  preview.replaceChildren();
  photoData = null;
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    resultMessage.textContent = 'Selecciona un archivo de imagen.';
    resultMessage.classList.add('error');
    return;
  }
  const image = document.createElement('img');
  image.alt = 'Vista previa de la evidencia';
  image.src = URL.createObjectURL(file);
  preview.append(image);
  photoData = file;
  resultMessage.textContent = '';
  resultMessage.classList.remove('error');
});

submitButton.addEventListener('click', () => {
  if (submitButton.disabled) return;
  const entry = {
    seller: selectedSeller,
    action: selectedAction,
    timestamp: new Date().toISOString(),
    location: position,
    photoName: photoData?.name || null,
  };
  const records = JSON.parse(localStorage.getItem('sistemas-ti-attendance') || '[]');
  records.push(entry);
  localStorage.setItem('sistemas-ti-attendance', JSON.stringify(records));
  resultMessage.classList.remove('error');
  resultMessage.textContent = `Marcación de ${selectedAction.toLowerCase()} guardada para Vendedor ${selectedSeller} a las ${new Intl.DateTimeFormat('es-PE', { timeStyle: 'medium' }).format(new Date(entry.timestamp))}.`;
});
