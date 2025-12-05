const apiBase = '/api/items';

async function api(path = '', opts = {}){
  const res = await fetch(apiBase + path, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

const form = document.getElementById('item-form');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const idInput = document.getElementById('item-id');
const itemsList = document.getElementById('items-list');
const resetBtn = document.getElementById('reset-btn');

async function loadItems(){
  try {
    const items = await api('', { method: 'GET' });
    renderList(items);
  } catch (e){
    console.error(e);
    alert('Ошибка загрузки. Откройте консоль.');
  }
}

function renderList(items){
  itemsList.innerHTML = '';
  if (!items.length) {
    itemsList.innerHTML = '<li class="item">Пусто</li>';
    return;
  }
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'item';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.content)}</p>`;

    const controls = document.createElement('div');
    controls.className = 'controls';

    const edit = document.createElement('button');
    edit.className = 'ctrl-btn';
    edit.textContent = 'Редактировать';
    edit.addEventListener('click', () => fillForm(item));

    const del = document.createElement('button');
    del.className = 'ctrl-btn';
    del.textContent = 'Удалить';
    del.addEventListener('click', () => removeItem(item.id));

    controls.append(edit, del);
    li.append(meta, controls);
    itemsList.append(li);
  });
}

function fillForm(item){
  idInput.value = item.id;
  titleInput.value = item.title;
  contentInput.value = item.content;
  window.scrollTo({top:0,behavior:'smooth'});
}

function resetForm(){
  idInput.value = '';
  titleInput.value = '';
  contentInput.value = '';
}

async function removeItem(id){
  if (!confirm('Удалить запись?')) return;
  try{
    await api('/' + id, { method: 'DELETE' });
    await loadItems();
  }catch(e){ console.error(e); alert('Ошибка удаления'); }
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const id = idInput.value;
  const payload = { title: titleInput.value.trim(), content: contentInput.value.trim() };
  try{
    if (id) {
      await api('/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    } else {
      await api('', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    }
    resetForm();
    await loadItems();
  }catch(e){ console.error(e); alert('Ошибка сохранения'); }
});

resetBtn.addEventListener('click', resetForm);

function escapeHtml(s){
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

loadItems();
