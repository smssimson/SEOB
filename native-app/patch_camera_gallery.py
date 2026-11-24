"""Patch Capacitor Camera's Android MediaStore insertion before APK compilation.
Only publishes complete JPEGs with explicit capture date and preserved EXIF.
Fail closed if the upstream implementation changes.
"""
from pathlib import Path
root=Path(__file__).resolve().parent/"build"
java=root/"node_modules/@capacitor/camera/android/src/main/java/com/capacitorjs/plugins/camera/CameraPlugin.java"
s=java.read_text(encoding="utf-8")
start=s.index("                    ContentResolver resolver = getContext().getContentResolver();",s.index("boolean saveToGallery = call.getBoolean"))
end=s.index("                } else {",start)
old=s[start:end]
assert "resolver.insert" in old and "openOutputStream" in old and "bitmap.compress" in old,old
new="""                    // S:ARCH: do not expose an empty/undated MediaStore item.
                    ContentResolver resolver = getContext().getContentResolver();
                    final long capturedAt = System.currentTimeMillis();
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileToSave.getName());
                    values.put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg");
                    values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DCIM);
                    values.put(MediaStore.Images.Media.DATE_TAKEN, capturedAt);
                    values.put(MediaStore.MediaColumns.IS_PENDING, 1);
                    File completeJpeg = File.createTempFile("sarch-gallery-", ".jpg", getContext().getCacheDir());
                    Uri uri = null;
                    boolean published = false;
                    try {
                        try (FileOutputStream out = new FileOutputStream(completeJpeg)) {
                            bitmapOutputStream.writeTo(out);
                        }
                        exif.copyExif(completeJpeg.getAbsolutePath());
                        androidx.exifinterface.media.ExifInterface tags =
                            new androidx.exifinterface.media.ExifInterface(completeJpeg.getAbsolutePath());
                        String stamp = new java.text.SimpleDateFormat("yyyy:MM:dd HH:mm:ss", Locale.US)
                            .format(new java.util.Date(capturedAt));
                        String offset = new java.text.SimpleDateFormat("XXX", Locale.US)
                            .format(new java.util.Date(capturedAt));
                        tags.setAttribute("DateTime", stamp);
                        tags.setAttribute("DateTimeOriginal", stamp);
                        tags.setAttribute("DateTimeDigitized", stamp);
                        tags.setAttribute("OffsetTime", offset);
                        tags.setAttribute("OffsetTimeOriginal", offset);
                        tags.setAttribute("OffsetTimeDigitized", offset);
                        tags.saveAttributes();
                        uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                        if (uri == null) throw new IOException("Failed to create MediaStore record.");
                        try (InputStream in = new java.io.FileInputStream(completeJpeg);
                             OutputStream out = resolver.openOutputStream(uri)) {
                            if (out == null) throw new IOException("Failed to open MediaStore output.");
                            byte[] bytes = new byte[65536];
                            int n;
                            while ((n = in.read(bytes)) != -1) out.write(bytes, 0, n);
                            out.flush();
                        }
                        ContentValues ready = new ContentValues();
                        ready.put(MediaStore.Images.Media.DATE_TAKEN, capturedAt);
                        ready.put(MediaStore.MediaColumns.IS_PENDING, 0);
                        if (resolver.update(uri, ready, null, null) != 1)
                            throw new IOException("Failed to publish gallery photo.");
                        published = true;
                    } finally {
                        completeJpeg.delete();
                        if (!published && uri != null) {
                            try { resolver.delete(uri, null, null); } catch (Exception ignored) {}
                        }
                    }
"""
java.write_text(s[:start]+new+s[end:],encoding="utf-8")
print("Camera MediaStore timestamp + EXIF + pending publication patch applied.")
