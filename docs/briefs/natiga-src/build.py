e = open('engine8.js').read().replace('const DUR = 76.0;', 'const DUR = 44.1;').replace('const W = 640, H = 480;', 'const W = 540, H = 960;')
open('scene19.js', 'w').write(e + '\n' + open('vertical_common.js').read() + '\n' + open('ep19.js').read())
