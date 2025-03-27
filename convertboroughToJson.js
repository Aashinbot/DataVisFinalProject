function transformToNestedJSON(data) {
    return data.reduce((acc, row) => {
        const borough = row.Borough;
        const crimeType = row.CrimeType.toLowerCase();

        // Initialize the borough if it doesn't exist
        if (!acc[borough]) {
            acc[borough] = {};
        }

        // Initialize the crime type if it doesn't exist
        if (!acc[borough][crimeType]) {
            acc[borough][crimeType] = {};
        }

        // Add year and count data
        Object.keys(row).forEach(key => {
            if (!isNaN(key)) { // Check if the key is a year (e.g., "2012", "2013")
                acc[borough][crimeType][key] = +row[key]; // Convert count to a number
            }
        });

        return acc;
    }, {});
}
