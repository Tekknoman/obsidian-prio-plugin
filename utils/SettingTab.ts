import {App, PluginSettingTab, Setting} from "obsidian";
import PrioPlugin from "../main";

export class SettingTab extends PluginSettingTab {
	plugin: PrioPlugin;

	constructor(app: App, plugin: PrioPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		let presets = this.plugin.settings.presets;

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
							presets = this.plugin.settings.presets?.filter(preset => preset.name.toLowerCase().includes(value.toLowerCase()));
						});
				});
		}
		const presetList = createEl('ol', {
			cls: 'preset-list',
			parent: containerEl
		});

		(presets || []).map(preset => {
			const el = createEl('li', {
				text: preset.name,
				cls: 'preset-list-item',
				parent: presetList
			});
			const btnGroup = el.createEl('div', {
				cls: 'btn-group'
			});

			btnGroup.createEl('button', {
				text: 'Select',
				cls: ['preset-list-item-select', 'btn', 'btn-primary'],
				attr: {
					'onclick': 'alert("Preset Selected")'
				}
			})
			btnGroup.createEl('button', {
				text: 'Save',
				cls: ['preset-list-item-save', 'btn', 'btn-primary'],
				attr: {
					'onclick': 'alert("Save Preset")'
				}
			})
			return el;
		})

	}
}
