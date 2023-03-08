import {Preset} from "./Presets";

export interface PrioPluginSettings {
	selectedPreset?: string;
	levels: string[];
	levelAliases: Record<string, string>;
	presets?: Preset[];
}
