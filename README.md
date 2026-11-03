# Jawai Leopard Safari

## Run locally

1. Install dependencies with `npm install`.
2. Add a `.env` file in the project root with your MongoDB connection string:

   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```

3. Start the website and review API with `npm start`.
4. Open `http://localhost:5000`.

## SEO and production domain

The server serves `/robots.txt` and `/sitemap.xml`, and fills canonical and social URLs from the request host. Before deploying, set `SITE_URL` to the website's public HTTPS origin (for example, `https://www.example.com`) so search engines receive the correct canonical URLs, sitemap links and structured data. Add the sitemap URL to Google Search Console after deployment. Search ranking and indexing are decided by Google and are not guaranteed by metadata alone.

The review API is available at `/api/reviews`. Check `/api/health` to see whether MongoDB is connected.

Shared site styling lives in `style.css`; review cards, the reviews page and its form live in `reviews.css`. Both stylesheets are loaded by the homepage and reviews page.

## Deploying the frontend and API separately

Set the `review-api-url` meta tag in both `index.html` and `reviews.html` to the full review endpoint, for example:

```html
<meta name="review-api-url" content="https://api.example.com/api/reviews" />
```

Set `CORS_ORIGINS` on the API server to the exact website origin or comma-separated origins, such as `https://example.com,https://www.example.com`.
