import re
e = open('engine8.js').read().replace('const DUR = 76.0;', 'const DUR = 132.9;')
a = open('alamy.js').read(); t = open('tuk_block.js').read(); b = open('bastam_def.js').read()
p = open('ep12.js').read().replace('${BASTAM}', b)
open('scene12.js', 'w').write(e + '\n' + a + '\n' + t + '\n' + p)
