import fs from 'fs';

const BASE_URL = 'http://localhost:5000/api';

async function extractImages() {
  console.log('🔄 Fetching data from API...');
  
  try {
    const [menuRes, categoriesRes] = await Promise.all([
      fetch(`${BASE_URL}/menu`),
      fetch(`${BASE_URL}/categories`)
    ]);

    const products = await menuRes.json();
    const categories = await categoriesRes.json();

    const imageUrls = new Set();

    products.forEach(p => {
      if (p.image) imageUrls.add(p.image);
    });

    categories.forEach(c => {
      if (c.image) imageUrls.add(c.image);
    });

    const list = Array.from(imageUrls).sort();
    
    fs.writeFileSync('extracted_images.json', JSON.stringify(list, null, 2));
    fs.writeFileSync('extracted_images.txt', list.join('\n'));

    console.log(`✅ Extracted ${list.length} unique image URLs.`);
    console.log('📂 Saved to extracted_images.json and extracted_images.txt');
    
    // Also print a few matches
    console.log('\nSample URLs:');
    list.slice(0, 5).forEach(url => console.log(`- ${url}`));

  } catch (err) {
    console.error('❌ Extraction failed:', err.message);
  }
}

extractImages();
