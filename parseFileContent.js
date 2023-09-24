const parseFileContent = (fileContent) => {
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line !== '');
    return lines;
  };
  
export { parseFileContent };