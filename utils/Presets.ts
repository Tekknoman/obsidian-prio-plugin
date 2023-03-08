import {PrioPluginSettings} from "./Settings";

export interface Preset {
	id: string;
	name: string;
	settings: PrioPluginSettings;
}
