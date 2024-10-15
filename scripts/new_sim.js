const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const fs = require('fs');

function transformFileName(fileName) {
  const lowerCase = fileName.toLowerCase();

  const camelCase = lowerCase
    .replace(/^[0-9\. ]*/, '')
    .replace(/( [\S])/g, (match) => match.trim().toUpperCase());

  const pascalCase = lowerCase
    .replace(/( )/g, '_');

  const titleCase = lowerCase
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());

  return { camelCase, pascalCase, titleCase };
}

function createNewFile(fileName, targetDir) {
  const { camelCase, pascalCase, titleCase } = transformFileName(fileName);

  // 1. Copy and rename template file
  const templateFilePath = 'src/sketches/template/TEMPLATE.ts';
  const newFilePath = `src/sketches/${targetDir}/${pascalCase}.ts`;
  fs.copyFileSync(templateFilePath, newFilePath);

  // 2. Replace placeholders in the new file
  let fileContent = fs.readFileSync(newFilePath, 'utf-8');
  fileContent = fileContent.replace(/templateSketch/g, `${camelCase}Sketch`);
  fileContent = fileContent.replace("title: ''", `title: '${titleCase}'`);
  fs.writeFileSync(newFilePath, fileContent);

  // 3. Add export to index.ts
  const indexFilePath = `src/sketches/${targetDir}/index.ts`;
  fs.appendFileSync(
    indexFilePath,
    `export * from './${pascalCase}';\n`
  );

  // 4. Add import and re-export to data.ts
  const dataFilePath = 'src/data.ts';
  let dataContent = fs.readFileSync(dataFilePath, 'utf-8');
  let sketchTarget;
  if (targetDir === 'nature_of_code') {
    sketchTarget = 'natureOfCodeSketches';
  } else if (targetDir === 'misc') {
    sketchTarget = 'miscSketches';
  }

  const importStatement = `} from "./sketches/${targetDir}";`
  const exportStatement = `export const ${sketchTarget}: SketchHolder[] = [`

  // Insert import statement
  const importIndex = dataContent.indexOf(importStatement);
  if (importIndex !== -1) {
    dataContent =
      dataContent.slice(0, importIndex - 1) +
      `\n  ${camelCase}Sketch,` +
      dataContent.slice(importIndex - 1);
  } else {
    console.log('Could not add import to data file.');
    return;
  }

  // Insert into export array
  const exportIndex = dataContent.indexOf(exportStatement);
  if (exportIndex !== -1) {
    const exportArrayEndIndex = dataContent.indexOf('];', exportIndex + exportStatement.length);
    dataContent =
      dataContent.slice(0, exportArrayEndIndex) +
      `  ${camelCase}Sketch,\n` +
      dataContent.slice(exportArrayEndIndex);
  } else {
    console.log('Could not add export to data file.');
    return;
  }

  fs.writeFileSync(dataFilePath, dataContent);

  console.log(`File '${targetDir}/${pascalCase}.ts' created and updated successfully!`);
}

function getTargetDirectory(fileName, callback) {
  readline.question(
    `Select a folder for ${fileName}:\n1. Nature of Code\n2. Misc\n(Enter 1 or 2): `,
    (choice) => {
      if (choice !== "1" && choice !== "2") {
        console.log(`Invalid choice. You entered a ${choice}. Please enter 1 or 2.`);
        getTargetDirectory(fileName, callback);
      } else callback(choice === "1" ? 'nature_of_code' : 'misc')
    }
  )
}

readline.question(
  'Enter name of the new simulation. (default: New Simulation): ',
  (name) => {
    const fileName = name || 'New Simulation';
    getTargetDirectory(fileName, (targetDir) => {
      createNewFile(fileName, targetDir);
      readline.close();
    });
  }
);