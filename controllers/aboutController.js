const db = require('../config/db');

exports.getAbout = async (req, res) => {
  try {
    const [about] = await db.query('SELECT description FROM about WHERE id = 1');
    if (about.length === 0) {
      return res.status(404).json({ message: 'About data not found' });
    }

    const [imagesResult] = await db.query('SELECT image_url FROM about_images WHERE about_id = 1');
    const images = imagesResult.map(img => img.image_url);

    res.json({
      description: about[0].description,
      images: images
    });
  } catch (error) {
    console.error('Error fetching about data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateAbout = async (req, res) => {
    const { description, images } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // Update description
        await connection.query('UPDATE about SET description = ? WHERE id = 1', [description]);

        // Clear old images
        await connection.query('DELETE FROM about_images WHERE about_id = 1');

        // Insert new images
        if (images && images.length > 0) {
            const imageInserts = images.map(url => {
                return connection.query('INSERT INTO about_images (about_id, image_url) VALUES (1, ?)', [url]);
            });
            await Promise.all(imageInserts);
        }

        await connection.commit();
        res.json({ message: 'About section updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating about data:', error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
};
