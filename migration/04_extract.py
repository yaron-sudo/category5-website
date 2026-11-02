# 04_extract.py — Elementor pages → structured product/category JSON.
# Output: migration/out/products.json, migration/out/categories.json
# Run: python3 -I migration/04_extract.py  (from repo root)
import json, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib_widgets import widgets

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
O = lambda *p: os.path.join(ROOT, 'migration', *p)
pages = {p['id']: p for p in json.load(open(O('out/raw/pages.json')))}
inv = json.load(open(O('out/inventory.json')))
slugs = json.load(open(O('slugs.json')))

def full(src):  # strip WP size suffix → original upload
    return re.sub(r'-\d+x\d+(?=\.\w+$)', '', src)

# Recurring icon images → badge keys (rendered by the site as badges).
ICON_BADGES = {
    'Parve.svg': 'parve', 'MaleEdomim.svg': 'kosher-badatz', 'Logo-Badatz.svg': 'kosher-badatz',
    'Kosher-Harav-Pines.webp': 'kosher', 'GMP-1.svg': 'gmp', 'GMP.webp': 'gmp',
    'Lipo.svg': 'liposomal', 'Micro.svg': 'microscope', 'Vitamin.png': 'vitamin',
    'HandMade.svg': 'handmade', 'Olive.svg': 'olive-oil',
}
DISCLAIMER_PREFIX = 'כל המידע'

def is_icon(src):
    name = full(src).split('/')[-1]
    return name.endswith('.svg') or name in ICON_BADGES

def sections_from(ws):
    """Generic: headings + texts + images → [{heading, text, images}]"""
    out, cur = [], None
    for w in ws:
        if w['type'] == 'heading':
            cur = {'heading': w['text'].replace('\n', ' '), 'level': w['tag'], 'text': [], 'images': []}
            out.append(cur)
        elif w['type'] == 'text-editor' and w['text']:
            if cur is None:
                cur = {'heading': None, 'level': None, 'text': [], 'images': []}; out.append(cur)
            cur['text'].append(w['text'])
        elif w['type'] == 'image' and w['imgs']:
            if cur is None:
                cur = {'heading': None, 'level': None, 'text': [], 'images': []}; out.append(cur)
            cur['images'] += [full(s) for s, a in w['imgs']]
    return out

