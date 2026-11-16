e = open('engine8.js').read().replace('const DUR = 76.0;', 'const DUR = 46.4;').replace('const W = 640, H = 480;', 'const W = 540, H = 960;')
open('scene18.js', 'w').write(e + '\n' + open('vertical_common.js').read() + '\n' + open('ep18.js').read())
