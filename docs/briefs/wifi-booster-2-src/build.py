e = open('engine8.js').read().replace('const DUR = 76.0;', 'const DUR = 41.5;').replace('const W = 640, H = 480;', 'const W = 540, H = 960;')
p = open('ep15.js').read()
open('scene15.js', 'w').write(e + '\n' + p)
