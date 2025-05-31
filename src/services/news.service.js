import axios  from "axios";

const BASE_URL = 'https://eventregistry.org/api/v1/article/getArticles';

// fetchNewsByTopic is not a function when imported in user.controller.js
// update code to avoid this error

// Instead of default export with an object, use named export
export default async function fetchNewsByTopic(topic,postCount=1) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        "action": "getArticles",
        "keyword": topic,
        "articlesPage": 1,
        "articlesCount": postCount,
        "articlesSortBy": "date",
        "articlesSortByAsc": false,
        "dataType": [
          "news"
        ],
        "forceMaxDataTimeWindow": 7,
        "resultType": "articles",
        lang: 'eng', 
        apiKey: process.env.NEWS_API_KEY
      },
    });
    const articles = response.data.articles.results.filter(article => article.lang === 'eng').map(article => ({
      title: article.title,
      content: article.body,
      lang:article.lang
    }));
    
    return articles;
  } catch (error) {
    console.error('Error fetching news:', error.message);
    return [];
  }
}
// const fetchNewsByTopic =  async function(topic) {
//   try {
//     const response = await axios.get(BASE_URL, {
//       params: {
//         "action": "getArticles",
//         "keyword": topic,
//         "articlesPage": 1,
//         "articlesCount": 5,
//         "articlesSortBy": "date",
//         "articlesSortByAsc": false,
//         "dataType": [
//                 "news"
//             ],
//         "forceMaxDataTimeWindow": 7,
//         "resultType": "articles",
//         lang: 'eng', 
//         apiKey: process.env.NEWS_API_KEY
//       },
//     });
//     const articles = response.data.articles.results.filter(article => article.lang === 'eng').map(article => ({
//       title: article.title,
//       content: article.body,
//       lang:article.lang
//     }));

//     return articles;
//   } catch (error) {
//     console.error('Error fetching news:', error.message);
//     return [];
//   }
// }

// export default  { fetchNewsByTopic };
