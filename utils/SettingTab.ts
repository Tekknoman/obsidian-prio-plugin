import {App, Modal, Notice, PluginSettingTab, Setting, SliderComponent} from "obsidian";
import PrioPlugin from "../main";
import {Preset} from "./Presets";
import {PrioPluginSettings} from "./Settings";

export class SettingTab extends PluginSettingTab {
	plugin: PrioPlugin;
	saveConfirm: SaveConfirm;

	previousSettings: PrioPluginSettings;

	modified = false;

	constructor(app: App, plugin: PrioPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.saveConfirm = new SaveConfirm(this);
	}

	hide(): any {
		if (this.modified) {
			this.saveConfirm.open();
			return;
		}
		return super.hide();
	}

	display(): void {
		this.previousSettings = Object.assign({}, this.plugin.settings);
		const {containerEl} = this;
		this.plugin.registerDomEvent(document, 'change', () => {
			this.modified = true;
		});

		containerEl.empty();

		let presets: Preset[] = this.plugin.settings.presets ?? [];

		const saveButton = createEl('button', {text: 'Save', cls: ['mod-cta', 'mod-primary', 'btn']});


		containerEl.createEl('h2', {text: 'General Settings'});

		if (this.plugin.settings.presets) {
			const dropDownOptions: Record<string, string> = {'default': 'Default'};
			this.plugin.settings.presets.map(preset => {
				return dropDownOptions[preset.id] = preset.name;
			});
			new Setting(containerEl)
				.setName('Preset')
				.setDesc('Select a preset to use.')
				.addSearch((search) => {
					search
						.setPlaceholder('Search Presets')
						.onChange(async (value) => {
							presets = this.plugin.settings.presets?.filter(preset => preset.name.toLowerCase().includes(value.toLowerCase())) ?? [];
							presetList.empty()
							this.generatePresetList(presets, presetList);
						});
				});
		}

		const presetList = createEl('ol', {
			cls: 'preset-list',
			parent: containerEl
		});

		const levelSliderSetting = new Setting(containerEl);
		let levelSlider: SliderComponent;
		const levelText = createEl('input', {
			value: this.plugin.settings.levels.toString(),
			type: 'numeric',
			cls: 'level-text',
			parent: levelSliderSetting.settingEl,
			attr: {
				min: 1,
				max: 10,
				step: 1,
				type: 'number'
			}
		});

		levelText.addEventListener('change', (event) => {
			let value = parseInt((event.target as HTMLInputElement).value);
			if (value < 1) {
				value = 1;
			}
			if (value > 10) {
				value = 10;
			}
			levelSlider.setValue(value);
			this.plugin.settings.levels = value;
			this.generateLevelAliasList(this.plugin.settings, levelAliasesList, [saveButton]);
		});

		this.generatePresetList(presets, presetList);

		levelSliderSetting
			.setName('Levels')
			.setDesc('Set the count of priority levels to use.')
			.addSlider((slider) => {
				levelSlider = slider
				levelSlider
					.setLimits(1, 10, 1)
					.setValue(this.plugin.settings.levels)
					.onChange(async (value) => {
						this.plugin.settings.levels = value;
						levelText.value = value.toString();
						this.generateLevelAliasList(this.plugin.settings, levelAliasesList, [saveButton]);
					})
					.setDynamicTooltip()
			});

		new Setting(containerEl).setName('Level Aliases').setDesc('Set the aliases for each level.');

		const levelAliasesContainer = containerEl.createEl('div');

		const levelAliasesList = createEl('ol', {
			cls: 'level-aliases-list',
			parent: levelAliasesContainer
		});

		this.generateLevelAliasList(this.plugin.settings, levelAliasesList, [saveButton]);

		containerEl.append(saveButton);
		saveButton.addEventListener('click', () => {
			if (!this.isValid(levelAliasesList, [saveButton])) {
				return;
			}
			this.setAliases(this.plugin.settings, levelAliasesList);
			this.plugin.saveSettings().then(() => {
				this.plugin.loadSettings().then(() => {
					new Notice('Settings saved successfully!');
				});
			});
		});
	}

