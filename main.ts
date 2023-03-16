import {Editor, MarkdownView, Plugin} from 'obsidian';
import {PrioPluginSettings} from "./utils/Settings";
import {SettingTab} from "./utils/SettingTab";
import {decreasePrio, increasePrio, removePrio, setPrio} from "./utils/Priority";


const DEFAULT_SETTINGS: PrioPluginSettings = {
	levels: 6,
	levelAliases: [
		'Major',
		'Minor',
		'Trivial',
		'Cosmetic',
		'Enhancement',
		'Bug'
	],
	presets: [{
		id: 'default',
		name: 'Default',
		settings: {
			levels: 6,
			levelAliases: [
				'Major',
				'Minor',
				'Trivial',
				'Cosmetic',
				'Enhancement',
				'Bug'
			],
		}
	}]
}

export default class PrioPlugin extends Plugin {
	settings: PrioPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'set-prio',
			name: 'Set priority',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				setPrio(editor, view, this.settings);
			}
		});

		this.addCommand({
			id: 'remove-prio',
			name: 'Remove priority',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				removePrio(editor, view, this.settings);
			}
		})

		this.addCommand({
			id: 'increase-prio',
			name: 'Increase priority',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				increasePrio(editor, view, this.settings);
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'decrease-prio',
			name: 'Decrease priority',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				decreasePrio(editor, view, this.settings);
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


