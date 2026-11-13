import json, re
dur = json.loads(open('lines.js').read()[len('window.LINES_DATA='):-1])['dur']
e = open('engine8.js').read().replace('const DUR = 76.0;', f'const DUR = {dur};').replace('const W = 640, H = 480;', 'const W = 540, H = 960;')
open('scene21.js', 'w').write(e + '\n' + open('vertical_common.js').read() + '\n' + open('ep21.js').read())
r = open('render.cjs').read(); r = re.sub(r'Math\.ceil\([0-9.]+ \* fps\)', f'Math.ceil({dur} * fps)', r); open('render.cjs', 'w').write(r)
print('DUR', dur)
