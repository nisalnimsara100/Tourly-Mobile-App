/*
Simple uploader for `app/data/feed_posts.json` into Firestore.

Usage:
1) Place your Firebase service account JSON at the project root as `serviceAccountKey.json`
   OR set the environment variable GOOGLE_APPLICATION_CREDENTIALS to its path.
2) From project root run:
   node scripts/upload_feed_posts.js

What it does:
- Writes categories to document: `meta/feed_categories` (object of category->color)
- Writes each post to collection: `feed_posts` with doc id = post.id
  - uploadedAt is converted to Firestore Timestamp
  - adds createdAt server timestamp

Note: This script uses the Firebase Admin SDK and needs a service account.
*/

const fs = require('fs');
const path = require('path');

function exitWith(msg) {
  console.error(msg);
  process.exit(1);
}

(async function main() {
  try {
    const projectRoot = process.cwd();
    const dataPath = path.join(projectRoot, 'app', 'data', 'feed_posts.json');

    // load .env if present so GOOGLE_APPLICATION_CREDENTIALS can be read
    try {
      require('dotenv').config({ path: path.join(projectRoot, '.env') });
    } catch (_e) {
      // ignore if dotenv isn't installed; env may already be set
    }

    if (!fs.existsSync(dataPath)) {
      exitWith(`Could not find feed_posts.json at ${dataPath}`);
    }

    const raw = fs.readFileSync(dataPath, 'utf8');
    const payload = JSON.parse(raw);

    // find service account
    const envKey = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    let keyPath = envKey;

    // fallback to common filenames in project root
    if (!keyPath) {
      const candidate = path.join(projectRoot, 'serviceAccountKey.json');
      if (fs.existsSync(candidate)) keyPath = candidate;
    }

    if (!keyPath) {
      exitWith(`No service account key found. Provide a service account JSON and either set GOOGLE_APPLICATION_CREDENTIALS to its path or place it at ${path.join(projectRoot, 'serviceAccountKey.json')}`);
    }

    // resolve relative paths (like './file.json' from .env) to project root
    if (!path.isAbsolute(keyPath)) {
      const resolved = path.join(projectRoot, keyPath);
      if (fs.existsSync(resolved)) keyPath = resolved;
      // otherwise keep as-is and let fs check below fail with clear message
    }

    if (!fs.existsSync(keyPath)) {
      exitWith(`Service account key not found at path: ${keyPath}`);
    }

    // initialize admin
    const admin = require('firebase-admin');
    // read and parse the key instead of require() to avoid module resolution issues
    const keyRaw = fs.readFileSync(keyPath, 'utf8');
    let key;
    try {
      key = JSON.parse(keyRaw);
    } catch (err) {
      exitWith(`Failed to parse service account JSON at ${keyPath}: ${err.message}`);
    }

    admin.initializeApp({ credential: admin.credential.cert(key) });
    const db = admin.firestore();

    // Upload categories
    if (payload.categories) {
      console.log('Uploading categories...');
      await db.doc('meta/feed_categories').set(payload.categories);
      console.log('Categories uploaded to meta/feed_categories');
    }

    // Upload posts
    if (Array.isArray(payload.posts)) {
      console.log(`Uploading ${payload.posts.length} posts...`);
      for (const post of payload.posts) {
        const docRef = db.collection('feed_posts').doc(post.id);

        // Prepare data
        const docData = Object.assign({}, post);
        if (post.uploadedAt) {
          const d = new Date(post.uploadedAt);
          if (!isNaN(d.getTime())) {
            docData.uploadedAt = admin.firestore.Timestamp.fromDate(d);
          } else {
            delete docData.uploadedAt;
          }
        }

        // add server timestamp for createdAt
        docData.createdAt = admin.firestore.FieldValue.serverTimestamp();

        await docRef.set(docData, { merge: true });
        console.log(`  - uploaded ${post.id}`);
      }
      console.log('All posts uploaded.');
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Upload failed:', err);
    process.exit(1);
  }
})();
