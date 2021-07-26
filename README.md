# Wimmelbild Template
This is a simple template to create an interactive wimmelbild. Wimmelbilder are drawings of large scale environments where a variety of objects, characters and actions are represented. One or multiple key elements within the representation can be hidden to observers who will have to discover them. 

An interactive wimmelbild leverages the possibility of enclosing additional information with hidden objects, as readers discover objects they are also able to read further and deepen their knowledge on a particular topic. The possibility to set a scene and decide which objects should be discovered by readers make interactive wimmelbilder a promising format to consume information on any given topic. This repository contains code examples to recreate an interactive wimmelbild. The provided templates and designs are open source, thouroughly commented and ready to be used.

----
### How it works
When the code is executed, the svg<sup>*</sup> included in the folder is loaded inside the html. At the same time, data are loaded from the json file. The svg is then parsed and everytime data and groups names match the svg object is assigned a special class that the user will be able to toggle via click making the object visible. Consequently a series of actions can be programmed to be triggered once specific objects are discovered. 

<sup>*</sup> The whole graphic can be freely designed according to the designers intentions, however some layers are key for the template to work. First, we need a `background` layer which includes all the graphics and sublayers. Then we need an individual layer with groups, each group is the **active** version of the object. If we have objects that are only partially visible because hidden behind other things in the scene, it is possible to create buffer layers and leave the active version on the same level as the inactive one. However **it is really important that every active object has a UNIQUE id as a group name**, double naming can cause the template to misbehave, e.g. not showing the correct object as active/inactive. To better understand how the svg is structured you can open one of the examples contained in the subfolders with your software of choice (e.g Adobe AI, Sketch, Figma, etc.).

----
### Folders' structure

The folder contains one introduction page on the first level and two subfolders: `\basic` and `\advanced`.

`\basic` contains a simplified version of the template. It consists of three files: `index.html` containing its barebone structure, `shapes.svg` containing the scene that will be loaded inside the page, and `data.json` containing the additional information bits that will be chained to specific objects within the scene.

```
📦basic
 ┣ 📜data.json
 ┣ 📜index.html
 ┗ 📜shapes.svg
```

`\advanced` contains an elaborated version of the template with a more complex scene and very specific underlying data. The javascript logic is contained in `main.js` and style has its own directory `/style` which includes mobile specifications. All images and data are inside the `/assets` folder.

```
📦advanced
 ┣ 📂assets
 ┃ ┣ 📜.DS_Store
 ┃ ┣ 📜closed-history.svg
 ┃ ┣ 📜kitchen.svg
 ┃ ┣ 📜opened-history.svg
 ┃ ┣ 📜waste_data.json
 ┃ ┣ 📜wimmelbild_logo.png
 ┃ ┗ 📜wimmelbild_scheme.svg
 ┣ 📂style
 ┃ ┣ 📜mobile.css
 ┃ ┗ 📜style.css
 ┣ 📜.DS_Store
 ┣ 📜index.html
 ┣ 📜main.js
 ┗ 📜smoothscroll.min.js
```

Both templates present roughly the same features:
- One interactive scene 
- Clickable objects with specific descriptions attached
- History panel that stores objects as they are discovered
- A reset button to clean history and scene

The difference among the two folders lies in how sophisticated each feature both in terms of code and graphics. While the `\basic` example is useful to get familiarized with the underlying logic behind the template, `\advanced` is a good starting point for developing further features for savvy coders.

----
### Installation
- Clone or download this repository to your local machine
- Open the folder in a code editor (such as [VS Code](https://code.visualstudio.com/) or [Atom](https://atom.io/))
- Launch a local server through your editor or terminal:
to launch a server open your terminal application. `cd` to the folder you are working in and enter one of these commands:
Simple python server
```
# If Python version returned above is 3.X
python3 -m http.server
# On windows try "python" instead of "python3", or "py -3"
# If Python version returned above is 2.X
python -m SimpleHTTPServer
```

Full explanation [here](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server)
- Navigate with your browser to the localhost address
