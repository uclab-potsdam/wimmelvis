All steps need to happen in the `study/` directory, the one this README is placed in.

```
cd <path-to-your-project>/study
```

# Building the webpage

As we reuse quite a lot of HTML for the A/B versions, a basic templating engine is used. That requires unfortunately, that in order to use the page you have to **build** the page everytime you change something.

Before building you have to install the necessary dependencies once:

```
npm install
```

Building then works by running

```
npm run build
```

**Important**: Do not edit the files `wimmelbild/index.html` and `linear/index.html`! They are build products that are not checked into Git. Your changes will be overwritten without a backup!

The right place to make edits are the files in `common/` and the `template.html` files in both versions.


# Running a development webserver

There are different ways to achieve this. One would be to install `http-server` once from npm:

```
npm install -g http-server
```

After it is installed you can run it in the `study/` directory.

```
http-serveg -p 8000
```

The webpage should be available now on http://127.0.0.1:8000/ .

For reloading the page it might be necessary to do a force-reload in your web browser. E.g. Cmd+Option+r in Safari.
