import { Editor } from "codemirror";
import { allowBreakMark } from "./utils";

export class WidgetCreator {
  editor: Editor;
  line: LineHandle;
  lineNo: number;

  constructor(editor, line) {
    this.editor = editor;
    this.line = line;
    this.lineNo = line.lineNo();
  }

  createWidget({ regex, matchMany, allowBreak, breakOffset }, createElement) {
    if (matchMany) {
      this.createMatchManyWidget(regex, allowBreak, breakOffset, createElement);
    }
  }

  createMatchManyWidget(regex, allowBreak, breakOffset, createElement) {
    const doc = this.editor.getDoc();
    const cursor = doc.getCursor();
    const line = this.line;
    const lineNo = line.lineNo();
    if (!line.text.match(regex)) {
      return;
    }
    let match = null;
    while ((match = regex.exec(line.text))) {
      if (
        match &&
        (cursor.ch < match.index ||
          cursor.ch > match.index + match[0].length ||
          cursor.line !== lineNo)
      ) {
        const range = {
          from: match.index,
          to: match.index + match[0].length
        };
        const element: HTMLElement = createElement(match);
        if (allowBreak) {
          allowBreakMark(this.editor, lineNo, range, element, breakOffset);
        }
        doc.markText(
          { line: lineNo, ch: range.from },
          { line: lineNo, ch: range.to },
          { replacedWith: element, clearOnEnter: true }
        );
      }
    }
  }
}