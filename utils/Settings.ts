import {Preset} from "./Presets";

export interface PrioPluginSettings {
	levels: number;
	levelAliases: string[];
	presets?: Preset[];
}
