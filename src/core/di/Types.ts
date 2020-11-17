const TYPES_REPOSITORY = {
    NewsRepository: Symbol.for("NewsRepository")
}

const TYPES_USECASES = {
    GetNewsFeed: Symbol.for("GetNewsFeed"),
    GetFeedsGroupBySimilarity: Symbol.for("GetFeedsGroupBySimilarity"),
    ConvertNewsToFeFeed: Symbol.for("ConvertNewsToFeFeed"),
    ConvertNewsToFeShortFeed: Symbol.for("ConvertNewsToFeShortFeed"),
    ConvertNewsToFeFeeds: Symbol.for("ConvertNewsToFeFeeds"),
    ConvertNewsToFeShortFeeds: Symbol.for("ConvertNewsToFeShortFeeds"),
    GetAnalyzerList: Symbol.for("GetAnalyzerList"),

    GetNewsDetail: Symbol.for("GetNewsDetail")
}

export { TYPES_REPOSITORY, TYPES_USECASES }