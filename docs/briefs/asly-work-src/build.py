import json, re
dur = json.loads(open('lines.js').read()[len('window.LINES_DATA='):-1])['dur']
e = open('engine8.js').read().replace('const DUR = 76.0;', f'const DUR = {dur};').replace('const W = 640, H = 480;', 'const W = 540, H = 960;')
p = open('ep22.js').read().replace('${GARAGE}', open('garage_block.js').read()).replace('${CREW}', open('crew_def.js').read())
open('scene22.js', 'w').write(e + '\n' + open('alamy.js').read() + '\n' + open('samir_car.js').read() + '\n' + open('vertical_common.js').read() + '\n' + p)
r = open('render.cjs').read(); r = re.sub(r'Math\.ceil\([0-9.]+ \* fps\)', f'Math.ceil({dur} * fps)', r); open('render.cjs', 'w').write(r)
print('DUR', dur)
