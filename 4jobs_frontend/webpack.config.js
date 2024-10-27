const path = require('path');

module.exports = {
    // ... existing configuration ...
    resolve: {
        // Ensure no fallback property is present
        alias: {
            // Example alias
            '@components': path.resolve(__dirname, 'src/components/'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'], // Add necessary extensions
        // ... other properties ...
    },
    // ... existing configuration ...
}
