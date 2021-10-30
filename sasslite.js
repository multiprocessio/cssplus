const fs = require('fs');

let DEBUG = false;

function eatWhitespace(input, start) {
  while (/\s/.test(input[start])) {
    start++;
  }

  return start;
}

function debug(msg, ...rest) {
  if (DEBUG) {
    console.log('[Debug] ' + msg, ...rest);
  }
}

function guard(input, i, msg) {
  debug(msg);
  if (input[i] === undefined) {
    throw new Error(msg + ' failed');
  }
}

function parse_rule(input, i) {
  let token = '';
  let rule = { selectors: [] };

  guard(input, i, 'Waiting for EOL');

  i = eatWhitespace(input, i);

  let prev = ',';
  while (true) {
    guard(input, i, 'Waiting for comma');
    ([token, i] = parse_token(input, i, ['{', ',']));
    rule.selectors.push(token);

    i = eatWhitespace(input, i);
    prev = input[i];
    if (prev === '{') {
      break;
    }
    i++; // Skip past ,
  }

  i++; // Skip past {

  rule.declarations = [];

  while (input[i] !== '}') {
    guard(input, i, 'Waiting for closing brace');
    const declaration = {};
    i = eatWhitespace(input, i);

    const possibleInnerDeclarationStartingPoint = i;
    // TODO: handle nested instead of declaration
    token = '';
    let foundInner = false;
    while (input[i] !== ':') {
      guard(input, i, 'Waiting for colon ' + rule.declarations.length ? 'after ' + JSON.stringify(rule.declarations[rule.declarations.length - 1], null, 2) : ' after first declaration');

      if (input[i] === '{') {
	const [nested, newI] = parse_rule(input, possibleInnerDeclarationStartingPoint);
	rule.declarations.push(nested);
	i = newI;
	foundInner = true;
	break;
      } else {
	token += input[i];
	i++;
      }
    }

    if (foundInner) {
      i = eatWhitespace(input, i);
      continue;
    }

    i++; // Skip past :

    declaration.property = token.trim();

    i = eatWhitespace(input, i);

    ([token, i] = parse_token(input, i, [';']));

    i++; // Skip past ;

    declaration.value = token.trim();

    rule.declarations.push(declaration);
    debug('Found declaration', declaration);

    i = eatWhitespace(input, i);
  }

  i++; // Skip past }

  debug('Found rule', rule);
  return [rule, i];
}

function parse(input, i = 0) {
  const rules = [];
  while (i < input.length) {
    i = eatWhitespace(input, i);
    const [rule, newI] = parse_rule(input, i);
    rules.push(rule);
    i = eatWhitespace(input, newI);
  }

  return rules;
}

function parse_token(input, i, endMarker) {
  let token = '';
  i = eatWhitespace(input, i);
  while (!endMarker.includes(input[i])) {
    guard(input, i, 'Waiting for ' + endMarker);
    if (input[i] === "'") {
      token += input[i];
      i++;
      while (input[i] !== "'") {
	guard(input, i, 'Waiting for closing single quote');
	token += input[i];
	i++;
      }
    } else if (input[i] === '"') {
      token += input[i];
      i++;
      while (input[i] !== '"') {
	guard(input, i, 'Waiting for closing double quote');
	token += input[i];
	i++;
      }
    } else if (input[i] === '[') {
      token += input[i];
      i++;
      while (input[i] !== ']') {
	guard(input, i, 'Waiting for closing bracket');
	token += input[i];
	i++;
      }
    }
    token += input[i];
    i++;
  }

  return [token.trim(), i];
}

function write(rules) {
  const out = [];
  rules.forEach(function writeRule(rule) {
    const declarations = [rule.selectors.join(', ') + ' {'];

    rule.declarations.forEach(function writeDecl(decl) {
      declarations.push('  ' + decl.property + ': ' + decl.value + ';');
    });

    declarations.push('}');

    out.push(declarations.join('\n'));
  });

  return out.join('\n\n');
}

// SOURCE: https://stackoverflow.com/a/43053803/1507139
function cartesian(...a) {
  return a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
}

function flatten(rules) {
  rules.forEach(function writeRule(rule, i) {
    rule.declarations.forEach(function flattenDecl(decl, di) {
      if (decl.declarations) {
	// Insert into global rules after this one with correct selector
	rules.splice(i + 1, 0, {
	  ...decl,
	  selectors: cartesian(rule.selectors, decl.selectors).map(inner => inner.join(' ')),
	});

	// Remove from here
	rule.declarations.splice(di, 1);
      }
    });
  });
}

const example = `

input .input, button .button {
  color: white;
  border: 1px solid blue;

  a[value="{foobar,"] {
    font-size: 0;
  }
}

`;

const input = fs.readFileSync(process.argv[2]).toString();
const rules = parse(example);
flatten(rules);

console.log(write(rules));
