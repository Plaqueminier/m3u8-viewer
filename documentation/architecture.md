# M3U8 Viewer Architecture

## Database Architecture

### SQLite Database

The application uses SQLite with better-sqlite3 for efficient, file-based data storage. The database is configured to use WAL (Write-Ahead Logging) mode for better concurrent access and performance.

#### Videos Table Schema

```sql
CREATE TABLE videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,           -- Model/username
  key TEXT NOT NULL UNIQUE,     -- Full path in R2 bucket
  size INTEGER NOT NULL,        -- File size in bytes
  lastModified INTEGER NOT NULL,-- Timestamp of last modification
  favorite BOOLEAN DEFAULT 0,   -- Whether video is favorited (stored as 0/1)
  prediction TEXT DEFAULT '0',  -- Binary string of predictions (100 chars)
  seen DATETIME,               -- When the video was last watched
)
```

Indexes:

- `key` (UNIQUE): For fast lookups by video path
- `prediction`: For efficient quality-based sorting
- `name`: For quick model/username filtering
- `lastModified`: For date-based sorting

### Database Connection Management

The application uses a singleton pattern for database connections:

- Single connection instance shared across the application
- Automatic initialization on first access
- Prepared statements for optimal performance
- Foreign keys enabled for data integrity
- WAL mode enabled for better concurrency

## Storage Architecture

### Cloudflare R2 Bucket

The application uses Cloudflare R2 for object storage, organized in a hierarchical structure:

```
bucket/
├── username1/
│   ├── username1-2024-02-20_14-30-00.mp4
│   └── username1-2024-02-21_15-45-00.mp4
├── username2/
│   └── username2-2024-02-19_12-00-00.mp4
├── previewszz/              # Marker file to handle pagination
└── previews/
    ├── 2024-02-20_14-30-00/
    │   ├── segment_01.mp4
    │   ├── segment_02.mp4
    │   └── segment_03.mp4
    └── 2024-02-21_15-45-00/
        ├── segment_01.mp4
        └── segment_02.mp4
```

#### File Organization

1. Main Videos
   - Stored directly under username folders
   - Filename format: `username-YYYY-MM-DD_HH-mm-ss.mp4`
   - Original video files in MP4 format

2. Preview Segments
   - Stored in `previews/` directory
   - Organized by original video timestamp
   - Multiple segments per video for efficient preview loading

3. Pagination Marker
   - `previewszz/` is a special marker file used for R2 bucket listing pagination
   - When listing bucket contents, this marker helps skip the `previews/` directory
   - Ensures efficient listing of main video files without including preview segments
   - Used in combination with R2's `StartAfter` parameter for proper pagination

### Access Control

- Presigned URLs used for secure, temporary access
- URLs expire after 1 hour (3600 seconds)
- Separate preview and full video access URLs

## API Integration

The system integrates the database and storage through several API endpoints:

1. Video Management
   - `/api/videos`: List videos with pagination and filtering
   - `/api/video`: Get single video details and access URLs
   - `/api/video/delete`: Remove video and associated previews

2. User Interactions
   - `/api/setFavorite`: Toggle favorite status
   - `/api/video/seen`: Update last watched timestamp

3. Data Organization
   - Videos can be filtered by model/username
   - Sorting available by date, quality (prediction), or size
   - Support for favorite and unseen video filters

## Performance Considerations

1. Database
   - WAL mode for concurrent access
   - Prepared statements for query optimization
   - Indexes on frequently queried columns

2. Storage
   - Preview segments for faster loading
   - Presigned URLs to reduce backend load
   - Organized structure for efficient access

3. API
   - Pagination to handle large datasets
   - Efficient joins and filtering in queries
   - Proper error handling and status codes
