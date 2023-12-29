const { addonBuilder } = require("stremio-addon-sdk");

const RADIO_DATA = [
    {
        "genres": ["Maine News", "Weather"],
        "id": "MaineLocalNews-89960945772534639607784459421582",
        "name": "WMTW Channel 8",
        "poster": "https://kubrick.htvapps.com/htv-prod-media.s3.amazonaws.com/htv_default_image/wmtw/top_image.png?resize=1200:*",
        "url": "https://content-ausw1.uplynk.com/channel/49ca8e65999642478f0d7dcecc0e6753/d.m3u8?gamstreamid=849d547d-1909-4966-ad1f-fa44c981abf2:CHS&ad=wmtw_vmp_gam&boundary.adx=replace_as_ad&pbs=fb99ae9f4217466b81d4473d7a75c35e"
    },
    {
        "genres": ["Maine News", "Weather", "Traffic", "Sports", "Other Topics"],
        "id": "MaineLocalNews-75582199619481153474745930391197",
        "name": "News Center Maine",
        "poster": "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fcontent.wcsh6.com%2Fphoto%2F2018%2F01%2F04%2FYouTube_2560x1440_NCM_1515107231609_12174744_ver1.0.png&f=1&nofb=1&ipt=2474af7277f4158556a534d6e0c11de458e590cd9b5434d104da48e760935028&ipo=images",
        "url": "https://livevideo.tegnadigital.com/ncm/v1/manifest/f9c1bf9ffd6ac86b6173a7c169ff6e3f4efbd693/NCM/a595239c-9012-418a-9a66-ff89546fcb2b/0.m3u8"
    }
];

const getStreams = () => {
    const streams = {};
    RADIO_DATA.forEach(entry => {
        streams[entry["id"]] = {
            'title': `Watch ${entry["name"]} Live`,
            'url': entry["url"],
        };
    });
    return streams;
};

const getCatalog = () => {
    const catalog = RADIO_DATA.map(entry => ({
        "id": entry["id"],
        "name": entry["name"],
        "genres": entry["genres"],
        "poster": entry["poster"],
    }));
    return catalog;
};

const getGenres = () => {
    const genres = new Set();
    RADIO_DATA.forEach(item => {
        item["genres"].forEach(genre => genres.add(genre));
    });
    return [...genres];
};

const manifest = {
    "id": "com.mixtape.mainelocalnews",
    "version": "1.0.1",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Flag_of_the_State_of_Maine.svg/761px-Flag_of_the_State_of_Maine.svg.png",
    "name": "Maine Local News",
    "description": "Stremio Add-On to Watch Maine Local News Stations",
    "types": ["Local News"],
    "catalogs": [
        {
            "type": "Local News",
            "id": "MaineLocalNews",
            "name": "Maine Local News",
            "extra": [{ "genres": getGenres() }]
        }
    ],
    "resources": [
        "catalog",
        "meta",
        "stream"
    ],
    "idPrefixes": [""]
};


const builder = new addonBuilder(manifest);

builder.defineCatalogHandler((args) => {
    return new Promise((resolve, reject) => {
        try {
            const searchQuery = args.extra && args.extra.search ? args.extra.search.toLowerCase() : '';
            const catalog = getCatalog().filter(item => item.name.toLowerCase().includes(searchQuery));

            const metaPreviews = {
                'metas': catalog.map(item => ({
                    'id': item['id'],
                    'type': "Local News",
                    'name': item['name'],
                    'genres': item["genres"],
                    'poster': item["poster"],
                    'description': "",
                }))
            };
            resolve(metaPreviews);
        } catch (error) {
            console.error("Error in defineCatalogHandler:", error);
            reject(error);
        }
    });
});

builder.defineMetaHandler((args) => {
    return new Promise((resolve, reject) => {
        try {
            const mkItem = item => ({
                'id': item['id'],
                'type': "Local News",
                'name': item['name'],
                'genres': item['genres'],
                'poster': item["poster"],
                'background': item["poster"],
                'posterShape': "square",
            });

            const meta = {
                'meta': mkItem(getCatalog().find(item => item['id'] === args.id)),
            };
            resolve(meta);
        } catch (error) {
            console.error("Error in defineMetaHandler:", error);
            reject(error);
        }
    });
});

builder.defineStreamHandler((args) => {
    return new Promise((resolve, reject) => {
        try {
            const streams = { 'streams': [] };
            if (args.id in getStreams()) {
                streams['streams'].push(getStreams()[args.id]);
            }
            resolve(streams);
        } catch (error) {
            console.error("Error in defineStreamHandler:", error);
            reject(error);
        }
    });
});

module.exports = builder.getInterface();