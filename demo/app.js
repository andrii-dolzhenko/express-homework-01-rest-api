const API_BASE = window.location.origin;
const IS_LOCAL_API = ['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port === '3000';
const OPERATIONS = {
  list: { method: 'GET', needsId: false, needsValue: false },
  read: { method: 'GET', needsId: true, needsValue: false },
  create: { method: 'POST', needsId: false, needsValue: true },
  update: { method: 'PUT', needsId: true, needsValue: true },
  remove: { method: 'DELETE', needsId: true, needsValue: false },
};
const INITIAL_DATA = {
  users: [{ id: 'user-1', name: 'Initial User' }],
  articles: [{ id: 'article-1', title: 'Initial Article' }],
};

let mockDatabase;
let nextMockId;
const resetMockDatabase = () => {
  mockDatabase = Object.fromEntries(
    Object.entries(INITIAL_DATA).map(([key, values]) => [key, new Map(values.map((value) => [value.id, { ...value }]))]),
  );
  nextMockId = 1;
};
resetMockDatabase();

const $ = (id) => document.getElementById(id);
const state = { resource: 'users', operation: 'list', lastResponse: '' };
const fieldName = () => (state.resource === 'users' ? 'name' : 'title');
const escapeCurlSingleQuote = (value) => value.replace(/'/g, "'\\''");
const buildRequest = () => {
  const operation = OPERATIONS[state.operation];
  const id = $('recordId').value.trim();
  const path = `/${state.resource}${operation.needsId ? `/${encodeURIComponent(id)}` : ''}`;
  const payload = operation.needsValue ? { [fieldName()]: $('recordValue').value } : undefined;
  return { ...operation, path, payload, id };
};

function updateBuilder() {
  const request = buildRequest();
  $('idField').classList.toggle('hidden', !request.needsId);
  $('valueField').classList.toggle('hidden', !request.needsValue);
  $('valueLabel').textContent = fieldName().toUpperCase();
  $('recordId').placeholder = state.resource === 'users' ? 'e.g. user-1' : 'e.g. article-1';
  $('recordValue').placeholder = state.resource === 'users' ? 'e.g. Ada Lovelace' : 'e.g. Getting started with Express';
  $('endpointMethod').textContent = request.method;
  $('endpointMethod').className = `verb verb-${request.method.toLowerCase()}`;
  $('endpointPath').textContent = request.path;
  $('collectionName').textContent = `/${state.resource}`;
  for (const button of document.querySelectorAll('[data-resource]')) {
    const active = button.dataset.resource === state.resource;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  for (const button of document.querySelectorAll('[data-operation]')) {
    const active = button.dataset.operation === state.operation;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
}

function clearResponse() {
  const request = buildRequest();
  state.lastResponse = '';
  $('statusBadge').className = 'response-status';
  $('statusBadge').textContent = 'READY';
  $('responseMethod').textContent = request.method;
  $('responsePath').textContent = request.path;
  $('responseTime').textContent = '—';
  $('responseBody').textContent = 'Click “Send request” to see the response.';
  $('responseNote').textContent = 'Response status and body will appear here.';
}

function setResource(resource) {
  state.resource = resource;
  $('recordId').value = '';
  $('recordValue').value = '';
  updateBuilder();
  clearResponse();
  refreshCollection();
}
function setOperation(operation) {
  state.operation = operation;
  updateBuilder();
  clearResponse();
}

function simulateRequest(method, path, payload) {
  if (path === '/') return { status: 200, statusText: 'OK', body: 'Get root route' };
  const segments = path.split('/').filter(Boolean).map(decodeURIComponent);
  const [resource, id] = segments;
  const collection = mockDatabase[resource];
  if (!collection || segments.length > 2) return { status: 404, statusText: 'Not Found', body: 'Not Found' };
  if (method === 'GET' && !id) return { status: 200, statusText: 'OK', body: [...collection.values()] };
  if (method === 'GET' && id) {
    const record = collection.get(id);
    return record ? { status: 200, statusText: 'OK', body: { ...record } } : { status: 404, statusText: 'Not Found', body: 'Not Found' };
  }
  if (method === 'POST' && !id) {
    const key = resource === 'users' ? 'name' : 'title';
    if (typeof payload?.[key] !== 'string' || !payload[key].trim()) return { status: 400, statusText: 'Bad Request', body: 'Bad Request' };
    const newId = `${resource === 'users' ? 'user' : 'article'}-demo-${nextMockId++}`;
    const record = { id: newId, [key]: payload[key].trim() };
    collection.set(newId, record);
    return { status: 201, statusText: 'Created', body: { ...record } };
  }
  if (method === 'PUT' && id) {
    if (!collection.has(id)) return { status: 404, statusText: 'Not Found', body: 'Not Found' };
    const key = resource === 'users' ? 'name' : 'title';
    if (typeof payload?.[key] !== 'string' || !payload[key].trim()) return { status: 400, statusText: 'Bad Request', body: 'Bad Request' };
    const updated = { id, [key]: payload[key].trim() };
    collection.set(id, updated);
    return { status: 200, statusText: 'OK', body: { ...updated } };
  }
  if (method === 'DELETE' && id) {
    if (!collection.has(id)) return { status: 404, statusText: 'Not Found', body: 'Not Found' };
    collection.delete(id);
    return { status: 204, statusText: 'No Content', body: null };
  }
  return { status: 404, statusText: 'Not Found', body: 'Not Found' };
}

async function sendHttp(method, path, payload) {
  const start = performance.now();
  if (!IS_LOCAL_API) {
    const simulated = simulateRequest(method, path, payload);
    return { ...simulated, duration: Math.round(performance.now() - start) };
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    ...(payload === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  });
  const text = await response.text();
  let body = text || null;
  if (text && response.headers.get('content-type')?.includes('application/json')) {
    try { body = JSON.parse(text); } catch { /* Display the original body if it isn't valid JSON. */ }
  }
  return { status: response.status, statusText: response.statusText, body, duration: Math.round(performance.now() - start) };
}

function showResponse(request, result) {
  $('statusBadge').className = `response-status ${result.status >= 200 && result.status < 300 ? 'ok' : 'bad'}`;
  $('statusBadge').textContent = `${result.status} ${result.statusText}`;
  $('responseMethod').textContent = request.method;
  $('responsePath').textContent = request.path;
  $('responseTime').textContent = `${result.duration} ms`;
  state.lastResponse = typeof result.body === 'string' ? result.body : result.body === null ? '' : JSON.stringify(result.body, null, 2);
  $('responseBody').textContent = result.body === null ? '(empty response body)' : state.lastResponse;
  $('responseNote').textContent = result.status === 204 ? '204 responses intentionally have no response body.' : result.status >= 400 ? 'The API returned an error status. Check the request inputs or resource ID.' : 'Request completed successfully. View the collection below for current records.';
}

async function refreshCollection() {
  let result;
  try {
    result = await sendHttp('GET', `/${state.resource}`);
    if (result.status !== 200 || !Array.isArray(result.body)) throw new Error('Unexpected collection response');
  } catch (error) {
    $('recordsGrid').textContent = `Could not load records: ${error.message}`;
    return;
  }
  const grid = $('recordsGrid');
  grid.replaceChildren();
  for (const [index, record] of result.body.entries()) {
    const card = document.createElement('article');
    card.className = 'record-card';
    const number = document.createElement('div'); number.className = 'record-number'; number.textContent = `RECORD ${String(index + 1).padStart(2, '0')}`;
    const value = document.createElement('div'); value.className = 'record-value'; value.textContent = record[fieldName()] ?? '(no value)';
    const id = document.createElement('div'); id.className = 'record-id'; id.textContent = record.id;
    const select = document.createElement('button'); select.type = 'button'; select.className = 'record-select'; select.textContent = 'Use this ID ↗';
    select.addEventListener('click', () => {
      $('recordId').value = record.id;
      setOperation('read');
      document.querySelector('.request-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    card.append(number, value, id, select);
    grid.append(card);
  }
  if (!result.body.length) {
    const empty = document.createElement('div'); empty.className = 'records-empty'; empty.textContent = 'No records yet. Create one with POST to get started.'; grid.append(empty);
  }
  $(`${state.resource}Count`).textContent = String(result.body.length);
  if (!IS_LOCAL_API) {
    const other = state.resource === 'users' ? 'articles' : 'users';
    $(`${other}Count`).textContent = String(mockDatabase[other].size);
  }
}

async function runRequest(request) {
  $('sendButton').disabled = true;
  try {
    const result = await sendHttp(request.method, request.path, request.payload);
    showResponse(request, result);
    await refreshCollection();
  } catch (error) {
    $('statusBadge').className = 'response-status bad';
    $('statusBadge').textContent = 'NETWORK ERROR';
    $('responseBody').textContent = error.message;
    $('responseNote').textContent = 'Make sure the Express server is running on port 3000.';
  } finally {
    $('sendButton').disabled = false;
  }
}

async function copyText(value, element) {
  const original = element.textContent;
  try {
    await navigator.clipboard.writeText(value);
    element.textContent = 'Copied ✓';
    setTimeout(() => { element.textContent = original; }, 1400);
  } catch {
    element.textContent = 'Copy unavailable';
    setTimeout(() => { element.textContent = original; }, 1800);
  }
}

for (const button of document.querySelectorAll('[data-resource]')) button.addEventListener('click', () => setResource(button.dataset.resource));
for (const button of document.querySelectorAll('[data-operation]')) button.addEventListener('click', () => setOperation(button.dataset.operation));
$('recordId').addEventListener('input', updateBuilder);
$('requestForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const request = buildRequest();
  if (request.needsId && !request.id) { $('recordId').focus(); $('recordId').setCustomValidity('A resource ID is required.'); $('recordId').reportValidity(); $('recordId').setCustomValidity(''); return; }
  runRequest(request);
});
$('refreshCollection').addEventListener('click', refreshCollection);
$('resetDemo').addEventListener('click', async () => {
  resetMockDatabase();
  clearResponse();
  $('responseBody').textContent = 'Demo data reset. Send a request to begin.';
  $('responseNote').textContent = 'Original demo records restored. No request has been sent.';
  await refreshCollection();
});
$('pingRoot').addEventListener('click', () => runRequest({ method: 'GET', path: '/' }));
$('copyResponse').addEventListener('click', (event) => copyText(state.lastResponse, event.currentTarget));
$('copyCurl').addEventListener('click', (event) => {
  const { method, path, payload } = buildRequest();
  const command = `curl -i -X ${method} 'http://localhost:3000${path}'${payload === undefined ? '' : ` -H 'Content-Type: application/json' --data-raw '${escapeCurlSingleQuote(JSON.stringify(payload))}'`}`;
  copyText(command, event.currentTarget);
});

if (IS_LOCAL_API) {
  $('environmentLabel').textContent = 'LIVE EXPRESS API';
  $('modeTitle').textContent = 'Connected to your local Express server';
  $('modeDescription').textContent = 'Requests go to the real API at localhost:3000. Changes persist until you restart the Node.js process.';
} else {
  $('environmentLabel').textContent = 'INTERACTIVE PREVIEW';
  $('modeTitle').textContent = 'Browser simulation · no hosted backend';
  $('modeDescription').textContent = 'GitHub Pages cannot run Express. This preview simulates the same CRUD responses in memory. For real API requests, run npm start and open localhost:3000/demo/.';
  $('resetDemo').classList.remove('hidden');
}
updateBuilder();
refreshCollection();
