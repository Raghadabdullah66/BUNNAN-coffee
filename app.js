// عرض المنيو حسب القسم. البيانات من menu.js
const $ = s => document.querySelector(s);
let active = 'all';
let searchTerm = '';

const ENGLISH_NAMES = {
  'لاتيه ماتشا جوز الهند': 'Coconut Matcha Latte',
  'كلاود كوكنت ماتشا': 'Cloud Coconut Matcha',
  'لاتيه ماتشا ساخن': 'Hot Matcha Latte',
  'ماتشا لاتيه': 'Matcha Latte',
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
  'هوت V60 جوز الهند': 'V60 Coconut',
  'لاتيه إسباني ساخن': 'Hot Spanish Latte',
  'كابتشينو': 'Cappuccino',
  'هوت V60 كولومبيا': 'V60 Colombia',
  'هوت V60 إثيوبيا': 'V60 Ethiopia',
  'أمريكانو ساخن': 'Hot Americano',
  'لاتيه ساخن': 'Hot Latte',
  'كورتادو': 'Cortado',
  'كورتادو بارد': 'Iced Spanish Cortado',
  'كورتادو إسباني ساخن': 'Hot Spanish Cortado',
  'فلات وايت': 'Flat White',
  'آيس في 60 جوز الهند': 'Iced Coconut V60',
  'آيس بلاك جولد': 'V60 BLACK GOLD',
  'آيس في 60 تباكو': 'V60 TOBACCO',
  'بلاك باك': 'V60 BLACK PACK',
  'في 60 كولومبيا': 'V60 Colombia',
  'في 60 إثيوبيا': 'V60 Ethiopia',
  'لاتيه إسباني': 'Spanish Latte',
  'أمريكانو': 'Iced Americano',
  'لاتيه': 'Latte',
  'كورتادو': 'Cortado',
  'كريمة إسبريسو': 'Espresso Cream',
  'موهيتو فراولة': 'Strawberry Mojito',
  'موهيتو بلوجون': 'Blue Lagoon Mojito',
  'موهيتو باشن فروت': 'Passion Fruit Mojito',
  'نوتيلا شو': 'Nutella Choux',
  'فراوله بالشوكلت': 'Strawberries with Chocolate',
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
  'الآساي': 'أساي',
  'قهوة ساخنة': 'مشروبات حارة',
  'مشروبات باردة': 'مشروبات باردة'
};
const ENGLISH_CATEGORIES = {
  'مشروبات الماتشا': 'Matcha Drinks',
  'الآساي': 'Acai',
  'كرواسون': 'Croissants',
  'قهوة ساخنة': 'Hot Drinks',
  'مشروبات ساخنة': 'Hot Drinks',
  'مشروبات باردة': 'Cold Drinks',
  'مشروبات الموهيتو': 'Mojitos',
  'حلويات': 'Desserts',
  'مياه': 'Water',
  'الحليب': 'Milk'
};
let DATABASE_CATEGORY_ENGLISH = {};
const categoryLabel = category => language === 'ar'
  ? CATEGORY_LABELS[category] || category
  : DATABASE_CATEGORY_ENGLISH[category] || ENGLISH_CATEGORIES[category] || category;
