# sasslite

A minimal expander from a subset of SASS to CSS using a fuzzy parser.

Supports:
* Nested CSS rules

## Install

```
yarn add github.com/multiprocessio/sasslite@0.1.0
```

## Use

```
import fs from 'fs';
import { transform } from 'sasslite';

const mySASSFile = fs.readFileSync('myfile.sass').toString();
const css = transform(mySASSFile);
```

## Command-line example

Create a CSS file:

```scss
$ cat example.css
input .input, button .button {
  color: white;
  border: 1px solid blue;

  a[value="{foobar,"] {
    font-size: 0;
  }
}
```

Run:

```css
$ node ./node_modules/sasslite/scripts/sasslite.js example.css
input .input,
button .button {
  color: white;
  border: 1px solid blue;
}

input .input a[value="{foobar,"],
button .button a[value="{foobar,"] {
  font-size: 0;
}
```
