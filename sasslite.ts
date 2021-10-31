import fs from 'fs';
import { transform } from './transform';

const input = fs.readFileSync(process.argv[2]).toString();
console.log(transform(input));
