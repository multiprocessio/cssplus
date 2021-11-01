# cssplus

Expands nested CSS rules efficiently by fuzzy parsing and not
validating the specific syntax of selectors and property values.

## Install

```bash
$ yarn add github.com/multiprocessio/cssplus@
```

## Use

```js
import fs from 'fs';
import { transform } from 'cssplus';

const myCSSPlusFile = fs.readFileSync('myfile.css').toString();
const css = transform(myCSSPlusFile);
```

## Command-line example

This repo includes a number of example files that should be correctly
transformed.

```scss
$ cat examples/all-basic-features.css
input .input, button .button {
  color: white;
  border: 1px solid blue;

  a[value="{foobar,"] {
    font-size: 0;
  }
}

.container {
  .row {
    .col {
      display: flex;
    }
  }
}


/* Testing out some things */

a {
  background: url('mygreaturl;).,}{');
}

@keyframes pulse {
  0% {
    background: white;
  }
  50% {
    background: red;
  }
}
```

Run:

```css
$ node ./node_modules/cssplus/scripts/cssplus.js examples/all-basic-features.css
input .input,
button .button {
  color: white;
  border: 1px solid blue;
}

input .input a[value="{foobar,"],
button .button a[value="{foobar,"] {
  font-size: 0;
}

.container .row .col {
  display: flex;
}

a {
  background: url('mygreaturl;).,}{');
}

@keyframes pulse {
  0% {
    background: white;
  }
  50% {
    background: red;
  }
}
```
