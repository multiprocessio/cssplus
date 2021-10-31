const { transform, SETTINGS } = require("./sasslite");

test("basic css", () => {
  const basic = `
input .input, button .button {
  color: white;
  border: 1px solid blue;
}

a[value="{foobar,"] {
  font-size: 0;
}
`;
  expect(transform(basic)).toEqual(`input .input,
button .button {
  color: white;
  border: 1px solid blue;
}

a[value="{foobar,"] {
  font-size: 0;
}`);
});

test("nested css", () => {
  const nested = `

input .input, button .button {
  color: white;
  border: 1px solid blue;

  a[value="{foobar,"] {
    font-size: 0;
  }
}

`;

  expect(transform(nested)).toEqual(`input .input,
button .button {
  color: white;
  border: 1px solid blue;
}

input .input a[value="{foobar,"],
button .button a[value="{foobar,"] {
  font-size: 0;
}`);
});

test("keyframe css", () => {
  const keyframe = `
a {
  color: white;
}

@keyframes pulse {
  0% {
    background: white;
  }
  50% {
    background: red;
  }
}

`;

  expect(transform(keyframe)).toEqual(keyframe.trim());
});

test("string parsing", () => {
  const sp = `
div {
  background: url('};,:');
}

div {
  background: url("};,:");
}

`;
  expect(transform(sp)).toEqual(sp.trim());
});

test("comments", () => {
  const comment = `
/* a comment */
div {
  background: white;
}

`;
  expect(transform(comment)).toEqual(`div {
  background: white;
}`);
});

test("invalid", () => {
  const missingclose = `
div {

`;
  const missingcolonfirst = `
div {
  a
}
`;
  const missingcolonsecond = `
div {
  a: 1;
  b
}
`;

  // And test debugging
  SETTINGS.DEBUG = true;

  for (const test in [missingclose, missingcolonfirst, missingcolonsecond]) {
    try {
      transform(test);
      throw new Error("should not be here");
    } catch (e) {
      if (e.message === "should not be here") {
        throw e;
      }

      console.error(e);
    }
  }
});
