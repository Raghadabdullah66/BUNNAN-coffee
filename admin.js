const $ = selector => document.querySelector(selector);
const config = window.BUNNAN_SUPABASE_CONFIG || {};
const hasConfig = Boolean(config.url && config.anonKey && window.supabase);
const OWNER_AUTH_EMAIL = 'bunnan-admin@bunnan.invalid';
let items = [];
let editingId = null;
let selectedImage = null;
let previewUrl = '';
let client = null;

function setStatus(message, isError = false) {
  const status = $('#admin-status');
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function setSignedIn(session) {
  $('#login-panel').hidden = Boolean(session);
  $('#manager').hidden = !session;
  $('#sign-out').hidden = !session;
  if (session) loadItems();
}

function normalizeRow(row) {
  return {
    id: row.id,
    name: row.name,
    en: row.english_name || '',
    desc: row.description || '',
    price: Number(row.price),
    cat: row.category,
    img: row.image_url || '',
    off: !row.available,
    sort_order: row.sort_order
  };
}

function makeButton(label, className, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `button ${className}`;
  button.textContent = label;
  button.addEventListener('click', action);
  return button;
}

function renderCategories() {
  const categoryFilter = $('#category-filter');
  const categorySelect = $('#item-category');
  const previous = categoryFilter.value;
  categoryFilter.replaceChildren(new Option('كل الأقسام', 'all'));
  categorySelect.replaceChildren();
  MENU.cats.forEach(category => {
    categoryFilter.add(new Option(category, category));
    categorySelect.add(new Option(category, category));
  });
  categoryFilter.value = MENU.cats.includes(previous) ? previous : 'all';
}

function renderItems() {
  const list = $('#item-list');
  const query = $('#item-search').value.trim().toLocaleLowerCase();
  const category = $('#category-filter').value;
  const visibleItems = items.filter(item => {
    if (category !== 'all' && item.cat !== category) return false;
    return !query || [item.name, item.en, item.desc, item.cat]
      .filter(Boolean)
      .some(value => value.toLocaleLowerCase().includes(query));
  });

  $('#item-count').textContent = String(items.length);
  list.replaceChildren();
  if (!visibleItems.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = items.length ? 'لا توجد أصناف مطابقة.' : 'المنيو فارغ.';
    list.append(empty);
    return;
  }

  visibleItems.forEach(item => {
    const row = document.createElement('article');
    row.className = 'item-row';
    const image = document.createElement('img');
    image.className = 'item-thumb';
    image.src = item.img || '';
    image.alt = '';
    image.loading = 'lazy';

    const details = document.createElement('div');
    details.className = 'item-details';
    const name = document.createElement('strong');
    name.textContent = item.name;
    const meta = document.createElement('span');
    meta.textContent = `${item.cat} · ${item.price.toFixed(2)} د.إ${item.off ? ' · مخفي' : ''}`;
    details.append(name, meta);

    const actions = document.createElement('div');
    actions.className = 'row-actions';
    actions.append(
      makeButton('تعديل', 'button-secondary', () => fillForm(item)),
      makeButton('حذف', 'button-danger', () => deleteItem(item))
    );
    row.append(image, details, actions);
    list.append(row);
  });
}

function fillForm(item = null) {
  editingId = item?.id || null;
  $('#menu-form').reset();
  $('#form-title').textContent = item ? 'تعديل الصنف' : 'إضافة صنف';
  $('#item-name').value = item?.name || '';
  $('#item-en').value = item?.en || '';
  $('#item-category').value = item?.cat || MENU.cats[0] || '';
  $('#item-price').value = item?.price ?? '';
  $('#item-description').value = item?.desc || '';
  $('#item-image').value = item?.img || '';
  $('#item-available').checked = !item?.off;
  $('#delete-current').hidden = !item;
  selectedImage = null;
  $('#item-image-file').value = '';
  showPreview(item?.img || '');
}

function showPreview(source) {
  const preview = $('#image-preview');
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = source.startsWith('blob:') ? source : '';
  preview.src = source;
  preview.hidden = !source;
  $('#image-empty').hidden = Boolean(source);
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(sourceUrl);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('تعذر تجهيز الصورة')), 'image/jpeg', 0.84);
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error('تعذر قراءة الصورة'));
    };
    image.src = sourceUrl;
  });
}

async function uploadImage(file) {
  const image = await compressImage(file);
  const path = `${Date.now()}-${crypto.randomUUID()}.jpg`;
  const { error } = await client.storage.from('menu-images').upload(path, image, {
    contentType: 'image/jpeg',
    upsert: true
  });
  if (error) throw error;
  return client.storage.from('menu-images').getPublicUrl(path).data.publicUrl;
}

