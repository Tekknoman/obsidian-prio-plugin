# Prioritize Plugin

The Prioritize plugin for Obsidian allows you to easily mark notes or tasks with a priority level. You can configure the number of priority levels and their names, and switch between different presets or create your own presets.

## Installation

You can install the Prioritize plugin via the Community Plugin Browser in Obsidian, or you can build it directly from the GitHub repository: https://github.com/EloiMusk/obsidian-prio-plugin

### From source

- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

### Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Usage

After installing and configuring the plugin, you can prioritize notes or tasks by selecting the text you want to prioritize and choosing from different priority levels. You can configure the number of levels and assign a name for each level of priority in the plugin settings. Once you have set your preferences, you can easily switch between different presets or create your own.

Here is a list of all the available actions:

- `Set Priority`: Mark selected text with a priority level.
- `Remove Priority`: Remove a previously set priority level.
- `Increase Priority`: Increase the priority level of selected text.
- `Decrease Priority`: Decrease the priority level of selected text.

To use these actions, you can either access them from the Command Palette or create a hotkey for each action.

### Configuration

In the settings tab, you can configure the Prioritize plugin to your liking. This includes setting the number of levels of priority and assigning a name for each level. To save your configuration, you need to click the `Save` button.

There are also presets available in the plugin. To create a new preset, configure the plugin as you like and then click the `Add Preset` button. This will open a window where you can enter a unique name for the preset. Once you have named the preset, it will be saved as a new preset. Remember to save the settings afterward to keep your new preset.

To apply a preset, click the `Apply` button on the preset you want to use. This will overwrite the current settings with the preset. If you want to overwrite a preset, you can do so by pressing the `Overwrite` button. This will overwrite the preset with the current configuration.

If you want to delete a preset, simply press the `Delete` button.

## Contributing

If you'd like to contribute to the Prioritize plugin, please fork the GitHub repository and submit a pull request.

## License

The Prioritize plugin is released under the GNU License.

## Improve code quality with eslint (optional)

- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code. 
- To use eslint with this project, make sure to install eslint from terminal:
  - `npm install -g eslint`
- To use eslint to analyze this project use this command:
  - `eslint main.ts`
  - eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:
  - `eslint .\src\`

## API Documentation

See https://github.com/obsidianmd/obsidian-api
