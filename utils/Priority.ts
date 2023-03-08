import {Editor, MarkdownView} from "obsidian";
import {PrioPluginSettings} from "./Settings";

export const setPrio = (editor: Editor, view: MarkdownView, settings: PrioPluginSettings) => {
	if (getPrio(editor, view, settings)) {
		return;
	}
	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);
	const levels = settings.levels;
	const levelAliases = settings.levelAliases;
	const level = levels[Math.round((levels.length - 1) / 2)];
	const levelAlias = levelAliases[level];
	const newLine = `${line} #${levelAlias}`;
	editor.replaceRange(newLine, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
	view.editor.focus();
}

export const increasePrio = (editor: Editor, view: MarkdownView, settings: PrioPluginSettings) => {
	const currentPrio = getPrio(editor, view, settings);
	if (!currentPrio) {
		setPrio(editor, view, settings);
		return;
	}
	const currentLevelIndex = getLevelIndex(editor, view, settings, currentPrio);
	replacePrio(editor, view, settings, currentLevelIndex - 1 < 0 ? 0 : currentLevelIndex - 1);

}

export const decreasePrio = (editor: Editor, view: MarkdownView, settings: PrioPluginSettings) => {
	const currentPrio = getPrio(editor, view, settings);
	if (!currentPrio) {
		setPrio(editor, view, settings);
		return;
	}
	const currentLevelIndex = getLevelIndex(editor, view, settings, currentPrio);
	const levels = settings.levels;
	replacePrio(editor, view, settings, currentLevelIndex + 1 > levels.length - 1 ? levels.length - 1 : currentLevelIndex + 1);
}

export const removePrio = (editor: Editor, view: MarkdownView, settings: PrioPluginSettings) => {
	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);
	const newLine = line.replace(`#${getPrio(editor, view, settings)}`, '');
	editor.replaceRange(newLine, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
	view.editor.focus();
}

export const getLevelIndex = (editor: Editor, view: MarkdownView, settings: PrioPluginSettings, prio: string) => {
	const levels = settings.levels;
	const levelAliases = settings.levelAliases;
	const currentLevel = levels.find(level => levelAliases[level] === prio);
	return levels.indexOf(currentLevel as string);
}

export const replacePrio = (editor: Editor, view: MarkdownView, settings: PrioPluginSettings, levelIndex: number) => {
	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);
	const levels = settings.levels;
	const levelAliases = settings.levelAliases;
	const level = levels[levelIndex];
	const levelAlias = levelAliases[level];
	const newLine = line.replace(`#${getPrio(editor, view, settings)}`, `#${levelAlias}`);
	editor.replaceRange(newLine, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
	view.editor.focus();
}

export const getPrio = (editor: Editor, view: MarkdownView, settings: PrioPluginSettings) => {
	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);
	return line.match(/#\w+/g)?.filter(tag =>
		Object.values(settings.levelAliases).includes(tag.replace('#', ''))
	).first()?.replace('#', '');
}
