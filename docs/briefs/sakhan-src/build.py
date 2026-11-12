e = open('engine8.js').read().replace('const DUR = 41.5;', 'const DUR = 37.9;').replace('const DUR = 76.0;', 'const DUR = 37.9;').replace('const W = 640, H = 480;', 'const W = 540, H = 960;')
open('scene16.js', 'w').write(e + '\n' + open('vertical_common.js').read() + '\n' + open('ep16.js').read())
