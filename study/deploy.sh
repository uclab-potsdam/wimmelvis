#! /usr/bin/env bash

rm -r result2
nix build .#packages.x86_64-linux.website
cp -rL result result2
chmod a+w -R result2
scp -r result2/lib/node_modules/wimmelbild-study/* uclab@web02.fh-potsdam.de:public/wimmelvis/

