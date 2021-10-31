# cssplus

Expands nested CSS rules and will eventually support variables.

## Install

```bash
$ yarn add github.com/multiprocessio/cssplus@0.1.0
```

## Use

```js
import fs from 'fs';
import { transform } from 'cssplus';

const myCSSPlusFile = fs.readFileSync('myfile.css').toString();
const css = transform(myCSSPlusFile);
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
$ node ./node_modules/cssplus/scripts/cssplus.js example.css
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
