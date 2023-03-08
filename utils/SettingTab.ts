import {App, PluginSettingTab, Setting, SliderComponent} from "obsidian";
import PrioPlugin from "../main";
import {Preset} from "./Presets";

export class SettingTab extends PluginSettingTab {
	plugin: PrioPlugin;

	constructor(app: App, plugin: PrioPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		let presets: Preset[] = this.plugin.settings.presets ?? [];


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
					})
					.setDynamicTooltip()
			})

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
	});
}
