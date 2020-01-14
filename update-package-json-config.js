const fs = require("fs");
const path = require("path");

const { problemCodeToConfigKeyMapping } = require("./out/configuration");

// Вспомогательная функция, для того, чтобы сгенерировать часть package.json
function generateConfigSection() {
    const config = {};

    Object.keys(problemCodeToConfigKeyMapping).forEach(problemCode => {
        const configKey = `example.severity.${problemCodeToConfigKeyMapping[problemCode]}`;
        const configValue = {
            "type": "string",
            "enum": [
                "Error",
                "Warning",
                "Information",
                "Hint",
                "None"
            ],
            "default": "Warning",
            "description": `The '${problemCode}' rule severity.`
        };

        config[configKey] = configValue;
    });

    return config;
};

function updatePackageJsonConfig() {   
    const packageJsonPath = path.join(__dirname, 'package.json');

    const packageJson = fs.readFileSync(packageJsonPath).toString();

    let packageJsonContent = JSON.parse(packageJson);

    const newConfiguration = {
        "type": "object",
        "title": "Example extension",
        "properties": {
            "example.enable": {
                "type": "boolean",
                "default": true,
                "description": "Enable/disable example linter."
            },
            ...generateConfigSection()
        }
    };
    
    packageJsonContent.contributes.configuration = newConfiguration;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 4));
}

updatePackageJsonConfig();
