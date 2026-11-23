# Aérin — GitHub Pages photo memory library

## Structure
- `index.html`, `styles.css`, `app.js`: app
- `assets.json`: content catalog
- `photos/`: still photos
- `videos/`: video files
- `gaussians/`: Gaussian splat `.splat` or `.ply` assets
- `thumbnails/`: previews for spatial captures

This is a static GitHub Pages site. To add media, upload the files to the corresponding folder and edit `assets.json` to reference relative paths. The browser cannot list a GitHub repository's folders automatically on Pages.

## Catalog format
```json
{
  "albums": [
    {"id":"paris","title":"Paris","location":"Paris, France","count":"248 photos","cover":"photos/paris-cover.jpg","items":[
      {"title":"Seine","src":"photos/seine.jpg"}
    ]}
  ],
  "photos": [{"title":"Paris","src":"photos/photo.jpg"}],
  "videos": [{"title":"Walk","src":"videos/walk.mp4","thumbnail":"thumbnails/walk.jpg"}],
  "gaussians": [{"title":"Courtyard scan","src":"gaussians/courtyard.splat","thumbnail":"thumbnails/courtyard.jpg","location":"Paris"}]
}
```
**Path rules:** use paths relative to the site root, case-sensitive, no leading slash for project-repo subpaths. If deploying to `username.github.io/repo/`, relative paths work.

## Gaussian viewer
Splat files are not loaded until the user opens a capture and clicks **Optimize & load**. The viewer code is imported on demand from a CDN, so it does not add initial-page loading cost. Orbit and zoom are enabled in the viewer. First scene load can still use significant GPU memory; use compressed/downsized splats and preview thumbnails for large captures.

## Deploy
1. Commit this folder to a GitHub repository.
2. In Settings → Pages, publish from the branch and root (or `/docs`).
3. Add files to folders, then update `assets.json` and commit.
