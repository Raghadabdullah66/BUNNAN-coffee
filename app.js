// عرض المنيو حسب القسم. البيانات من menu.js
const $ = s => document.querySelector(s);
let active = 'all';
let searchTerm = '';

const ENGLISH_NAMES = {
  'لاتيه ماتشا جوز الهند': 'Coconut Matcha Latte',
  'كلاود جوز هند ماتشا تي': 'Cloud Coconut Matcha Tea',
  'لاتيه ماتشا ساخن': 'Hot Matcha Latte',
  'لاتيه مثلج بالماتشا': 'Iced Matcha Latte',
  'لاتيه الماتشا بالقهوة': 'Coffee Matcha Latte',
  'كريم ماتشا': 'Matcha Cream',
  'سلاش ماتشا': 'Matcha Slush',
  'وعاء الآساي': 'Acai Bowl',
  'آساي سموذي': 'Acai Smoothie',
  'كرواسون سادة': 'Plain Croissant',
  'كرواسون باللوز': 'Almond Croissant',
  'كرواسون البقان': 'Pecan Croissant',
  'كرواسون بالجبنة': 'Cheese Croissant',
  'كرواسون بالزعتر': 'Zaatar Croissant',
  'كرواسون شوكولاتة': 'Chocolate Croissant',
  'إسبريسو سينجل': 'Single Espresso',
  'إسبريسو دوبل': 'Double Espresso',
  'هوت ماكياتو': 'Hot Macchiato',
  'هوت سبانش بيكولو': 'Spanish Piccolo',
  'بيكولو ساخن': 'Hot Piccolo',
  'هوت V60 جوز الهند': 'Hot Coconut V60',
  'لاتيه إسباني ساخن': 'Hot Spanish Latte',
  'كابتشينو': 'Cappuccino',
  'هوت V60 كولومبيا': 'Hot V60 Colombia',
  'هوت V60 إثيوبيا': 'Hot V60 Ethiopia',
  'أمريكانو ساخن': 'Hot Americano',
  'لاتيه ساخن': 'Hot Latte',
  'كورتادو': 'Cortado',
  'كورتادو إسباني ساخن': 'Hot Spanish Cortado',
  'فلات وايت': 'Flat White',
  'آيس في 60 جوز الهند': 'Iced Coconut V60',
  'آيس بلاك جولد': 'Iced Black Gold',
  'آيس في 60 تباكو': 'Iced V60 Tobacco',
  'بلاك باك': 'Black Pack',
  'في 60 كولومبيا مثلج': 'Iced V60 Colombia',
  'في 60 إثيوبيا مثلج': 'Iced V60 Ethiopia',
  'لاتيه إسباني مثلج': 'Iced Spanish Latte',
  'أمريكانو مثلج': 'Iced Americano',
  'لاتيه مثلج': 'Iced Latte',
  'كورتادو مثلج': 'Iced Cortado',
  'كريمة إسبريسو': 'Espresso Cream',
  'موهيتو فراولة': 'Strawberry Mojito',
  'موهيتو بلو لاغون': 'Blue Lagoon Mojito',
  'موهيتو باشن فروت': 'Passion Fruit Mojito',
  'موهيتو الكركديه': 'Hibiscus Mojito',
  'نوتيلا شو': 'Nutella Choux',
  'بهجة الفراولة والشوكولاتة': 'Strawberry Chocolate Delight',
  'بودنج بونان': 'Bunnan Pudding',
  'ميني تشيز كيك': 'Mini Cheesecake',
  'ميني تشيز كيك (قطعتين)': 'Mini Cheesecake (2 Pieces)',
  'ترافلز الشوكولاتة (قطعة)': 'Chocolate Truffle (1 Piece)',
  'ترافلز الشوكولاتة (قطعتين)': 'Chocolate Truffles (2 Pieces)',
  'بانانا بودينغ': 'Banana Pudding',
  'بودينغ الشوكولاتة': 'Chocolate Pudding',
  'كوكيز كيندر': 'Kinder Cookie',
  'زجاجة مياه العين': 'Al Ain Water',
  'مياه فوارة العين': 'Al Ain Sparkling Water',
  'حليب جوز الهند': 'Coconut Milk',
  'حليب الشوفان': 'Oat Milk'
};

const CATEGORY_LABELS = {
  'مشروبات الماتشا': 'ماتشا',
  'الآساي': 'أساي'
};

