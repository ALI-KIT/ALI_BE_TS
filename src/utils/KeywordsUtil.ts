export class KeywordsUtil {
    public static buildRegexString(keywords: string[]): string {
        keywords = keywords.map (keyword => {
            return keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        })

        const regexString = "(?i)(" + keywords.join("|") + ")";
        return regexString;
    }
}