const ENGLISH_DESCRIPTIONS = {
  'لاتيه ماتشا جوز الهند': 'Smooth, creamy matcha latte blended with rich coconut milk and topped with velvety foam.',
  'كلاود كوكنت ماتشا': 'Silky coconut matcha topped with a light cloud of whipped foam.',
  'لاتيه ماتشا ساخن': 'A warm, creamy latte made with premium matcha, steamed milk and a touch of sweetness.',
  'ماتشا لاتيه': 'Refreshing premium matcha blended with creamy milk and ice.',
  'لاتيه الماتشا بالقهوة': 'A smooth, creamy blend of premium matcha, rich coffee and steamed milk.',
  'كريم ماتشا': 'Silky Japanese matcha blended with velvety steamed milk.',
  'سلاش ماتشا': 'A refreshing icy matcha slush with a smooth, earthy flavor.',
  'وعاء الآساي': 'An acai bowl topped with fresh granola, crunchy coconut flakes and mixed berries.',
  'آساي سموذي': 'A refreshing, nourishing acai smoothie with a rich berry flavor.',
  'كركديه': 'Refreshing hibiscus topped with whipped milk.',
  'كرواسون سادة': 'A buttery, flaky croissant baked until golden.',
  'كرواسون باللوز': 'A buttery croissant filled with smooth almond paste and topped with almond flakes.',
  'كرواسون البقان': 'A crisp, buttery croissant filled with roasted pecans and a touch of caramel.',
  'كرواسون بالجبنة': 'A flaky croissant generously filled with melted cheese.',
  'كرواسون بالزعتر': 'A buttery croissant topped with aromatic zaatar, sumac and sesame.',
  'كرواسون شوكولاتة': 'A buttery croissant filled with rich, melted chocolate.',
  'إسبريسو سينجل': 'A concentrated single shot of bold, dark-roasted coffee.',
  'إسبريسو دوبل': 'Two concentrated shots of rich, aromatic espresso.',
  'هوت ماكياتو': 'A bold espresso shot topped with a spoonful of milk foam.',
  'هوت سبانش بيكولو': 'A small, rich coffee drink with concentrated espresso and creamy milk.',
  'بيكولو ساخن': 'A balanced small coffee made with espresso, steamed milk and soft foam.',
  'هوت V60 جوز الهند': 'Aromatic pour-over coffee blended with coconut milk and tropical notes.',
  'لاتيه إسباني ساخن': 'Espresso with sweet condensed milk and steamed milk.',
  'كابتشينو': 'Rich espresso, steamed milk and velvety foam in a classic cappuccino.',
  'شوكولاتة ساخنة': 'Rich hot chocolate topped with cream.',
  'هوت V60 كولومبيا': 'Single-origin Colombian pour-over coffee with fruity notes and balanced acidity.',
  'هوت V60 إثيوبيا': 'Single-origin Ethiopian pour-over coffee with floral notes and citrus acidity.',
  'أمريكانو ساخن': 'Bold espresso softened with hot water.',
  'لاتيه ساخن': 'Classic espresso with steamed milk and a thin layer of foam.',
  'كورتادو': 'Equal parts espresso and steamed milk for a smooth, balanced coffee.',
  'كورتادو إسباني ساخن': 'Espresso with sweet condensed milk and steamed milk.',
  'فلات وايت': 'Rich espresso with smooth, velvety microfoam.',
  'آيس في 60 جوز الهند': 'Refreshing iced V60 coffee with smooth coconut flavor.',
  'آيس بلاك جولد': 'Smooth, bold iced coffee with rich dark-roast notes.',
  'آيس في 60 تباكو': 'Refreshing iced V60 pour-over with subtle smoky notes.',
  'بلاك باك': 'Bold iced coffee with a rich flavor.',
  'في 60 كولومبيا': 'Single-origin Colombian pour-over with fruity notes and balanced acidity.',
  'في 60 إثيوبيا': 'Single-origin Ethiopian pour-over with floral notes and citrus acidity.',
  'لاتيه إسباني': 'Espresso, sweet condensed milk and cold milk served over ice.',
  'أمريكانو': 'Bold espresso with cold water and ice.',
  'لاتيه': 'Smooth espresso and creamy cold milk served over ice.',
  'كورتادو بارد': 'Equal parts espresso and cold milk served over ice.',
  'كريمة إسبريسو': 'Iced espresso topped with smooth whipped cream.',
  'موهيتو فراولة': 'A refreshing mojito with fresh strawberry and mint.',
  'موهيتو بلوجون': 'A refreshing mojito with a vibrant blue color and tropical flavor.',
  'موهيتو باشن فروت': 'A tropical mojito with refreshing passion fruit.',
  'نوتيلا شو': 'A crisp choux pastry filled with rich, smooth Nutella cream.',
  'فراوله بالشوكلت': 'A special dessert combining fresh strawberries and rich chocolate.',
  'بودنج بونان': 'Smooth, creamy banana pudding served chilled.',
  'ميني تشيز كيك': 'A mini creamy cheesecake on a crisp base.',
  'ميني تشيز كيك (قطعتين)': 'Two mini creamy cheesecakes on crisp bases.',
  'ترافلز الشوكولاتة (قطعة)': 'One rich chocolate truffle that melts in your mouth.',
  'ترافلز الشوكولاتة (قطعتين)': 'Two rich chocolate truffles that melt in your mouth.',
  'بانانا بودينغ': 'Smooth, creamy banana pudding layered into a refreshing chilled dessert.',
  'بودينغ الشوكولاتة': 'Rich, creamy chocolate pudding with a smooth texture.',
  'كوكيز كيندر': 'A soft, crisp cookie with rich Kinder chocolate flavor.',
  'زجاجة مياه العين': 'Refreshing natural drinking water.',
  'مياه فوارة العين': 'Refreshing sparkling water.',
  'حليب جوز الهند': 'Creamy plant-based coconut milk, a flavorful alternative to regular milk.',
  'حليب الشوفان': 'Smooth plant-based oat milk, a flavorful alternative to regular milk.'
};
let language = 'ar';
try {
  const savedLanguage = localStorage.getItem('bunnan-language');
  if (savedLanguage === 'ar' || savedLanguage === 'en') language = savedLanguage;
} catch (error) {
  console.warn('Could not read the saved menu language.', error);
}