async function loadItems() {
  setStatus('جاري تحميل المنيو…');
  const { data, error } = await client.from('menu_items').select('*').order('sort_order');
  if (error) {
    setStatus('تعذر تحميل المنيو. تأكدي من تطبيق supabase-schema.sql.', true);
    console.error(error);
    return;
  }
  items = data.map(normalizeRow);
  renderItems();
  $('#seed-menu').hidden = items.length > 0;
  setStatus(items.length ? '' : 'قاعدة البيانات فارغة. استوردي القائمة الحالية لبدء الإدارة.');
}

async function deleteItem(item) {
  if (!window.confirm(`حذف «${item.name}» من المنيو؟`)) return;
  setStatus('جاري حذف الصنف…');
  const { error } = await client.from('menu_items').delete().eq('id', item.id);
  if (error) {
    setStatus('تعذر حذف الصنف.', true);
    return;
  }
  if (editingId === item.id) fillForm();
  await loadItems();
  setStatus('تم حذف الصنف.');
}

async function saveItem(event) {
  event.preventDefault();
  const name = $('#item-name').value.trim();
  const price = Number($('#item-price').value);
  if (!name || !Number.isFinite(price) || price < 0) {
    setStatus('أدخلي اسمًا وسعرًا صحيحًا.', true);
    return;
  }

  const previous = items.find(item => item.id === editingId);
  let imageUrl = $('#item-image').value.trim() || previous?.img || '';
  setStatus('جاري حفظ الصنف…');
  try {
    if (selectedImage) imageUrl = await uploadImage(selectedImage);
    if (!imageUrl) {
      setStatus('اختاري صورة للصنف.', true);
      return;
    }

    const row = {
      name,
      english_name: $('#item-en').value.trim() || null,
      description: $('#item-description').value.trim(),
      price,
      category: $('#item-category').value,
      image_url: imageUrl,
      available: $('#item-available').checked,
      sort_order: previous?.sort_order ?? items.length
    };
    const result = previous
      ? await client.from('menu_items').update(row).eq('id', previous.id)
      : await client.from('menu_items').insert(row);
    if (result.error) throw result.error;

    fillForm();
    await loadItems();
    setStatus(previous ? 'تم تحديث الصنف في الموقع.' : 'تمت إضافة الصنف إلى الموقع.');
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'تعذر حفظ الصنف.', true);
  }
}

async function importCurrentMenu() {
  if (!window.confirm('استيراد جميع أصناف menu.js إلى قاعدة البيانات؟')) return;
  setStatus('جاري استيراد القائمة…');
  const rows = MENU.items.map((item, index) => ({
    name: item.name,
    english_name: item.en || null,
    description: item.desc || '',
    price: Number(item.price),
    category: item.cat,
    image_url: item.img || '',
    available: !item.off,
    sort_order: index
  }));
  const { error } = await client.from('menu_items').insert(rows);
  if (error) {
    setStatus(error.message || 'تعذر استيراد القائمة.', true);
    return;
  }
  await loadItems();
  setStatus('تم استيراد القائمة الحالية.');
}

if (!hasConfig) {
  $('#setup-notice').hidden = false;
} else {
  client = window.supabase.createClient(config.url, config.anonKey);
  $('#setup-notice').hidden = true;
  renderCategories();
  $('#login-panel').hidden = false;

  $('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
    setStatus('جاري تسجيل الدخول…');
    const { data, error } = await client.auth.signInWithPassword({
      email: OWNER_AUTH_EMAIL,
      password: $('#login-password').value
    });
    if (error) {
      setStatus('تعذر تسجيل الدخول. تحققي من بيانات الحساب.', true);
      return;
    }
    setSignedIn(data.session);
    setStatus(`مرحبًا ${data.user.email}`);
  });

  $('#sign-out').addEventListener('click', async () => {
    await client.auth.signOut();
    $('#manager').hidden = true;
    $('#login-panel').hidden = false;
    setStatus('تم تسجيل الخروج.');
  });

  $('#menu-form').addEventListener('submit', event => saveItem(event));
  $('#new-item').addEventListener('click', () => fillForm());
  $('#cancel-edit').addEventListener('click', () => fillForm());
  $('#delete-current').addEventListener('click', () => {
    const item = items.find(entry => entry.id === editingId);
    if (item) deleteItem(item);
  });
  $('#seed-menu').addEventListener('click', importCurrentMenu);
  $('#item-search').addEventListener('input', renderItems);
  $('#category-filter').addEventListener('change', renderItems);
  $('#item-image').addEventListener('input', () => showPreview($('#item-image').value.trim()));
  $('#item-image-file').addEventListener('change', event => {
    selectedImage = event.target.files[0] || null;
    if (selectedImage) showPreview(URL.createObjectURL(selectedImage));
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error) {
      setStatus('تعذر استعادة الجلسة. سجّلي الدخول من جديد.', true);
      setSignedIn(null);
      return;
    }
    setSignedIn(data.session);
  });
}