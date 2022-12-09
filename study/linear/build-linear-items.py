#! /usr/bin/env python3

import json

html_snippet = '''\
    <div id="{item_id}" class="linear-item">
      <img src="../common/assets/items/{item_id}_w_symbol.png">
      <h3>{heading}</h3>
      <p>
        {text}
      </p>
    </div>
'''

with open("./common/assets/waste_data.json") as json_file:
  items = json.load(json_file)
  for item_id, item in items.items():
    print(html_snippet.format(
      item_id = item_id,
      heading = item["name_EN"],
      text = item["material_info_EN"]
    ))
