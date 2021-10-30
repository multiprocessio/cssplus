# sasslite

A minimal SASS-like expander.

Transforms:

```scss
input .input, button .button {
  color: white;
  border: 1px solid blue;

  a[value="{foobar,"] {
    font-size: 0;
  }
}
```


Into:

```
input .input, button .button {
  color: white;
  border: 1px solid blue;
}

input .input a[value="{foobar,"], button .button a[value="{foobar,"] {
  font-size: 0;
}
```
