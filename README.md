# How to use

Run `npm install --save-dev --save-exact eslint && npm install --save-dev --save-exact eslint-config-secoya` in your project.
Now create `.eslintrc` at the root of your project with the following contents:

```yml
---
extends: secoya
```

Also here you can set up `.eslintignore` to ignore, let's say compiled output files in `lib`:

```
lib/**/*.js
```

Now you can lint your files in `src` by running:

```
./node_modules/.bin/eslint src
```
