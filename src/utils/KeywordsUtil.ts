export class KeywordsUtil {
    public static buildRegexString(keywords: string[]): string {
        keywords = keywords.map (keyword => {
            return keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        })

        const regexString = "(?i)[^a-zA-Z](" + keywords.join("|") + ")[^a-zA-Z]";
        return regexString;
    }
}