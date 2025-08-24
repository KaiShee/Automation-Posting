# Dynamic Image Management System

This system allows you to dynamically manage images for your campaigns without hardcoding them in the database. You can now simply put images in a folder and they'll be automatically detected and served.

## 🚀 Features

- **Dynamic Image Detection**: Automatically detects all images in campaign folders
- **Mobile-Friendly Downloads**: Multiple images are downloaded as ZIP files (solves mobile browser limitations)
- **Admin Interface**: Web-based interface to upload and manage images
- **No Database Changes**: Images are stored as files, not in the database
- **Automatic Optimization**: Images are served with proper caching headers

## 📁 Folder Structure

```
backend/
├── images/
│   ├── demo/           # Campaign ID
│   │   ├── image1.jpg
│   │   ├── image2.png
│   │   └── image3.webp
│   ├── campaign1/      # Another campaign
│   │   ├── product1.jpg
│   │   └── product2.jpg
│   └── campaign2/
│       └── banner.png
```

## 🛠️ How to Use

### Method 1: Manual File Upload (Recommended)

1. **Create campaign folder**:
   ```bash
   mkdir -p backend/images/YOUR_CAMPAIGN_ID
   ```

2. **Add images to the folder**:
   - Copy your images to `backend/images/YOUR_CAMPAIGN_ID/`
   - Supported formats: JPG, PNG, GIF, WebP
   - First image becomes the default selected image

3. **Restart the backend server**:
   ```bash
   cd backend
   npm install  # Install new dependencies
   npm run dev
   ```

### Method 2: Web Admin Interface

1. **Access admin panel**:
   ```
   http://localhost:5173/admin?c=YOUR_CAMPAIGN_ID
   ```

2. **Upload images**:
   - Click "Choose Files" and select your images
   - Images are automatically uploaded to the correct folder
   - You can delete images using the delete button

## 🔧 Technical Details

### API Endpoints

- `GET /api/campaigns/:id/images` - Get all images for a campaign
- `GET /api/images/:campaignId/:filename` - Serve an image file
- `GET /api/download/:campaignId?images=img1,img2` - Download multiple images as ZIP
- `POST /api/upload/:campaignId` - Upload images (admin only)
- `DELETE /api/images/:campaignId/:filename` - Delete an image (admin only)

### Image Object Structure

```json
{
  "id": "img1",
  "url": "/api/images/demo/image1.jpg",
  "alt": "image1",
  "selected": true,
  "filename": "image1.jpg"
}
```

### Frontend Changes

- **Automatic Detection**: Images are automatically fetched from the folder
- **ZIP Downloads**: Multiple images are downloaded as ZIP files
- **Fallback**: If no folder images, falls back to database images

## 📱 Mobile Download Solution

**Problem**: Mobile browsers often block multiple downloads or require user interaction for each download.

**Solution**: 
- Single image: Direct download (original method)
- Multiple images: ZIP file download (new method)

This ensures users can download all selected images even on mobile devices.

## 🔄 Migration from Old System

The new system is **backward compatible**. If no images are found in the folder, it will fall back to the database images.

### Steps to migrate:

1. **Keep existing database images** (they serve as fallback)
2. **Create campaign folder**: `backend/images/YOUR_CAMPAIGN_ID/`
3. **Add your images** to the folder
4. **Test the system** - new images should appear automatically
5. **Remove database images** once you're satisfied (optional)

## 🎯 Benefits

1. **Easy Management**: Just drop images in a folder
2. **No Database Changes**: No need to update database records
3. **Mobile Friendly**: ZIP downloads work on all devices
4. **Scalable**: Add unlimited images per campaign
5. **Fast**: Images are served directly from filesystem
6. **Cached**: Proper caching headers for performance

## 🚨 Important Notes

- **File Names**: Use simple names without special characters
- **File Size**: 10MB limit per image
- **Formats**: JPG, PNG, GIF, WebP only
- **Permissions**: Ensure the backend has write access to the images folder
- **Backup**: Keep backups of your images folder

## 🔍 Troubleshooting

### Images not appearing?
1. Check folder path: `backend/images/CAMPAIGN_ID/`
2. Verify file formats are supported
3. Check file permissions
4. Restart the backend server

### Upload not working?
1. Check file size (10MB limit)
2. Verify file format
3. Check folder permissions
4. Look at backend console for errors

### Download issues?
1. Single images: Check browser download settings
2. Multiple images: ZIP should work on all devices
3. Check network connectivity

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the backend console for errors
3. Verify folder structure and permissions
4. Ensure all dependencies are installed (`npm install` in backend folder)