function applyLanguage() {
  const isArabic = language === 'ar';
  document.documentElement.lang = language;
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  document.title = isArabic ? 'Bunnan Coffee | بنان كافيه' : 'Bunnan Coffee | Bunnan Cafe';
  document.querySelectorAll('[data-ar][data-en]').forEach(element => {
    element.textContent = element.dataset[language];
  });
  document.querySelectorAll('[data-ar-label][data-en-label]').forEach(element => {
    element.setAttribute('aria-label', element.dataset[`${language}Label`]);
  });
  document.querySelectorAll('[data-ar-title][data-en-title]').forEach(element => {
    element.title = element.dataset[`${language}Title`];
  });
  const searchInput = $('#menu-search');
  searchInput.placeholder = searchInput.dataset[`${language}Placeholder`];
  const toggle = $('#language-toggle');
  toggle.textContent = isArabic ? 'English' : 'العربية';
  toggle.lang = isArabic ? 'en' : 'ar';
  toggle.dir = isArabic ? 'ltr' : 'rtl';
  toggle.setAttribute('aria-label', isArabic ? 'Switch to English' : 'التبديل إلى العربية');
  toggle.title = isArabic ? 'Switch to English' : 'التبديل إلى العربية';
  $('.hero-cta').lang = language;
  $('.hero-cta').dir = language === 'ar' ? 'rtl' : 'ltr';
  $('#menu-trigger').setAttribute('aria-label', isArabic ? 'انتقل إلى المنيو' : 'Go to menu');
  $('#menu-trigger').title = isArabic ? 'انتقل إلى المنيو' : 'Go to menu';
  $('#search-trigger').setAttribute('aria-label', isArabic ? 'ابحث في المنيو' : 'Search the menu');
  $('#search-trigger').title = isArabic ? 'ابحث في المنيو' : 'Search the menu';
}

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
  const name = language === 'ar' ? i.name : i.en || ENGLISH_NAMES[i.name] || i.name;
  const description = language === 'ar' ? i.desc : ENGLISH_DESCRIPTIONS[i.name] || '';
  return el('article', { class: 'card' },
    el('div', { class: 'ph' }, i.img ? el('img', {
      src: i.img,
      alt: name,
      loading: 'lazy',
      class: i.position === 'right' ? 'shift-right' : i.rotate === 180 ? 'rotate-half' : i.fit === 'contain' ? 'fit-contain' : i.fit === 'cover-soft' ? 'fill-soft' : i.fit === 'cover' ? 'fill' : undefined
    }) : ''),
    el('h3', { lang: language }, name),
    el('p', { class: 'card-desc', lang: language }, description),
    el('div', { class: 'price', dir: language === 'ar' ? 'rtl' : 'ltr' }, fmt(i.price) + (language === 'ar' ? ' د.إ' : ' AED')));
}

