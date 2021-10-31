export const SETTINGS = {
  DEBUG: false,
};

function eatWhitespace(input: string, start: number) {
  while (/\s/.test(input[start])) {
    start++;
  }

  // Eat comments
  if (input[start] === '/' && input[start + 1] === '*') {
    // Skip past /*
    start += 2;
    while (!(input[start] === '*' && input[start + 1] === '/')) {
      start++;
    }
    // Skip past */
    start += 2;
  }

  while (/\s/.test(input[start])) {
    start++;
  }

  return start;
}

function debug(msg: string, ...rest: Array<any>) {
  if (SETTINGS.DEBUG) {
    console.log('[Debug] ' + msg, ...rest);
  }
}

function guard(input: string, i: number, msg: string) {
  debug(msg);
  if (input[i] === undefined) {
    throw new Error(msg + ' failed');
  }
}

export interface Declaration {
  type: 'declaration';
  property: string;
  value: string;
}

export interface Rule {
  type: 'rule';
  selectors: Array<string>;
  declarations: Array<Declaration | Rule>;
}

function parseRule(input: string, i: number): [Rule, number] {
  let token = '';
  let rule: Rule = { selectors: [], declarations: [], type: 'rule' };

  guard(input, i, 'Waiting for EOL');

  i = eatWhitespace(input, i);

  let prev = ',';
  while (true) {
    guard(input, i, 'Waiting for comma');
    [token, i] = parseToken(input, i, ['{', ',']);
    rule.selectors.push(token);

    i = eatWhitespace(input, i);
    prev = input[i];
    if (prev === '{') {
      break;
    }
    i++; // Skip past ,
  }

  i++; // Skip past {

  while (input[i] !== '}') {
    guard(input, i, 'Waiting for closing brace');
    const declaration: Declaration = {
      type: 'declaration',
      property: '',
      value: '',
    };
    i = eatWhitespace(input, i);

    const possibleInnerDeclarationStartingPoint = i;
    // TODO: handle nested instead of declaration
    token = '';
    let foundInner = false;
    while (input[i] !== ':') {
      guard(
        input,
        i,
        'Waiting for colon ' +
          (rule.declarations.length > 0
            ? 'after ' +
              JSON.stringify(
                rule.declarations[rule.declarations.length - 1],
                null,
                2
              )
            : 'after first declaration')
      );

      if (input[i] === '{') {
        const [nested, newI] = parseRule(
          input,
          possibleInnerDeclarationStartingPoint
        );
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

    [token, i] = parseToken(input, i, [';']);

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

function parse(input: string, i = 0) {
  const rules: Rule[] = [];
  while (i < input.length) {
    i = eatWhitespace(input, i);
    const [rule, newI] = parseRule(input, i);
    rules.push(rule);
    i = eatWhitespace(input, newI);
  }

  return rules;
}

function parseToken(
  input: string,
  i: number,
  endMarker: Array<string>
): [string, number] {
  let token = '';
  i = eatWhitespace(input, i);
  while (!endMarker.includes(input[i])) {
    guard(input, i, 'Waiting for ' + JSON.stringify(endMarker));
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

function cartesian(...a: string[][]): string[][] {
  return a.reduce(
    (a, b) =>
      a.map((x) => b.map((y) => x.concat(y))).reduce((c, d) => c.concat(d), []),
    [[]] as string[][]
  );
}

function flatten(rules: Rule[]) {
  rules.forEach(function writeRule(rule, i) {
    rule.declarations.forEach(function flattenDecl(decl, di) {
      if (decl.type === 'rule' && !rule.selectors[0].startsWith('@')) {
        // Insert into global rules after this one with correct selector
        rules.splice(i + 1, 0, {
          ...decl,
          selectors: cartesian(rule.selectors, decl.selectors).map((inner) =>
            inner.join(' ')
          ),
        });

        // Remove from here
        rule.declarations.splice(di, 1);
      }
    });
  });
}

function write(rules: Rule[], indent = '') {
  const out: string[] = [];
  rules.forEach(function writeRule(rule) {
    const declarations = [indent + rule.selectors.join(',\n') + ' {'];

    rule.declarations.forEach(function writeDecl(decl) {
      if (decl.type === 'rule') {
        const rules = write([decl], indent + '  ');
        declarations.push(rules);
      } else {
        declarations.push(
          indent + '  ' + decl.property + ': ' + decl.value + ';'
        );
      }
    });

    declarations.push(indent + '}');

    out.push(declarations.join('\n'));
  });

  return out.join('\n\n');
}

export function transform(cssp: string) {
  const rules = parse(cssp);
  flatten(rules);
  return write(rules);
}
