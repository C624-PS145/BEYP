const db = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const [profile] = await db.query('SELECT name, profile_image AS profileImage, description FROM profile WHERE id = 1');
    if (profile.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
    const { name, profileImage, description } = req.body;
    try {
        await db.query(
            'UPDATE profile SET name = ?, profile_image = ?, description = ? WHERE id = 1',
            [name, profileImage, description]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
