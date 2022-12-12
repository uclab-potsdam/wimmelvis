#! /usr/bin/env python3

# I was too lazy to create html elements for every one of the 26 items, so I just wrote this script.
# When being run it is piped into linear/linear-items.html
# Could have been done in NodeJS ofc to keep the dependencies minimal, I'm just more used to python.

import json

html_snippet = '''\
    <div id="{item_id}" class="{classes}">
      <img src="../common/assets/items/{item_id}_w_symbol.png">
      <h3>{heading}</h3>
      <p>
        {text}
      </p>
    </div>
'''

even = False

with open("./common/assets/waste_data.json") as json_file:
  items = json.load(json_file)
  for item_id, item in items.items():
    print(html_snippet.format(
      item_id = item_id,
      classes = "linear-item" + " " + ("even" if even else "uneven"),
      heading = item["name_EN"],
      text = item["material_info_EN"]
    ))
    even = not even
