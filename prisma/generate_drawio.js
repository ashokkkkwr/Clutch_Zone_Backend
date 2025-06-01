/*
 * Node.js script to read a Prisma schema and output a draw.io (mxGraph) XML
 * Usage: node generate_drawio.js schema.prisma > diagram.drawio
 */
const fs = require('fs');

// Read the schema file from command-line
const [,, schemaPath] = process.argv;
if (!schemaPath) {
  console.error('Usage: node generate_drawio.js <schema.prisma>');
  process.exit(1);
}
const schema = fs.readFileSync(schemaPath, 'utf-8');

// Parse models
const modelRegex = /model\s+(\w+)\s+{([\s\S]*?)^}/gm;
let match;
const models = [];
while ((match = modelRegex.exec(schema)) !== null) {
  const name = match[1];
  const bodyLines = match[2]
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('//'));

  const attrs = bodyLines
    .map(line => {
      const [attrName, type] = line.split(/\s+/);
      if (!attrName || !type || attrName.startsWith('@') || attrName.startsWith('@@')) return null;
      return { name: attrName, type };
    })
    .filter(Boolean);

  models.push({ name, attrs });
}

// Helper to create a class box cell
function makeClassCell(id, model, x, y) {
  const width = 160;
  const headerHeight = 24;
  const rowHeight = 16;
  const height = headerHeight + rowHeight * model.attrs.length;
  const attrLines = model.attrs
    .map(a => `${a.name}: ${a.type.replace(/\?$/, '')}`)
    .join('&#10;');

  return `
    <mxCell id="${id}" value="<b>${model.name}</b><hr>${attrLines}" style="rounded=1;whiteSpace=wrap;html=1;strokeColor=#000000;fillColor=#FFFFFF;" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>`;
}

// Build the XML document
let cells = [];
cells.push('<mxCell id="0"/>');
cells.push('<mxCell id="1" parent="0"/>');

// Place models in a grid
const cols = 4;
const gapX = 200;
const gapY = 200;
models.forEach((model, idx) => {
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  const x = 20 + col * gapX;
  const y = 20 + row * gapY;
  const cell = makeClassCell(idx + 2, model, x, y);
  cells.push(cell);
});

// Compose the final XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="node.js" etag="" version="15.8.7" type="device">
  <diagram id="diagram1" name="Page-1">
    <mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
      <root>
        ${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

// Output XML
console.log(xml);
