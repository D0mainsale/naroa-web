# 📖 Notion CMS Integration Guide

## 🎯 Overview

This project uses **Notion as a headless CMS** to manage artwork data dynamically. Notion acts as the content database, and the website pulls data via API.

## 🏗️ Architecture

```
Notion Database (Source of Truth)
        ↓
scripts/fetch-notion.js (Build Time)
        ↓
data/notion-artworks.json (Static Cache)
        ↓
js/notion-cms.js (Frontend Loader)
        ↓
Portfolio & Bitácora Sections
```

## 📋 Notion Database Setup

### Required Properties

Your Notion database must have these properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| **Title** | Title | ✅ | Artwork title |
| **Description** | Rich Text | ✅ | Artwork description |
| **Medium** | Select | ✅ | Técnica mixta, Óleo, Acrílico, etc. |
| **Year** | Number | ✅ | Year created (e.g., 2024) |
| **Image** | Files | ✅ | Main artwork image |
| **Category** | Multi-select | ⚠️ | Portfolio, Bitácora, Featured |
| **Dimensions** | Text | ⚠️ | Size (e.g., "40×50 cm") |
| **Status** | Select | ⚠️ | Published, Draft, Archived |
| **Tags** | Multi-select | - | Free-form tags |
| **Album** | Relation | - | Link to album database |

**Legend:**
- ✅ Required (critical)
- ⚠️ Recommended (enhances UX)
- - Optional (nice to have)

### Example Notion Entry

```
Title: "Fragmentación íntima"
Description: Una exploración de la identidad a través de fragmentos visuales...
Medium: Técnica mixta
Year: 2024
Image: [uploaded file]
Category: Portfolio, Featured
Dimensions: 40×50 cm
Status: Published
Tags: Retrato, Introspección
```

## 🔑 Environment Setup

### 1. Get Notion API Credentials

1. Go to https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Name: `naroa-web`
4. Select your workspace
5. Copy the **Internal Integration Token**

### 2. Get Database ID

1. Open your Notion database
2. Click **"Share"** → **"Invite"** → Add your integration
3. Copy database ID from URL:
   ```
   https://notion.so/<workspace>/<DATABASE_ID>?v=...
                                  ↑ This part
   ```

### 3. Configure Environment

Create `.env` file (DON'T commit this!):

```bash
# Notion API Configuration
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🚀 Usage

### Fetch Data from Notion

```bash
# Install dependencies first
npm install

# Fetch artworks from Notion
node scripts/fetch-notion.js
```

This creates `data/notion-artworks.json` with cached artwork data.

### Automated Deployment

The deploy script automatically fetches fresh data:

```bash
./scripts/deploy.sh "Your commit message"
```

This script:
1. ✅ Fetches latest from Notion
2. ✅ Regenerates image index
3. ✅ Commits all changes
4. ✅ Pushes to Vercel

## 📁 File Structure

```
naroa-web/
├── scripts/
│   ├── fetch-notion.js       # Notion API fetcher
│   └── deploy.sh             # Automated deploy (includes Notion fetch)
├── js/
│   └── notion-cms.js         # Frontend loader & renderer
├── data/
│   └── notion-artworks.json  # Cached Notion data (auto-generated)
├── .env                      # API credentials (DO NOT COMMIT)
└── .env.example              # Template for credentials
```

## 🎨 Frontend Integration

The Notion CMS automatically populates:

### Portfolio Section
- Filters artworks with `Category: Portfolio`
- Displays in grid with premium animations
- Links to detail view

### Bitácora Section
- Filters artworks with `Category: Bitácora`
- Chronological timeline layout
- Editorial-style presentation

### Usage in HTML

```html
<!-- Portfolio section (auto-populated) -->
<section id="portfolio-section">
  <!-- Notion CMS populates this -->
</section>

<!-- Bitácora section (auto-populated) -->
<section id="bitacora-section">
  <!-- Notion CMS populates this -->
</section>
```

## 🔄 Workflow

### Adding New Artwork

1. **In Notion:**
   - Add new page to database
   - Fill required properties
   - Upload image
   - Set `Status: Published`
   - Add to `Category: Portfolio` or `Bitácora`

2. **Deploy:**
   ```bash
   ./scripts/deploy.sh "Add new artwork: Title"
   ```

3. **Live in ~2 min** on https://naroa.online

### Updating Artwork

1. Edit in Notion
2. Run deploy script
3. Changes appear live

## 🛡️ Security Best Practices

### ✅ DO:
- Keep `.env` in `.gitignore`
- Use environment variables in Vercel
- Rotate API tokens periodically
- Set integration permissions to "Read content only"

### ❌ DON'T:
- Commit `.env` to git
- Share API tokens publicly
- Use production tokens in development
- Grant unnecessary permissions

## 🔧 Troubleshooting

### Error: "Notion API returned 401"
**Cause:** Invalid or expired token  
**Fix:** Regenerate token in Notion integrations

### Error: "Database not found"
**Cause:** Integration not invited to database  
**Fix:** Share database with integration

### Error: "Missing required property"
**Cause:** Database schema incomplete  
**Fix:** Add required columns (Title, Description, Medium, Year, Image)

### Empty data/notion-artworks.json
**Cause:** No published artworks or filter mismatch  
**Fix:** Check `Status: Published` and `Category` values

## 📊 Data Schema

### JSON Output (`data/notion-artworks.json`)

```json
{
  "artworks": [
    {
      "id": "notion-page-id",
      "title": "Artwork Title",
      "description": "Full description text",
      "medium": "Técnica mixta",
      "year": 2024,
      "imageUrl": "https://s3.amazonaws.com/...",
      "category": ["Portfolio", "Featured"],
      "dimensions": "40×50 cm",
      "status": "Published",
      "tags": ["Retrato", "Introspección"],
      "createdTime": "2024-01-15T10:30:00.000Z",
      "lastEditedTime": "2024-01-20T15:45:00.000Z"
    }
  ],
  "metadata": {
    "fetchedAt": "2024-01-21T16:20:00.000Z",
    "totalCount": 42,
    "source": "notion"
  }
}
```

## 🎯 Next Steps

1. ✅ Set up Notion database with required properties
2. ✅ Create integration and get API token
3. ✅ Configure `.env` with credentials
4. ✅ Run `node scripts/fetch-notion.js` to test
5. ✅ Use `./scripts/deploy.sh` for deployments
6. ✅ Add artworks in Notion, deploy automatically

## 🔗 Resources

- [Notion API Documentation](https://developers.notion.com/)
- [Database Integration Guide](https://developers.notion.com/docs/working-with-databases)
- [API Reference](https://developers.notion.com/reference/intro)

---

**Questions?** Check the troubleshooting section or review `scripts/fetch-notion.js` for implementation details.
