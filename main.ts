import {App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {PrioPluginSettings} from "./utils/Settings";
import {SettingTab} from "./utils/SettingTab";
import {decreasePrio, increasePrio, removePrio, setPrio} from "./utils/Priority";


const DEFAULT_SETTINGS: PrioPluginSettings = {
	selectedPreset: 'default',
	levels: ['1', '2', '3', '4', '5', '6'],
	levelAliases: {
		'1': 'Major',
		'2': 'Minor',
		'3': 'Trivial',
		'4': 'Cosmetic',
		'5': 'Enhancement',
		'6': 'Bug'
	},
	presets: [{
		id: 'default',
		name: 'Default',
		settings: {
			levels: ['1', '2', '3', '4', '5', '6'],
			levelAliases: {
				'1': 'Major',
				'2': 'Minor',
				'3': 'Trivial',
				'4': 'Cosmetic',
				'5': 'Enhancement',
				'6': 'Bug'
			},
		}
	}]
}

export default class PrioPlugin extends Plugin {
	settings: PrioPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');


		this.addCommand({
			id: 'set-prio',
			name: 'Set priority',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				setPrio(editor, view, this.settings);
			},
			hotkeys: [
				{
					modifiers: ['Ctrl', 'Shift', 'Alt'],
					key: 'p',
				}
			]
		});

		this.addCommand({
			id: 'remove-prio',
			name: 'Remove priority',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				removePrio(editor, view, this.settings);
			},
			hotkeys: [
				{
					modifiers: ['Ctrl', 'Shift', 'Alt'],
					key: 'd',
				}
			]
		})

		this.addCommand({
			id: 'increase-prio',
			name: 'Increase priority',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				increasePrio(editor, view, this.settings);
			},
			hotkeys: [
				{
					modifiers: ['Ctrl', 'Shift', 'Alt'],
					key: 'ArrowUp',
				}
			]
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'decrease-prio',
			name: 'Decrease priority',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				decreasePrio(editor, view, this.settings);
			},
			hotkeys: [
				{
					modifiers: ['Ctrl', 'Shift', 'Alt'],
					key: 'ArrowDown',
				}
			]
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}


