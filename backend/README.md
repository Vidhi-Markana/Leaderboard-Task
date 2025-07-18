# Backend Setup & Deployment

## 1. Environment Variables
- Copy `.env.example` to `.env` and fill in your MongoDB Atlas connection string.

## 2. Install Dependencies
```
   npm install
   ```

## 3. Run Locally
```
   npm start
   ```

## 4. Deploying (Render/Railway/Heroku)
- Deploy the backend folder to your Node.js hosting provider.
- Set the `MONGODB_URI` environment variable in your host's dashboard.

## 5. File Structure
```
backend/
  index.js
  models/
    User.js
    ClaimHistory.js
  package.json
  .env.example
  README.md
``` 