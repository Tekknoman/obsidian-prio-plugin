import {Preset} from "./Presets";

export interface PrioPluginSettings {
	selectedPreset?: string;
	levels: number;
	levelAliases: string[];
	presets?: Preset[];
}
