This version uses typescript and a bundler called Vite.
To install:

```
$ npm install
```

The bundler reduces the number of network calls when a client fetches the page by combining all of the js files into one.
To see this:

```
$ npm run build
$ npm run preview
```

Notice that you don't have to run `tsc`; the bundler does that for you.
Watch the network log in the client when fetching the page and count the number of requests.
Compare with the version with no bundler where you'll see a separate GET request for each js module.

If you run the development server, you'll still see multiple requests, even with Vite.
In fact, with the Vite development server, you'll see *more* requests than in the un-bundled case, because the development server sends extra stuff to help debugging.
