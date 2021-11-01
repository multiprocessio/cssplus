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
$ yarn && yarn build
$ node ./scripts/cssplus.js examples/all-basic-features.css
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

## Benchmarks

This library is a good deal faster than the native C++ libsass parser:

```
$ cd ./benchmarks && yarn

$ time node ./js-scss-runner.js ./tens-of-thousands-of-rules.scss > js-scss-out
node ./js-scss-runner.js ./tens-of-thousands-of-rules.scss > js-scss-out  1.23s user 0.05s system 156% cpu 0.820 total

$ time node ./native-scss-runner.js ./tens-of-thousands-of-rules.scss > native-scss-out
node ./native-scss-runner.js ./tens-of-thousands-of-rules.scss >   0.31s user 0.04s system 102% cpu 0.338 total

$ time node ./cssplus-runner.js ./tens-of-thousands-of-rules.scss > cssplus-out
node ./cssplus-runner.js ./tens-of-thousands-of-rules.scss > cssplus-out  0.37s user 0.02s system 157% cpu 0.246 total
```

This is only possible because this library does no validation of
selectors or property values.

### Nested rule support

For some reason, this library handles massively nested rules better
than the JavaScript sass library and C++ sass library.

```
$ cd ./benchmarks && yarn

$ time node ./cssplus-runner.js ./too-nested.scss > cssplus-out 
node ./cssplus-runner.js ./too-nested.scss > cssplus-out  2.90s user 0.48s system 180% cpu 1.870 total

$ time node ./js-scss-runner.js ./too-nested.scss > js-scss-out                        
undefined:3
throw error;
^

Error: Stack Overflow
    at Object._newRenderError (/home/phil/multiprocess/cssplus/benchmarks/node_modules/sass/sass.dart.js:16144:19)
    at StaticClosure.renderSync (/home/phil/multiprocess/cssplus/benchmarks/node_modules/sass/sass.dart.js:15947:23)
    at Object.Primitives_applyFunction (/home/phil/multiprocess/cssplus/benchmarks/node_modules/sass/sass.dart.js:6140:30)
    at Object.Function_apply (/home/phil/multiprocess/cssplus/benchmarks/node_modules/sass/sass.dart.js:13486:16)
    at _callDartFunctionFast (/home/phil/multiprocess/cssplus/benchmarks/node_modules/sass/sass.dart.js:15192:16)
    at Object.renderSync (/home/phil/multiprocess/cssplus/benchmarks/node_modules/sass/sass.dart.js:15170:18)
    at Object.<anonymous> (/home/phil/multiprocess/cssplus/benchmarks/js-scss-runner.js:2:18)
    at Module._compile (internal/modules/cjs/loader.js:1085:14)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1114:10)
    at Module.load (internal/modules/cjs/loader.js:950:32) {
  formatted: 'Error: Stack Overflow',
  status: 3
}
node ./js-scss-runner.js ./too-nested.scss > js-scss-out  0.29s user 0.04s system 115% cpu 0.283 total

$ time node ./native-scss-runner.js ./too-nested.scss > native-scss-out
/home/phil/multiprocess/cssplus/benchmarks/node_modules/node-sass/lib/index.js:440
  throw Object.assign(new Error(), JSON.parse(result.error));
  ^

Error: Code too deeply neested
    at Object.module.exports.renderSync (/home/phil/multiprocess/cssplus/benchmarks/node_modules/node-sass/lib/index.js:440:23)
    at Object.<anonymous> (/home/phil/multiprocess/cssplus/benchmarks/native-scss-runner.js:2:18)
    at Module._compile (internal/modules/cjs/loader.js:1085:14)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1114:10)
    at Module.load (internal/modules/cjs/loader.js:950:32)
    at Function.Module._load (internal/modules/cjs/loader.js:790:12)
    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:76:12)
    at internal/main/run_main_module.js:17:47 {
  status: 1,
  file: '/home/phil/multiprocess/cssplus/benchmarks/too-nested.scss',
  line: 511,
  column: 256,
  formatted: 'Error: Code too deeply neested\n' +
    '        on line 511 of too-nested.scss\n' +
    '>> \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tdiv {\n' +
    '\n' +
    '   ------------------------------------------^\n'
}
node ./native-scss-runner.js ./too-nested.scss > native-scss-out  0.13s user 0.01s system 109% cpu 0.127 total
```