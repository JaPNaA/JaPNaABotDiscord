export default function removeFormattingChars(str: string): string {
    return str.replace(/(~~|\*\*|\*|__|_)(.+?)\1/g, (_f, formattingChar, content) => formattingChar === "~~" ? "" : content)
}
