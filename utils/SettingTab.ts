import {App, Modal, Notice, PluginSettingTab, Setting, SliderComponent} from "obsidian";
import PrioPlugin from "../main";
import {Preset} from "./Presets";
import {PrioPluginSettings} from "./Settings";

export class SettingTab extends PluginSettingTab {
	plugin: PrioPlugin;
	saveConfirm: SaveConfirm;
	addPresetModal: AddPresetModal;
	modified = false;

	constructor(app: App, plugin: PrioPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.saveConfirm = new SaveConfirm(this);
		this.addPresetModal = new AddPresetModal(this);
	}

	hide() {
		if (this.modified) {
			this.saveConfirm.setSettingsTab(this);
			this.saveConfirm.open();
			return;
		}
		return super.hide();
	}

	display(): void {
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

		const presetListContainer = createEl('div', {
			cls: 'preset-list-container',
			parent: containerEl
		})

		const presetList = createEl('ol', {
			cls: 'preset-list',
			parent: presetListContainer
		});

		const addPresetButton = createEl('button', {
			text: 'Add Preset',
			cls: ['mod-cta', 'mod-primary', 'btn'],
			parent: presetListContainer
		});

		addPresetButton.addEventListener('click', () => {
			this.addPresetModal.setPresetsList(presetList);
			this.addPresetModal.open();
		});

		this.generatePresetList(presets, presetList);

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
		saveButton.addEventListener('click', async () => {
			if (!this.isValid(levelAliasesList)) {
				return;
			}
			this.setAliases(this.plugin.settings, levelAliasesList);
			await this.plugin.saveSettings();
			await this.plugin.loadSettings();
			new Notice('Settings saved successfully!');
			this.modified = false;
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
				if (valid) {
					this.plugin.settings.levelAliases[parseInt((event.target as HTMLInputElement).parentElement?.textContent ?? '') - 1] = (event.target as HTMLInputElement).value;
				}
				for (const button of buttons) {
					button.disabled = !valid;
				}
			});
			els.push(el);
		}

