export class ContentItem {
    /**
     * @param {string} slug 
     * @param {string} contentType 
     * @param {string} title 
     * @param {string} poster 
     * @param {number} totalEpisodes 
     */
    constructor(slug, contentType, title, poster, totalEpisodes) {
        this.slug = slug;
        this.contentType = contentType;
        this.title = title;
        this.poster = poster;
        this.totalEpisodes = totalEpisodes;
    }
}

export class ContentDetail extends ContentItem {
    /**
     * @param {string} slug 
     * @param {string} contentType 
     * @param {string} title 
     * @param {string} poster 
     * @param {number} totalEpisodes 
     * @param {Object} details 
     */
    constructor(slug, contentType, title, poster, totalEpisodes, details) {
        super(slug, contentType, title, poster, totalEpisodes);
        this.details = details;
    }
}
