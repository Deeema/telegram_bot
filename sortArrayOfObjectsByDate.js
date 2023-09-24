const sortArrayOfObjectsByDate = (arrayOfObjects) => {
    // Comparison function to sort objects by date
    const compareByDate = (a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    };
  
    // Sort the array of objects by date
    return arrayOfObjects.sort(compareByDate);
  };

  export { sortArrayOfObjectsByDate };