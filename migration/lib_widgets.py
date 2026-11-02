# Shared helper: flatten an Elementor page's rendered HTML into an ordered
# list of widgets (type, text, images, links, hidden-on-device flags).
import re, html as H
WID = re.compile(r'<div class="elementor-element elementor-element-(\w+)([^"]*)"[^>]*data-widget_type="([^"]+)"[^>]*>')
def clean(s):
    s = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', s, flags=re.S)
    s = re.sub(r'<br\s*/?>', '\n', s)
    s = re.sub(r'</(p|h\d|li|div)>', '\n', s)
    s = re.sub(r'<li[^>]*>', '• ', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = H.unescape(s).replace('\xa0', ' ')
    lines = [' '.join(l.split()) for l in s.split('\n')]
    return '\n'.join(l for l in lines if l)
def widgets(src):
    ms = list(WID.finditer(src))
    out = []
    for i, m in enumerate(ms):
        end = ms[i + 1].start() if i + 1 < len(ms) else len(src)
        chunk = src[m.end():end]
        cls = m.group(2)
        hidden = re.findall(r'elementor-hidden-(\w+)', cls)
        out.append({
            'id': m.group(1), 'type': m.group(3).split('.')[0], 'hidden': hidden,
            'text': clean(chunk),
            'imgs': [(a, b) for a, b in re.findall(r'<img[^>]*?src="([^"]+)"[^>]*?(?:alt="([^"]*)")?', chunk)],
            'links': re.findall(r'href="([^"]+)"', chunk),
            'tag': (re.search(r'<(h\d)[^>]*class="elementor-heading-title', chunk) or [None, None])[1],
            'raw': chunk,
            'attrs': H.unescape(m.group(0)),
        })
    return out