def product(pid):
    ws = widgets(pages[pid]['content']['rendered'])
    P = {'wpId': pid, 'slug': slugs['products'][str(pid)], 'name': None, 'tagline': None, 'intro': [], 'benefits': [],
         'images': [], 'video': None, 'usage': [], 'labels': [], 'badges': [], 'stats': [], 'sections': [],
         'microscope': None, 'whereToBuy': False}
    phase = 'top'
    cur = None
    for i, w in enumerate(ws):
        t, txt = w['type'], w['text']
        if t == 'heading' and txt.startswith('מוצרים נוספים'):
            break
        if t == 'heading' and w['tag'] == 'h1' and not P['name']:
            P['name'] = txt.replace('\n', ' '); continue
        if phase == 'top':
            if t == 'heading' and not P['tagline']:
                P['tagline'] = txt.replace('\n', ' '); continue
            if t == 'text-editor':
                lines = txt.split('\n')
                if lines[0].startswith('יתרונות'):
                    P['benefits'] += [l.lstrip('• ').strip() for l in lines[1:] if l.strip('• ')]
                elif any(l.startswith('•') for l in lines):
                    P['intro'] += [l for l in lines if not l.startswith('•')]
                    P['benefits'] += [l.lstrip('• ').strip() for l in lines if l.startswith('•')]
                else:
                    P['intro'] += lines
                continue
            if t in ('nested-tabs', 'shortcode'):
                phase = 'media'; continue
        if phase in ('top', 'media'):
            if t == 'image' and not any(is_icon(s) for s, _ in w['imgs']):
                P['images'] += [full(s) for s, _ in w['imgs']]; phase = 'media'; continue
            if t == 'video':
                m = re.search(r'"youtube_url":"([^"]+)"', w['attrs'])
                if m: P['video'] = m.group(1).replace('\\/', '/')
                continue
            if t == 'shortcode':
                continue
        # body
        phase = 'body'
        if t == 'heading' and txt.startswith('היכן ניתן'):
            P['whereToBuy'] = True; cur = None; continue
        if t == 'html':
            continue
        if t == 'heading' and txt.startswith('הוראות שימוש'):
            cur = 'usage'; continue
        if t == 'text-editor' and txt.startswith(DISCLAIMER_PREFIX):
            cur = None; continue
        if t == 'text-editor' and cur == 'usage':
            P['usage'] += txt.split('\n'); continue
        if t == 'image':
            for s, a in w['imgs']:
                name = full(s).split('/')[-1]
                if name in ICON_BADGES:
                    if ICON_BADGES[name] not in P['badges']: P['badges'].append(ICON_BADGES[name])
                elif name.endswith('.svg') or name.startswith('Logo'):
                    pass  # brand/product logo marks
                elif re.match(r'(Label|Proof)', name, re.I):
                    P['labels'].append(full(s))
                elif re.match(r'Micro', name):
                    P['microscope'] = {'image': full(s), 'caption': None}
                elif isinstance(cur, dict):
                    cur['images'].append(full(s))
                else:
                    P['sections'].append({'heading': None, 'text': [], 'images': [full(s)]}); cur = P['sections'][-1]
            continue
        if t == 'heading':
            lines = txt.split('\n')
            joined = ' '.join(lines)
            if re.fullmatch(r'GMO ?/? ?FREE|GMO FREE', joined.replace('\n', ' ')):
                if 'gmo-free' not in P['badges']: P['badges'].append('gmo-free')
                continue
            if joined in ('Vegan', 'טבעוני'):
                if 'vegan' not in P['badges']: P['badges'].append('vegan')
                continue
            if re.match(r'^\d+ ', joined) and len(joined) < 20:
                P['stats'].append({'value': lines[0], 'label': ' '.join(lines[1:]) if len(lines) > 1 else joined.split(' ', 1)[1]}); continue
            if len(joined) < 16 and cur != 'usage' and not isinstance(cur, dict) or joined in ('סבון', 'עבודת יד', 'בלעדי', 'כשר חלבי'):
                P['stats'].append({'value': joined, 'label': ''}); continue
            if joined.startswith('בתמונה'):
                if P['microscope']: P['microscope']['caption'] = joined
                continue
            cur = {'heading': joined, 'text': [], 'images': []}; P['sections'].append(cur); continue
        if t == 'text-editor':
            if txt.startswith('בתמונה'):
                if P['microscope']: P['microscope']['caption'] = txt
                continue
            if not isinstance(cur, dict):
                cur = {'heading': None, 'text': [], 'images': []}; P['sections'].append(cur)
            cur['text'] += txt.split('\n')
    P['sections'] = [s for s in P['sections'] if s['text'] or s['images']]
    # --- post-process ---
    intro = []
    for l in P['intro']:
        if re.match(r'^יתרונות (המוצר|ה)', l): continue
        if l.startswith('המלצות שימוש') or l.startswith('המלצת שימוש'): P['usage'].insert(0, l); continue
        intro.append(l)
    P['intro'] = intro
    if not P['images']:  # no media tabs: first non-label body image is the packshot
        for sec in P['sections']:
            for im in list(sec['images']):
                if 'label' in im.lower(): continue
                P['images'].append(im); sec['images'].remove(im); break
            if P['images']: break
    for sec in P['sections']:
        for im in list(sec['images']):
            if 'label' in im.lower(): P['labels'].append(im); sec['images'].remove(im)
        sec['text'] = join_wrapped(sec['text'])
    P['intro'] = join_wrapped(P['intro'])
    P['sections'] = [s for s in P['sections'] if s['text'] or s['images']]
    P['usage'] = list(dict.fromkeys(P['usage']))
    return P

def join_wrapped(lines):
    # Elementor text often hard-wraps sentences with <br>; re-join a line onto
    # the previous one when the previous does not end a sentence.
    out = []
    for l in lines:
        if out and not re.search(r'[.:!?;)״"]$', out[-1]) and not l.startswith('•') and not out[-1].startswith('•') and len(out[-1]) > 60:
            out[-1] += ' ' + l
        else:
            out.append(l)
    return out

def category(cid):
    ws = widgets(pages[cid]['content']['rendered'])
    secs = sections_from(ws)
    return {'wpId': cid, **slugs['categories'][str(cid)], 'title': pages[cid]['title']['rendered'], 'sections': secs}

prods, cats = [], []
for r in inv:
    if r['kind'] == 'product':
        p = product(r['id']); p['categoryWpId'] = pages[r['id']]['parent']; prods.append(p)
    elif r['kind'] == 'category':
        cats.append(category(r['id']))
json.dump(prods, open(O('out/products.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(cats, open(O('out/categories.json'), 'w'), ensure_ascii=False, indent=1)
print(len(prods), 'products,', len(cats), 'categories')
for p in prods:
    print(f"{p['slug']:32} imgs={len(p['images'])} ben={len(p['benefits'])} use={len(p['usage'])} secs={len(p['sections'])} lab={len(p['labels'])} vid={'Y' if p['video'] else '-'} badges={','.join(p['badges'])} stats={[s['value'] for s in p['stats']]}")
