e = open('engine8.js').read().replace('const DUR = 76.0;', 'const DUR = 96.8;')
a = open('alamy.js').read(); t = open('tuk_block.js').read()
p = open('ep14.js').read().replace('${BASTAM}', open('bastam_def.js').read()).replace('${GARAGE}', open('garage_block.js').read()).replace('${HODA}', open('hoda_def.js').read())
open('scene14.js', 'w').write(e + '\n' + a + '\n' + t + '\n' + p)
