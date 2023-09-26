const createArrayOfObjects = (lines, prefix) => {
    const result = [];
    let currentIndex = 0;
  
    while (currentIndex < lines.length) {
      const currentSensor = lines[currentIndex];
      const date = lines[currentIndex + 1];
      const data = [];
  
      // Start from currentIndex + 3 to collect data
      let dataIndex = currentIndex + 2;
      while (dataIndex < lines.length && !lines[dataIndex].includes(`${prefix}`)) {
        // Push and format data for new string
        data.push(lines[dataIndex].replace('\r', '\n'));
        dataIndex++;
      }
  
      // Create a new object for each set of data
      result.push({ name: currentSensor, date, data, read: false, sent: false });
  
      // Move currentIndex to the next sensor
      currentIndex = dataIndex;
    }
  
    return result;
  };
  
  export { createArrayOfObjects };
  