function render() {
  const orderedCats = ['مشروبات الماتشا', 'قهوة ساخنة', 'مشروبات باردة', 'الآساي', 'كرواسون', 'حلويات', ...MENU.cats, ...Object.keys(DATABASE_CATEGORY_ENGLISH)];
  const cats = [...new Set(orderedCats)].filter(category => MENU.items.some(item => item.cat === category && !item.off));
  if (active !== 'all' && !cats.includes(active)) active = 'all';

  $('#chips').replaceChildren(...['all', ...cats].map(c =>
    el('button', { class: 'chip' + (c === active ? ' on' : ''), onclick: () => { active = c; render(); } },
      c === 'all' ? (language === 'ar' ? 'الكل' : 'All') : categoryLabel(c))));

  const query = searchTerm.trim().toLocaleLowerCase();
  const items = MENU.items.filter(item => {
    if (item.off || (active !== 'all' && item.cat !== active)) return false;
    if (!query) return true;
    return [item.name, item.en, ENGLISH_NAMES[item.name], item.desc, ENGLISH_DESCRIPTIONS[item.name], item.cat, categoryLabel(item.cat)]
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
    app.append(el('h2', {}, categoryLabel(c)), el('div', { class: 'grid' }, categoryItems.map(card)));
  }
  if (!n) app.append(el('p', { class: 'empty' }, language === 'ar'
    ? searchTerm ? 'ما لقينا أصناف تطابق بحثك.' : 'ما فيه أصناف في هذا القسم.'
    : searchTerm ? 'No items matched your search.' : 'There are no items in this category.'));
}

function moveMenuItemAfter(itemName, referenceName) {
  const itemIndex = MENU.items.findIndex(item => item.name === itemName);
  const referenceIndex = MENU.items.findIndex(item => item.name === referenceName);
  if (itemIndex < 0 || referenceIndex < 0 || itemIndex === referenceIndex + 1) return;

  const [item] = MENU.items.splice(itemIndex, 1);
  const updatedReferenceIndex = MENU.items.findIndex(entry => entry.name === referenceName);
  MENU.items.splice(updatedReferenceIndex + 1, 0, item);
}

moveMenuItemAfter('آيس في 60 جوز الهند', 'أمريكانو');
applyLanguage();
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

    const { data: categoryData, error: categoryError } = await client
      .from('menu_categories')
      .select('name, english_name, sort_order')
      .order('sort_order', { ascending: true });
    if (categoryError) {
      console.error('Could not load translated menu category names.', categoryError);
    } else {
      DATABASE_CATEGORY_ENGLISH = Object.fromEntries(categoryData.map(category => [category.name, category.english_name]));
    }

    MENU.items = data.map(row => ({
      id: row.id,
      name: row.name === 'كورتادو مثلج' ? 'كورتادو بارد' : row.name.replace(/\s*مثلج/g, '').trim(),
      en: row.name === 'كورتادو مثلج'
        ? 'Iced Spanish Cortado'
        : row.english_name
          ? row.name.includes('مثلج') ? row.english_name.replace(/^Iced\s+/i, '') : row.english_name
        : '',
      desc: (row.description || '').replace(/مثلجة/g, 'باردة').replace(/مثلج/g, 'بارد'),
      price: Number(row.price),
      cat: row.category === 'قهوة باردة' ? 'مشروبات باردة' : row.category,
      img: row.image_url || '',
      position: row.image_position || undefined,
      fit: ['هوت V60 جوز الهند', 'هوت V60 كولومبيا', 'هوت V60 إثيوبيا', 'في 60 إثيوبيا', 'في 60 كولومبيا', 'آيس بلاك جولد', 'آيس في 60 تباكو', 'بلاك باك'].includes(row.name)
        ? 'contain'
        : row.image_fit || undefined,
      rotate: row.image_rotation ?? undefined
    }));
    moveMenuItemAfter('آيس في 60 جوز الهند', 'أمريكانو');
    render();
  } catch (error) {
    console.error('Could not load the shared Bunnan menu.', error);
  }
}

loadSharedMenu();

const searchInput = $('#menu-search');
const clearSearch = $('#clear-search');

$('#search-form').addEventListener('submit', event => event.preventDefault());
$('#language-toggle').addEventListener('click', () => {
  language = language === 'ar' ? 'en' : 'ar';
  try {
    localStorage.setItem('bunnan-language', language);
  } catch (error) {
    console.warn('Could not save the menu language preference.', error);
  }
  applyLanguage();
  render();
});
searchInput.addEventListener('input', () => {
  searchTerm = searchInput.value;
  if (searchTerm.trim()) active = 'all';
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
