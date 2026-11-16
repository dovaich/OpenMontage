#!/bin/bash
# usage: bash docs/briefs/vertical-template/new_episode.sh <project-name> <port>
# creates projects/<name>/{build,artifacts,renders,assets/audio/google} from the template and installs three + fonts
set -e
P=projects/$1; T=docs/briefs/vertical-template
mkdir -p $P/build $P/artifacts $P/renders $P/assets/audio/google
cp $T/engine8.js $T/vertical_common.js $T/samir_car.js $T/alamy.js $T/garage_block.js $T/crew_def.js $T/framing_check.js $T/model_chars.js $T/render.cjs $T/index.html $T/package.json $T/encode_vertical.sh $P/build/
sed -i "s#127.0.0.1:[0-9]*#127.0.0.1:$2#" $P/build/render.cjs
sed -i "s#src=\"scene[0-9]*.js\"#src=\"scene.js\"#" $P/build/index.html
(cd $P/build && npm install --silent)
echo "ready: $P/build  (write ep.js, build.py -> scene.js, serve with: python3 -m http.server $2 --bind 127.0.0.1)"