		return els;
	}

	generatePresetId = () => {
		return Date.now().toString(36) + Math.random().toString(36);
	}

	addPreset = async (name: string, settings: PrioPluginSettings, presetList: HTMLOListElement) => {
		if (!name || !settings || !this.presetIsValid(name, settings.presets ?? [], this.plugin.settings.presets?.length ?? 0 - 1)) {
			return;
		}

		if (this.plugin.settings.presets) {
			this.plugin.settings.presets.push({
				id: `${this.generatePresetId()}`,
				name,
				settings: {
					levels: this.plugin.settings.levels,
					levelAliases: this.plugin.settings.levelAliases.slice(0, this.plugin.settings.levels),
				}
			});
		} else {
			this.plugin.settings.presets = [{
				id: `${this.generatePresetId()}`,
				name,
				settings: {
					levels: this.plugin.settings.levels,
					levelAliases: this.plugin.settings.levelAliases.slice(0, this.plugin.settings.levels),
				}
			}];
		}
		this.generatePresetList(this.plugin.settings.presets, presetList);
		await this.plugin.saveSettings()
		await this.plugin.loadSettings()
		new Notice('Preset applied successfully!');

		this.display();
	}

	applyPreset = (preset: Preset, presetList: HTMLOListElement) => {
		if (!preset || !presetList) {
			return;
		}
		if (this.plugin.settings.presets) {
			this.plugin.settings.levels = preset.settings.levels.valueOf();
			this.plugin.settings.levelAliases = [...preset.settings.levelAliases];
		}
		this.generatePresetList(this.plugin.settings.presets ?? [], presetList);
		this.display();
		new Notice('Preset applied successfully!');
	}

	deletePreset = (preset: Preset, presetList: HTMLOListElement) => {
		if (this.plugin.settings.presets) {
			this.plugin.settings.presets.remove(preset);
		}
		this.generatePresetList(this.plugin.settings.presets ?? [], presetList);
		this.display();
		new Notice('Preset deleted successfully!');
	}

	overwritePreset = (preset: Preset, presetList: HTMLOListElement) => {
		if (!preset || !presetList) {
			return;
		}
		if (this.plugin.settings.presets) {
			this.plugin.settings.presets[this.plugin.settings.presets.indexOf(preset)].settings.levels = this.plugin.settings.levels.valueOf();
			this.plugin.settings.presets[this.plugin.settings.presets.indexOf(preset)].settings.levelAliases = [...this.plugin.settings.levelAliases];
		}
		this.generatePresetList(this.plugin.settings.presets ?? [], presetList);
		this.display();
		new Notice('Preset overwritten successfully!');
	}

	generatePresetList = (presets: Preset[], presetList: HTMLOListElement) => {
		presetList.empty();
		(presets || []).map(preset => {
			const el = createEl('li', {
				cls: 'preset-list-item',
				parent: presetList
			});

			const presetListInput = el.createEl('input', {
				cls: 'preset-list-item-input',
				value: preset.name
			});

			presetListInput.addEventListener('change', (event) => {
				if (
					presets &&
					presets.length >= presetList.children.length - 1 &&
					(event.target as HTMLInputElement).parentElement &&
					this.presetIsValid(
						(event.target as HTMLInputElement).value,
						presets,
						((event.target as HTMLInputElement).parentElement as HTMLElement).indexOf((event.target as HTMLInputElement)))) {
					presets[presetList.children.length - 1].name = (event.target as HTMLInputElement).value;
				}
			});

			const btnGroup = el.createEl('div', {
				cls: 'btn-group'
			});

			const applyButton = btnGroup.createEl('button', {
				text: 'Apply',
				cls: ['preset-list-item-apply', 'btn', 'btn-primary'],
			})
			const overwriteButton = btnGroup.createEl('button', {
				text: 'Overwrite',
				cls: ['preset-list-item-overwrite', 'btn', 'btn-primary'],
			})
			const deleteButton = btnGroup.createEl('button', {
				text: 'Delete',
				cls: ['preset-list-item-delete', 'btn', 'mod-danger'],
			})

			applyButton.addEventListener('click', () => {
				this.applyPreset(preset, presetList);
			});
			overwriteButton.addEventListener('click', () => {
				this.overwritePreset(preset, presetList);
			});
			deleteButton.addEventListener('click', () => {
				this.deletePreset(preset, presetList);
			});

			return el;
		});
	}


	isValid = (levelAliasesList: HTMLOListElement) => {
		const inputs = levelAliasesList.querySelectorAll('input');
		const aliases: string[] = [];
		inputs.forEach(input => {
			aliases.push((input as HTMLInputElement).value);
		});
		inputs.forEach(input => {
			if (!this.validateLevelAlias((input as HTMLInputElement).value, aliases.indexOf((input as HTMLInputElement).value), aliases)) {
				return false;
			}
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

	presetIsValid = (preset: string, presets: Preset[], index: number) => {
		if (preset.length < 1) {
			new Notice('Preset name must be at least 1 character long!');
			return false;
		}
		if (preset.match(/[^a-zA-Z0-9]/)) {
			new Notice('Preset name must only contain alphanumeric characters!');
			return false;
		}
		const searchPreset = presets.find(p => p.name === preset);
		if (searchPreset && presets.indexOf(searchPreset) !== index && presets.some(p => p.name === preset)) {
			new Notice('Preset name already exists!');
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

	setSettingsTab(settingsTab: SettingTab) {
		this.settingsTab = settingsTab;
	}

	open() {
		super.open();
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.classList.add('save-confirm-modal');

		contentEl.createEl('h2', {
			text: 'Unsaved Changes',
			cls: 'save-confirm-title'
		});

		contentEl.createEl('p', {
			text: 'You have unsaved changes. Would you like to save them?',
			cls: 'save-confirm-text'
		})

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

		saveButton.addEventListener('click', async () => {
			await this.settingsTab.plugin.saveSettings()
			await this.settingsTab.plugin.loadSettings()
			new Notice('Settings saved successfully!');
			this.close();
		});

		discardButton.addEventListener('click', async () => {
			await this.settingsTab.plugin.loadSettings()
			new Notice('Settings discarded successfully!');
			this.close();
		});

		btnGroup.append(saveButton);
		btnGroup.append(discardButton);
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
		this.settingsTab.modified = false;
	}
}

class AddPresetModal extends Modal {
	private settingsTab: SettingTab;
	private presetsList: HTMLOListElement;

	constructor(settingsTab: SettingTab) {
		super(settingsTab.app);
		this.settingsTab = settingsTab;
	}

	setPresetsList(presetsList: HTMLOListElement) {
		this.presetsList = presetsList;
	}

	open() {
		super.open();
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.classList.add('preset-modal');
		contentEl.createEl('h2', {
			text: 'Add Preset',
			cls: 'preset-modal-title'
		})
		let presetName = '';

		const presetNameInput = contentEl.createEl('input', {
			cls: 'preset-input',
			placeholder: 'Preset Name'
		});
		presetNameInput.addEventListener('input', () => {
			if (presetNameInput.value.length > 0) {
				presetNameInput.classList.remove('invalid');
				presetName = presetNameInput.value;
			} else {
				presetNameInput.classList.add('invalid');
			}
		});

		const btnGroup = contentEl.createEl('div', {
			cls: 'preset-save-btn-group'
		});

		const addButton = createEl('button', {
			text: 'Add',
			cls: ['btn', 'mod-cta'],
		});
		const cancelButton = createEl('button', {
			text: 'Cancel',
			cls: ['btn'],
		});

		addButton.addEventListener('click', async () => {
			await this.settingsTab.addPreset(presetName, this.settingsTab.plugin.settings, this.presetsList);
			this.close();
		});

		cancelButton.addEventListener('click', () => {
			this.close();
		});

		btnGroup.append(addButton);
		btnGroup.append(cancelButton);
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