	setAliases = (settings: PrioPluginSettings, levelAliasesList: HTMLOListElement) => {
		const inputs = levelAliasesList.querySelectorAll('input');
		const aliases: string[] = [];
		inputs.forEach(input => {
			aliases.push((input as HTMLInputElement).value);
		});
		aliases.map((alias, index) => {
			this.plugin.settings.levelAliases[index] = alias;
		});
	}

	generateLevelAliasList = (settings: PrioPluginSettings, levelAliasesList: HTMLOListElement, buttons: HTMLButtonElement[]) => {
		levelAliasesList.empty();
		const els: HTMLElement[] = [];
		while (settings.levels > levelAliasesList.children.length) {
			const el = createEl('li', {
				text: `${levelAliasesList.children.length + 1}`,
				cls: 'level-aliases-list-item',
				parent: levelAliasesList
			});
			const input = el.createEl('input', {
				cls: 'level-aliases-list-item-input',
				value: settings.levelAliases[levelAliasesList.children.length - 1] ?? '',
			})
			input.addEventListener('blur', (event) => {
				const valid = this.validateLevelAlias((event.target as HTMLInputElement).value, parseInt((event.target as HTMLInputElement).parentElement?.textContent ?? '') - 1, settings.levelAliases.slice(0, settings.levels));
				for (const button of buttons) {
					button.disabled = !valid;
				}
			});
			els.push(el);
		}

		return els;
	}

	generatePresetList = (presets: Preset[], presetList: HTMLOListElement) => (presets || []).map(preset => {
		const el = createEl('li', {
			text: preset.name,
			cls: 'preset-list-item',
			parent: presetList
		});
		const btnGroup = el.createEl('div', {
			cls: 'btn-group'
		});

		btnGroup.createEl('button', {
			text: 'Apply',
			cls: ['preset-list-item-apply', 'btn', 'btn-primary'],
			attr: {
				'onclick': 'alert("Preset Selected")'
			}
		})
		btnGroup.createEl('button', {
			text: 'Overwrite',
			cls: ['preset-list-item-save', 'btn', 'btn-primary'],
			attr: {
				'onclick': 'alert("Save Preset")'
			}
		})
		return el;
	});

	isValid = (levelAliasesList: HTMLOListElement, buttons: HTMLButtonElement[]) => {
		const inputs = levelAliasesList.querySelectorAll('input');
		const aliases: string[] = [];
		inputs.forEach(input => {
			aliases.push((input as HTMLInputElement).value);
		});
		if (aliases.length !== new Set(aliases).size) {
			new Notice('Level aliases must be unique.');
			return false;
		}
		if (aliases.some(alias => alias.length === 0)) {
			new Notice('Level aliases must not be empty.');
			return false;
		}
		return true;
	}

	validateLevelAlias = (alias: string, index: number, aliases: string[]) => {
		if (aliases.indexOf(alias) != index && aliases.includes(alias)) {
			new Notice('Alias already exists!');
			return false;
		}
		if (alias.length < 1) {
			new Notice('Alias must be at least 1 character long!');
			return false;
		}
		if (alias.match(/[^a-zA-Z0-9]/)) {
			new Notice('Alias must only contain alphanumeric characters!');
			return false;
		}
		return true;
	}
}

class SaveConfirm extends Modal {
	private settingsTab: SettingTab;

	constructor(settingsTab: SettingTab) {
		super(settingsTab.app);
		this.settingsTab = settingsTab;
	}

	open() {
		super.open();
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('You have unsaved changes. Would you like to save them?');

		const btnGroup = contentEl.createEl('div', {
			cls: 'save-btn-group'
		});

		const saveButton = createEl('button', {
			text: 'Save',
			cls: ['btn', 'mod-cta'],
		});
		const discardButton = createEl('button', {
			text: 'Discard',
			cls: ['btn', 'mod-danger'],
		});

		saveButton.addEventListener('click', () => {
			this.settingsTab.plugin.saveSettings().then(() => {
				this.settingsTab.plugin.loadSettings().then(() => {
					new Notice('Settings saved successfully!');
				});
			});
			this.close();
		});

		discardButton.addEventListener('click', () => {
			this.settingsTab.plugin.loadSettings().then(() => {
				new Notice('Settings discarded successfully!');
			});
			this.close();
		});

		btnGroup.append(saveButton);
		btnGroup.append(discardButton);
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
