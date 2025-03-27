function mergeCrimeData(boroughName, nestedCrimeData20122020, nestedCrimeData20212025) {
    const mergedData = {};
    const boroughData20122020 = nestedCrimeData20122020[boroughName] || {};
    const boroughData20212025 = nestedCrimeData20212025[boroughName] || {};

    // Merge data from 2012-2020
    Object.keys(boroughData20122020).forEach(crimeType => {
        mergedData[crimeType] = { ...boroughData20122020[crimeType] };
    });

    // Merge data from 2021-2025
    Object.keys(boroughData20212025).forEach(crimeType => {
        if (!mergedData[crimeType]) {
            mergedData[crimeType] = {};
        }
        Object.keys(boroughData20212025[crimeType]).forEach(year => {
            mergedData[crimeType][year] = boroughData20212025[crimeType][year];
        });
    });

    return mergedData;
}