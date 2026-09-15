This version uses typescript and a bundler called Vite.
To install:

```
$ npm install
```

Notice that you don't have to run `tsc`.
The bundler does that for you.
The bundler also reduces the number of network calls when a client fetches the page, by combining all of the js files into one.
To see this:

```
$ npm run build
$ npm run preview
```

Watch the network log in the client when fetching the page and count the number of requests.
Compare with the version with no bundler.
