e = open('engine8.js').read().replace('const DUR = 76.0;', 'const DUR = 99.5;')
t = open('tuk_block.js').read(); b = open('bastam_def.js').read()
p = open('ep13.js').read().replace('${BASTAM}', b)
open('scene13.js', 'w').write(e + '\n' + t + '\n' + p)