function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v != null && v !== false) e.setAttribute(k, v);
  }
  kids.flat().forEach(c => e.append(c));
  return e;
}

const fmt = p => Number(p).toFixed(2);

function card(i) {
  return el('article', { class: 'card' },
    el('div', { class: 'ph' }, i.img ? el('img', {
      src: i.img,
      alt: i.name,
      loading: 'lazy',
      class: i.position === 'right' ? 'shift-right' : i.rotate === 180 ? 'rotate-half' : i.fit === 'cover-soft' ? 'fill-soft' : i.fit === 'cover' ? 'fill' : undefined
    }) : ''),
    el('h3', {}, i.name),
    el('p', { class: 'card-en', lang: 'en', dir: 'ltr' }, i.en || ENGLISH_NAMES[i.name] || ''),
    el('p', { class: 'card-desc' }, i.desc),
    el('div', { class: 'price' }, fmt(i.price) + ' د.إ'));
}

function render() {
  const orderedCats = ['مشروبات الماتشا', 'قهوة ساخنة', 'قهوة باردة', 'الآساي', 'كرواسون', 'حلويات', ...MENU.cats];
  const cats = [...new Set(orderedCats)].filter(category => MENU.items.some(item => item.cat === category && !item.off));
  if (active !== 'all' && !cats.includes(active)) active = 'all';

  $('#chips').replaceChildren(...['all', ...cats].map(c =>
    el('button', { class: 'chip' + (c === active ? ' on' : ''), onclick: () => { active = c; render(); } },
      c === 'all' ? 'الكل' : CATEGORY_LABELS[c] || c)));

  const query = searchTerm.trim().toLocaleLowerCase();
  const items = MENU.items.filter(item => {
    if (item.off || (active !== 'all' && item.cat !== active)) return false;
    if (!query) return true;
    return [item.name, ENGLISH_NAMES[item.name], item.desc, item.cat, CATEGORY_LABELS[item.cat]]
      .filter(Boolean)
      .some(value => value.toLocaleLowerCase().includes(query));
  });
  const app = $('#app');
  app.replaceChildren();
  let n = 0;
  for (const c of cats) {
    if (active !== 'all' && c !== active) continue;
    const categoryItems = items.filter(item => item.cat === c);
    if (!categoryItems.length) continue;
    n += categoryItems.length;
    app.append(el('h2', {}, CATEGORY_LABELS[c] || c), el('div', { class: 'grid' }, categoryItems.map(card)));
  }
  if (!n) app.append(el('p', { class: 'empty' }, searchTerm ? 'ما لقينا أصناف تطابق بحثك.' : 'ما فيه أصناف في هذا القسم.'));
}

render();

async function loadSharedMenu() {
  const config = window.BUNNAN_SUPABASE_CONFIG;
  if (!config?.url || !config.anonKey || !window.supabase) return;

  try {
    const client = window.supabase.createClient(config.url, config.anonKey);
    const { data, error } = await client
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data?.length) return;

    MENU.items = data.map(row => ({
      id: row.id,
      name: row.name,
      en: row.english_name || '',
      desc: row.description || '',
      price: Number(row.price),
      cat: row.category,
      img: row.image_url || '',
      position: row.image_position || undefined,
      fit: row.image_fit || undefined,
      rotate: row.image_rotation ?? undefined
    }));
    render();
  } catch (error) {
    console.error('Could not load the shared Bunnan menu.', error);
  }
}

loadSharedMenu();

const searchInput = $('#menu-search');
const clearSearch = $('#clear-search');

$('#search-form').addEventListener('submit', event => event.preventDefault());
searchInput.addEventListener('input', () => {
  searchTerm = searchInput.value;
  clearSearch.classList.toggle('visible', Boolean(searchTerm));
  render();
});
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  searchTerm = '';
  clearSearch.classList.remove('visible');
  render();
  searchInput.focus();
});
$('#search-trigger').addEventListener('click', () => {
  const menuTools = $('#menu-tools');
  const isOpen = menuTools.classList.toggle('search-open');
  $('#search-trigger').setAttribute('aria-expanded', String(isOpen));
  menuTools.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (isOpen) searchInput.focus({ preventScroll: true });
});
$('#menu-trigger').addEventListener('click', () => {
  $('#menu-tools').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
