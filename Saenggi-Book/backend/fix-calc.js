const fs = require('fs');
const path = require('path');

const calcPath = path.join(__dirname, 'src/modules/jungsi/calculation/calculations/calc-2026.ts');
let content = fs.readFileSync(calcPath, 'utf-8');

// Check if already fixed
if (content.includes('let \uC810\uC218\uB370\uC774\uD130 = \uACFC\uBAA9\uB370\uC774\uD130[\uC870\uD68C\uD0A4];')) {
  console.log('Already fixed');
  process.exit(0);
}

// Find and replace
const oldLine = '  const \uC810\uC218\uB370\uC774\uD130 = \uACFC\uBAA9\uB370\uC774\uD130[\uC870\uD68C\uD0A4];';
const newLines = `  let \uC810\uC218\uB370\uC774\uD130 = \uACFC\uBAA9\uB370\uC774\uD130[\uC870\uD68C\uD0A4];

  // \uC810\uC218 \uB370\uC774\uD130\uAC00 \uC5C6\uC73C\uBA74 \uC810\uC218\uD45C \uBC94\uC704 \uCD08\uACFC \uC5EC\uBD80 \uD655\uC778 \uD6C4 \uCD5C\uB300/\uCD5C\uC18C\uAC12 \uC0AC\uC6A9
  if (!\uC810\uC218\uB370\uC774\uD130 && \uACFC\uBAA9.\uACFC\uBAA9 !== '\uC601\uC5B4' && \uACFC\uBAA9.\uACFC\uBAA9 !== '\uD55C\uAD6D\uC0AC') {
    const \uD45C\uC900\uC810\uC218 = \uACFC\uBAA9.\uD45C\uC900\uC810\uC218 || 0;
    const \uC810\uC218\uD45C\uD0A4\uB4E4 = Object.keys(\uACFC\uBAA9\uB370\uC774\uD130)
      .map(Number)
      .filter((k) => !isNaN(k))
      .sort((a, b) => a - b);

    if (\uC810\uC218\uD45C\uD0A4\uB4E4.length > 0) {
      const \uCD5C\uB300\uC810\uC218 = \uC810\uC218\uD45C\uD0A4\uB4E4[\uC810\uC218\uD45C\uD0A4\uB4E4.length - 1];
      const \uCD5C\uC18C\uC810\uC218 = \uC810\uC218\uD45C\uD0A4\uB4E4[0];

      if (\uD45C\uC900\uC810\uC218 > \uCD5C\uB300\uC810\uC218) {
        // \uC785\uB825 \uC810\uC218\uAC00 \uC810\uC218\uD45C \uCD5C\uB300\uAC12\uBCF4\uB2E4 \uB192\uC73C\uBA74 \uCD5C\uB300\uAC12 \uB370\uC774\uD130 \uC0AC\uC6A9
        \uC810\uC218\uB370\uC774\uD130 = \uACFC\uBAA9\uB370\uC774\uD130[String(\uCD5C\uB300\uC810\uC218)];
      } else if (\uD45C\uC900\uC810\uC218 < \uCD5C\uC18C\uC810\uC218) {
        // \uC785\uB825 \uC810\uC218\uAC00 \uC810\uC218\uD45C \uCD5C\uC18C\uAC12\uBCF4\uB2E4 \uB0AE\uC73C\uBA74 \uCD5C\uC18C\uAC12 \uB370\uC774\uD130 \uC0AC\uC6A9
        \uC810\uC218\uB370\uC774\uD130 = \uACFC\uBAA9\uB370\uC774\uD130[String(\uCD5C\uC18C\uC810\uC218)];
      }
    }
  }`;

if (content.includes(oldLine)) {
  content = content.replace(oldLine, newLines);
  fs.writeFileSync(calcPath, content, 'utf-8');
  console.log('Fixed calc-2026.ts');
} else {
  console.log('Could not find the line to replace');
  console.log('Looking for:', oldLine);
}
