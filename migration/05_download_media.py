# 05_download_media.py — download every image referenced by products/categories
# (+ brand assets) into astro/public/media/, resized (max 1600px) and converted
# to webp (SVG kept). Rewrites migration/out/{products,categories}.json refs to
# local paths in *.local.json. Cached: existing files are skipped.
import json, os, re, io, urllib.request, urllib.parse, hashlib
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'astro', 'public', 'media')
UP = 'https://www.ethical-supplements.com/wp-content/uploads/'
BRAND = [UP + p for p in [
    '2022/10/ES-LOGO-BLACK-SVG.svg', '2022/10/Logo2-EN@300x.png', '2023/12/Logo.webp', '2022/11/OpenGraph.jpg',
    '2022/10/Homepage1.png', '2022/11/Olive.svg', '2022/11/Asset-14@4x.png', '2022/11/Micro.svg', '2022/11/Lipo.svg',
    '2022/11/Logo-Amorfolic_1.svg', '2022/11/GMP.svg', '2022/11/Immune.svg', '2022/11/Liposomal.svg', '2022/11/Cogni.svg',
    '2022/11/Inflammation.svg', '2022/11/Herbs.svg', '2022/11/Parve.svg', '2022/11/MaleEdomim.svg', '2022/11/GMP-1.svg',
    '2022/11/HandMade.svg', '2022/11/Vitamin.png',
]]
media = {m['source_url'].split('/uploads/')[1]: m for m in json.load(open(os.path.join(ROOT, 'migration/out/raw/media.json')))}

def local_name(url):
    rel = urllib.parse.unquote(url.split('/uploads/')[1])
    base, ext = os.path.splitext(rel)
    base = re.sub(r'-scaled$', '', base)
    if ext.lower() == '.svg': return rel
    return base + '.webp'

def find_url(url):
    """Resolve to an existing upload: exact, else via media library by filename stem."""
    rel = url.split('/uploads/')[1]
    if rel in media: return url
    stem = os.path.splitext(os.path.basename(rel))[0]
    for k in media:
        if os.path.splitext(os.path.basename(k))[0] == stem and media[k]['mime_type'].startswith('image/'): return UP + k
    return url

done, failed = {}, []
def get(url):
    if url in done: return done[url]
    src = find_url(url)
    name = local_name(src)
    dst = os.path.join(OUT, name)
    if not os.path.exists(dst):
        try:
            data = urllib.request.urlopen(urllib.request.Request(urllib.parse.quote(src, safe=':/%@'), headers={'User-Agent': 'migration'})).read()
        except Exception as e:
            failed.append((url, str(e))); done[url] = None; return None
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if name.endswith('.svg'):
            open(dst, 'wb').write(data)
        else:
            try:
                im = Image.open(io.BytesIO(data))
            except Exception as e:
                failed.append((src, 'not an image: ' + data[:40].decode('latin1'))); done[url] = None; return None
            im = im.convert('RGBA') if im.mode in ('P', 'LA', 'RGBA') else im.convert('RGB')
            if max(im.size) > 1600: im.thumbnail((1600, 1600))
            im.save(dst, 'WEBP', quality=82, method=6)
    done[url] = '/media/' + name
    return done[url]

def walk(x):
    if isinstance(x, dict): return {k: walk(v) for k, v in x.items()}
    if isinstance(x, list): return [walk(v) for v in x]
    if isinstance(x, str) and x.startswith(UP) and re.search(r'\.(png|jpe?g|webp|svg|gif)$', x, re.I): return get(x)
    return x

for f in ('products', 'categories'):
    data = walk(json.load(open(os.path.join(ROOT, f'migration/out/{f}.json'))))
    json.dump(data, open(os.path.join(ROOT, f'migration/out/{f}.local.json'), 'w'), ensure_ascii=False, indent=1)
brand = {u.split('/')[-1]: get(u) for u in BRAND}
json.dump(brand, open(os.path.join(ROOT, 'migration/out/brand.local.json'), 'w'), ensure_ascii=False, indent=1)
print('files', len([v for v in done.values() if v]), 'failed', failed)
