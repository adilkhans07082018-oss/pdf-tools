const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/tools/*/page.tsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  const successRegex = /\{([a-zA-Z0-9_]+(?:\s*&&\s*[a-zA-Z0-9_]+)?)\s*&&\s*(?:\(\s*(?:<div className="w-full">)?\s*)?(<SuccessScreen[\s\S]*?\/>)(?:\s*(?:<\/div>)?\s*\))?\s*\}/;
  const match = content.match(successRegex);
  
  if (match) {
    const condition = match[1];
    const successScreenJsx = match[2];
    
    content = content.replace(match[0], '');
    
    const earlyReturn = `  if (${condition}) {\n    return (\n      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[600px]">\n        ${successScreenJsx}\n      </div>\n    );\n  }\n\n  return (`;
    
    content = content.replace(/  return \(/, earlyReturn);
    
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  } else {
    console.log('No match in ' + file);
  }
}
