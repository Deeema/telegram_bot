export function formatFloat(floatValue, decimalPlaces = 2) {
    if (typeof floatValue !== 'number') {
    //   throw new Error('Input must be a number');
        return;
    }
  
    // Use toFixed to round the number to the specified decimal places
    const roundedValue = floatValue.toFixed(decimalPlaces);
  
    // Convert the result back to a float (removing trailing zeros)
    const formattedFloat = parseFloat(roundedValue);
  
    return formattedFloat;
}